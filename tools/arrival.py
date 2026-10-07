"""Checks the first seconds of the home run on the built site: the visitor must understand at once
that scrolling moves forward, and the intro must never hold them.

  python tools/arrival.py [home] [out_dir]      home: the path of a home page without slashes (fr), default the English one

What it checks, in headless Chromium:
  - the page opens less than 3 s after the intro starts, and the cue is fully visible a second later
  - lights run along the path, and after a few idle seconds the camera eases down the path and comes back
  - Space, ArrowDown and PageDown advance the run; the cue and the lights are gone after the first scroll
  - a key, the wheel or a click DURING the intro opens the page at once, and that same gesture scrolls it
  - the Start button scrolls to the first room
  - a touch device reads "swipe", the cue fits the screen, there is no horizontal scroll at 390 px
  - reduced motion with the 3D run opted in: a static cue, no peek, no lights
  - reduced motion (the static page): a static cue and no button
With out_dir, screenshots of the cue (desktop, phone, static page) are written there.
Exit code 1 when a check fails. The server lives in this process. Port: NAVRUN_PORT (default 4321).
"""
import functools
import http.server
import json
import os
import socketserver
import sys
import threading
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
PORT = int(os.environ.get('NAVRUN_PORT', '4321'))
_home = (sys.argv[1] if len(sys.argv) > 1 else '').strip('/.')
HOME = f'/{_home}/' if _home else '/'
OUT = Path(sys.argv[2]) if len(sys.argv) > 2 else None
ARGS = ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-webgl']


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


socketserver.TCPServer.allow_reuse_address = True
httpd = socketserver.ThreadingTCPServer(('127.0.0.1', PORT), functools.partial(Quiet, directory=str(ROOT / 'dist')))
httpd.daemon_threads = True
threading.Thread(target=httpd.serve_forever, daemon=True).start()
BASE = f'http://127.0.0.1:{PORT}'
ok = True


def check(name, cond, detail=''):
    global ok
    ok = ok and bool(cond)
    print(('PASS ' if cond else 'FAIL ') + name + (f'  [{detail}]' if detail else ''))


STATE = """() => ({
  t: performance.now(), y: scrollY, cls: document.documentElement.className,
  s: window.__world ? window.__world.cur.s : -1, invite: window.__world ? window.__world.cur.invite : -1,
  train: window.__world ? window.__world.cur.train : -1,
  cue: (() => { const c = document.querySelector('.cue'); if (!c) return null; const cs = getComputedStyle(c); const r = c.getBoundingClientRect();
    return { op: +cs.opacity, vis: cs.visibility, disp: cs.display, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; })(),
  mark: (() => { const m = document.querySelector('.cue__mark'); return m ? getComputedStyle(m, '::after').animationName : null; })(),
  hud: (() => { const h = document.querySelector('.hud'); return h ? +getComputedStyle(h).opacity : -1; })(),
})"""

with sync_playwright() as pw:
    b = pw.chromium.launch(headless=True, args=ARGS)

    def new(path=HOME, w=1440, h=900, mobile=False, **kw):
        ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2 if mobile else 1, is_mobile=mobile, has_touch=mobile, **kw)
        page = ctx.new_page()
        logs = []
        page.on('console', lambda m: logs.append(f'[{m.type}] {m.text}') if m.type in ('error', 'warning') else None)
        page.on('pageerror', lambda e: logs.append(f'[pageerror] {e}'))
        page.goto(BASE + path, wait_until='domcontentloaded')
        return ctx, page, logs

    def opened(page, timeout=20000):
        page.wait_for_function("() => document.documentElement.classList.contains('intro-done')", timeout=timeout)

    # 1. the intro runs to its end: timings, cue, lights, peek, then the keys
    ctx, page, logs = new()
    page.wait_for_function('() => window.__introStart', timeout=60000)
    t_intro = page.evaluate('() => window.__introStart')
    opened(page)
    st = page.evaluate(STATE)
    print(f"the page opens {st['t'] - t_intro:.0f} ms after the intro starts, {st['t']:.0f} ms after navigation")
    check('the page opens less than 3 s after the intro starts', st['t'] - t_intro < 3000, f"{st['t'] - t_intro:.0f} ms")
    time.sleep(1.0)
    st = page.evaluate(STATE)
    check('cue fully visible a second later', st['cue'] and st['cue']['op'] > 0.9 and st['cue']['vis'] == 'visible', json.dumps(st['cue']))
    check('instruments visible a second later', st['hud'] > 0.8, f"opacity {st['hud']:.2f}")
    check('cue animated', st['mark'] not in (None, 'none'), str(st['mark']))
    if OUT:
        OUT.mkdir(parents=True, exist_ok=True)
        page.screenshot(path=str(OUT / 'cue_desktop.png'))
    time.sleep(1.0)
    check('lights run along the path', page.evaluate(STATE)['invite'] > 0.8)
    peak, t0 = 0, time.time()
    while time.time() - t0 < 6.5:
        peak = max(peak, page.evaluate(STATE)['s'])
        time.sleep(0.1)
    check('peek: the camera eases down the path', peak > 0.8, f'{peak:.2f} m')
    time.sleep(2.2)
    st = page.evaluate(STATE)
    check('peek: and comes back, without scrolling the page', st['s'] < 0.35 and st['y'] == 0, f"s {st['s']:.2f} m, y {st['y']}")
    page.keyboard.press('Space')
    time.sleep(1.0)
    st = page.evaluate(STATE)
    check('Space advances the run', st['y'] > 200, f"y {st['y']}")
    check('cue gone after the first scroll', st['cue']['op'] < 0.05 or st['cue']['vis'] == 'hidden', json.dumps(st['cue']))
    check('lights off after the first scroll', st['invite'] < 0.3, f"{st['invite']:.2f}")
    y0 = st['y']
    for _ in range(3):
        page.keyboard.press('ArrowDown')
    time.sleep(0.7)
    y1 = page.evaluate(STATE)['y']
    check('ArrowDown advances the run', y1 > y0 + 60, f'{y0} -> {y1}')
    page.keyboard.press('PageDown')
    time.sleep(0.9)
    y2 = page.evaluate(STATE)['y']
    check('PageDown advances the run', y2 > y1 + 400, f'{y1} -> {y2}')
    check('console clean', not logs, '; '.join(logs[:3]))
    ctx.close()

    # 2. a key during the intro
    for key in ('ArrowDown', 'Space', 'PageDown'):
        ctx, page, logs = new()
        page.wait_for_function('() => window.__introStart', timeout=60000)
        time.sleep(0.5)
        t0 = page.evaluate('() => performance.now()')
        page.keyboard.press(key)
        opened(page, 3000)
        t1 = page.evaluate('() => performance.now()')
        time.sleep(0.8)
        st = page.evaluate(STATE)
        check(f'{key} during the intro opens the page at once and scrolls it', t1 - t0 < 250 and st['y'] > 20, f"opened in {t1 - t0:.0f} ms, y {st['y']}")
        ctx.close()

    # 3. the wheel during the intro
    ctx, page, logs = new()
    page.wait_for_function('() => window.__introStart', timeout=60000)
    time.sleep(0.5)
    page.mouse.move(700, 500)
    t0 = page.evaluate('() => performance.now()')
    page.mouse.wheel(0, 600)
    opened(page, 3000)
    t1 = page.evaluate('() => performance.now()')
    time.sleep(0.9)
    st = page.evaluate(STATE)
    check('the wheel during the intro opens the page at once and that gesture scrolls it', t1 - t0 < 250 and st['y'] > 200, f"opened in {t1 - t0:.0f} ms, y {st['y']}")
    time.sleep(1.0)
    st = page.evaluate(STATE)
    check('the scene finishes training behind the hero', st['train'] > 0.999, f"{st['train']:.3f}")
    ctx.close()

    # 4. a click during the intro, then the Start button
    ctx, page, logs = new()
    page.wait_for_function('() => window.__introStart', timeout=60000)
    time.sleep(0.5)
    t0 = page.evaluate('() => performance.now()')
    page.mouse.click(900, 300)
    opened(page, 3000)
    t1 = page.evaluate('() => performance.now()')
    check('a click during the intro opens the page at once', t1 - t0 < 250, f'{t1 - t0:.0f} ms')
    time.sleep(1.2)
    page.click('[data-start]')
    time.sleep(2.6)
    st = page.evaluate("() => ({y: scrollY, want: window.__navrun.D.yOf('aist', 0.05), title: document.querySelector('.sec--aist .beat--title').classList.contains('is-on')})")
    check('the Start button scrolls to the first room', abs(st['y'] - st['want']) < 4 and st['title'], json.dumps(st))
    ctx.close()

    # 5. a touch device
    ctx, page, logs = new(w=390, h=844, mobile=True)
    opened(page, 60000)
    time.sleep(1.2)
    st = page.evaluate(STATE)
    words = page.evaluate("() => [...document.querySelectorAll('.cue__hint span')].filter(s => getComputedStyle(s).display !== 'none' && s.textContent.trim()).map(s => s.textContent)")
    check('touch: the cue says swipe', len(words) == 1 and words[0] == page.evaluate("() => document.querySelector('.cue__touch').textContent"), str(words))
    c = st['cue']
    check('touch: the cue is visible and fits the screen', c['op'] > 0.9 and c['x'] >= 0 and c['x'] + c['w'] <= 390 and c['y'] + c['h'] <= 844, json.dumps(c))
    ov = page.evaluate('() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]')
    check('no horizontal scroll at 390 px', ov[0] <= ov[1], str(ov))
    if OUT:
        page.screenshot(path=str(OUT / 'cue_mobile.png'))
    ctx.close()

    # 6. reduced motion, 3D opted in
    ctx, page, logs = new(path=HOME + '?motion', reduced_motion='reduce')
    opened(page, 60000)
    time.sleep(1.0)
    st = page.evaluate(STATE)
    check('reduced motion (3D): the cue is shown, static', st['cue']['op'] > 0.9 and st['mark'] == 'none', f"{st['cue']['op']} {st['mark']}")
    peak, t0 = 0, time.time()
    while time.time() - t0 < 6.5:
        st = page.evaluate(STATE)
        peak = max(peak, st['s'])
        time.sleep(0.2)
    check('reduced motion (3D): no peek, no lights', peak < 0.05 and st['invite'] < 0.05, f"s {peak:.2f} m, lights {st['invite']:.2f}")
    ctx.close()

    # 7. reduced motion, the static page
    ctx, page, logs = new(reduced_motion='reduce')
    time.sleep(1.5)
    st = page.evaluate(STATE)
    start = page.evaluate("() => getComputedStyle(document.querySelector('.cue__start')).display")
    check('reduced motion (static page): a static cue, no button', st['cue'] and st['cue']['disp'] != 'none' and 'gl' not in st['cls'].split() and start == 'none', json.dumps(st['cue']))
    check('console clean (static page)', not logs, '; '.join(logs[:3]))
    if OUT:
        page.screenshot(path=str(OUT / 'cue_static.png'))
    ctx.close()
    b.close()
httpd.shutdown()
print('ALL PASS' if ok else 'SOME CHECKS FAILED')
sys.exit(0 if ok else 1)
