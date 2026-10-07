"""Regenerate the 1200 x 630 share images used by every page (Open Graph and Twitter cards), captured
from a real frame of the built home page: the lobby of the run with the name set over it and one line
saying what he does. Nothing in it is drawn by hand. One image per language: public/media/og.jpg
(English) and public/media/og-fr.jpg (French, from /fr/).

  npm run build && python tools/og.py && npm run build       # every language
  python tools/og.py fr                                      # only the French one

Needs: python with `playwright` and `Pillow`; WebGL (the run). The server lives in this process
and stops with it. Port: NAVRUN_PORT (default 4332).
"""
import functools
import http.server
import os
import socketserver
import sys
import threading
import time
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
PORT = int(os.environ.get('NAVRUN_PORT', '4332'))
MEDIA = ROOT / 'public' / 'media'
TMP = ROOT / '_work'
TMP.mkdir(exist_ok=True)
# language -> (path of its home page, output file, the line: same words as the CV header)
LANGS = {
    'en': ('/', 'og.jpg', 'Robotics engineering student, 3D vision and navigation'),
    'fr': ('/fr/', 'og-fr.jpg', 'Étudiant ingénieur en robotique, vision 3D et navigation'),
}
wanted = [a for a in sys.argv[1:] if not a.startswith('-')] or list(LANGS)
for a in wanted:
    if a not in LANGS:
        raise SystemExit(f'unknown language {a!r}; known: {", ".join(LANGS)}')


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


socketserver.TCPServer.allow_reuse_address = True
httpd = socketserver.ThreadingTCPServer(('127.0.0.1', PORT), functools.partial(Quiet, directory=str(ROOT / 'dist')))
threading.Thread(target=httpd.serve_forever, daemon=True).start()

with sync_playwright() as pw:
    b = pw.chromium.launch(headless=True, args=['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader', '--enable-webgl'])
    for lang in wanted:
        home, name, line = LANGS[lang]
        out = MEDIA / name
        page = b.new_context(viewport={'width': 1200, 'height': 630}, device_scale_factor=1).new_page()
        page.goto(f'http://127.0.0.1:{PORT}{home}?nointro', wait_until='domcontentloaded')
        page.wait_for_function('() => window.__navrun && window.__world && window.__world.info', timeout=60000)
        page.add_style_tag(content='.hero__side, .top, .hud, .lens, .intro { visibility: hidden !important; }')
        page.evaluate(
            """(line) => {
              window.__world.pointerActive = false;
              const p = document.createElement('p');
              p.className = 'read';
              p.textContent = line;
              p.style.cssText = 'position:fixed;left:48px;top:44px;z-index:60;margin:0;padding:0.8rem 1.1rem;'
                + 'background:var(--deep);color:var(--paper);font-size:1.55rem;letter-spacing:0.05em;';
              document.body.appendChild(p);
            }""",
            line,
        )
        time.sleep(3.0)
        png = TMP / f'og-{lang}.png'
        page.screenshot(path=str(png))
        Image.open(png).convert('RGB').save(out, quality=84, optimize=True, progressive=True)
        png.unlink()
        print('og', lang, out.name, out.stat().st_size, 'bytes', Image.open(out).size)
        page.context.close()
    b.close()
httpd.shutdown()
