"""Proof that skipping the rooms the camera cannot see changes nothing on screen.

  python tools/sight.py [out_dir] [steps]

Along the whole run (steps positions, default 70), the world is frozen in time and the same frame is
drawn twice: with the room culling of the depth sort (a room next door is drawn only in the wedge seen
through its door, the others not at all) and with every room drawn. The two pictures are compared.
A position fails when more than 0.5 % of the pixels differ by more than 24 levels: that would be
something popping in or out of view. Prints the worst positions and how many Gaussians the culling saves.
With out_dir, the two pictures and their difference are written for the worst position.
Exit code 1 when a position fails. Port: NAVRUN_PORT (default 4321).
"""
import functools
import http.server
import io
import os
import socketserver
import sys
import threading
import time
from pathlib import Path

from PIL import Image, ImageChops
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
PORT = int(os.environ.get('NAVRUN_PORT', '4321'))
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else None
STEPS = int(sys.argv[2]) if len(sys.argv) > 2 else 70


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


socketserver.TCPServer.allow_reuse_address = True
httpd = socketserver.ThreadingTCPServer(('127.0.0.1', PORT), functools.partial(Quiet, directory=str(ROOT / 'dist')))
httpd.daemon_threads = True
threading.Thread(target=httpd.serve_forever, daemon=True).start()

rows = []
with sync_playwright() as pw:
    b = pw.chromium.launch(headless=True, args=['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-webgl'])
    page = b.new_context(viewport={'width': 1280, 'height': 800}, device_scale_factor=1).new_page()
    # no video may run: the clock of a video cannot be stopped, and the feed on the wall would differ between two captures
    page.add_init_script('HTMLMediaElement.prototype.play = () => Promise.resolve();')
    page.goto(f'http://127.0.0.1:{PORT}/?nointro', wait_until='domcontentloaded')
    page.wait_for_function('() => window.__navrun && window.__world && window.__world.info', timeout=60000)
    # the world only: no type, no instruments; and a clock we can stop
    page.add_style_tag(content='main, main *, .top, .hud, .lens, .intro, .cue { visibility: hidden !important; }')
    page.evaluate("""() => {
      const w = window.__world, f = w.frame.bind(w);
      window.__freeze = false;
      w.frame = (dt) => f(window.__freeze ? 0 : dt);
      w.setLevel(0);
    }""")
    time.sleep(1.0)
    # the part of the run that is walked: from the hero to the moment the camera leaves through the roof
    y0, y1 = page.evaluate("() => { const n = window.__navrun; return [0, n.D.yOf('lab', 0.02)]; }")
    canvas = page.locator('#world')
    worst = None
    for i in range(STEPS):
        y = y0 + (y1 - y0) * i / (STEPS - 1)
        page.evaluate('y => { window.__freeze = false; window.__navrun.jump(y); }', y)
        time.sleep(1.1)                                   # the camera settles
        page.evaluate('() => { window.__freeze = true; window.__world.noSight = false; }')
        time.sleep(0.3)                                   # a sort with the culling
        a = Image.open(io.BytesIO(canvas.screenshot(type='png'))).convert('RGB')
        na = page.evaluate('() => window.__world.visibleCount')
        page.evaluate('() => { window.__world.noSight = true; }')
        time.sleep(0.3)                                   # a sort of everything
        c = Image.open(io.BytesIO(canvas.screenshot(type='png'))).convert('RGB')
        nb = page.evaluate('() => window.__world.visibleCount')
        where = page.evaluate("""(y) => { const D = window.__navrun.D; let best = '', top = -1e9, p = 0;
          for (const k in D.sections) { const s = D.sections[k]; if (y >= s.top - 1 && s.top > top) { best = k; top = s.top; p = (y - s.top) / s.span; } }
          return best + ' ' + p.toFixed(2); }""", y)
        diff = ImageChops.difference(a, c).convert('L')
        hist = diff.histogram()
        share = sum(hist[25:]) / (diff.width * diff.height)
        mean = sum(v * n for v, n in enumerate(hist)) / (diff.width * diff.height)
        rows.append((share, mean, where, na, nb))
        if worst is None or share > worst[0]:
            worst = (share, where, a, c, diff)
    b.close()
httpd.shutdown()

bad = [r for r in rows if r[0] > 0.005]
print(f'{len(rows)} positions, {len(bad)} with a visible difference')
print(f'Gaussians drawn, mean over the run: {sum(r[3] for r in rows) / len(rows):,.0f} with the culling, {sum(r[4] for r in rows) / len(rows):,.0f} without')
print('largest differences (share of pixels that differ by more than 24 levels, mean difference in levels):')
for share, mean, where, na, nb in sorted(rows, reverse=True)[:8]:
    print(f'  {where:<12} {share * 100:6.3f} %   mean {mean:5.2f}   {na:>7,} / {nb:>7,} Gaussians')
if OUT and worst:
    OUT.mkdir(parents=True, exist_ok=True)
    w, h = worst[2].size
    sheet = Image.new('RGB', (w * 3, h))
    sheet.paste(worst[2], (0, 0)); sheet.paste(worst[3], (w, 0)); sheet.paste(worst[4].point(lambda v: min(255, v * 6)).convert('RGB'), (w * 2, 0))
    sheet.save(OUT / 'sight_worst.jpg', quality=88)
    print('worst position:', worst[1], '->', OUT / 'sight_worst.jpg', '(culled | everything | difference x6)')
sys.exit(1 if bad else 0)
