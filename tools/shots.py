"""Art-director loop: serve dist/ and capture screenshots with headless Chromium.

  python tools/shots.py <out_dir> home    [desktop|mobile] [sec:p,sec:p,...]
  python tools/shots.py <out_dir> intro   [desktop|mobile]
  python tools/shots.py <out_dir> page    <path> [desktop|mobile]   (path without leading slash: work/aist-360-navigation, lab, or . for home)
  python tools/shots.py <out_dir> static  <path> [desktop|mobile]   (no WebGL, reduced motion)

The server lives in this process and stops with it. Port: NAVRUN_PORT (default 4321).
The run of another language: NAVRUN_HOME=fr (the path of its home page, without slashes).
Every run prints console errors, failed requests and the horizontal overflow of the page.
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
DIST = ROOT / 'dist'
PORT = int(os.environ.get('NAVRUN_PORT', '4321'))
_home = os.environ.get('NAVRUN_HOME', '').strip('/')
HOME_PATH = f'/{_home}/' if _home else '/'
GL = ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader', '--enable-webgl',
      '--autoplay-policy=no-user-gesture-required']
NOGL = ['--disable-gpu', '--disable-webgl', '--disable-3d-apis']

out = Path(sys.argv[1])
mode = sys.argv[2]
rest = sys.argv[3:]
out.mkdir(parents=True, exist_ok=True)

HOME = [('hero', 0.0), ('aist', 0.05), ('aist', 0.2), ('aist', 0.5), ('aist', 0.66),
        ('aist', 0.8), ('aist', 0.97), ('svlr', 0.4), ('tlse', 0.25), ('tlse', 0.7),
        ('usine', 0.3), ('usine', 0.6), ('pfr', 0.4), ('pfr', 0.8), ('lab', 0.3), ('lab', 0.75),
        ('index', 0.5), ('contact', 0.0)]


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


socketserver.TCPServer.allow_reuse_address = True
httpd = socketserver.ThreadingTCPServer(('127.0.0.1', PORT), functools.partial(Quiet, directory=str(DIST)))
threading.Thread(target=httpd.serve_forever, daemon=True).start()
BASE = f'http://127.0.0.1:{PORT}'

logs, frames = [], []


def attach(page):
    page.on('console', lambda m: logs.append(f'[{m.type}] {m.text}') if m.type in ('error', 'warning') else None)
    page.on('pageerror', lambda e: logs.append(f'[pageerror] {e}'))
    page.on('requestfailed', lambda r: logs.append(f'[requestfailed] {r.url} {r.failure}'))
    page.on('response', lambda r: logs.append(f'[http {r.status}] {r.url}') if r.status >= 400 else None)


def context(browser, device, **kw):
    if device == 'mobile':
        return browser.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True, **kw)
    w, h = (int(v) for v in os.environ.get('NAVRUN_VIEWPORT', '1440x900').split('x'))  # e.g. NAVRUN_VIEWPORT=1024x768
    return browser.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1, **kw)


def shot(page, name):
    f = out / f'{name}.jpg'
    page.screenshot(path=str(f), type='jpeg', quality=84)
    frames.append(f)


def overflow(page, label):
    ov = page.evaluate('() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]')
    print(f'overflow {label}: scrollWidth={ov[0]} clientWidth={ov[1]} {"OK" if ov[0] <= ov[1] else "HORIZONTAL SCROLL"}')


def scroll_steps(page, tag, n=None):
    total = page.evaluate('() => document.documentElement.scrollHeight - innerHeight')
    vh = page.evaluate('() => innerHeight')
    n = n or max(1, min(14, round(total / (vh * 0.9)) + 1))
    for i in range(n):
        y = 0 if n == 1 else int(total * i / (n - 1))
        page.evaluate('y => window.scrollTo(0, y)', y)
        time.sleep(0.9)
        shot(page, f'{tag}_{i:02d}')
    return total


with sync_playwright() as pw:
    if mode in ('home', 'intro'):
        device = rest[0] if rest else 'desktop'
        browser = pw.chromium.launch(headless=True, args=GL)
        ctx = context(browser, device)
        page = ctx.new_page(); attach(page)
        d = 'm' if device == 'mobile' else 'd'
        if mode == 'intro':
            page.goto(BASE + HOME_PATH, wait_until='domcontentloaded')
            page.wait_for_function('() => window.__introStart', timeout=60000)
            t0 = page.evaluate('() => window.__introStart')
            for t in (0.5, 1.6, 2.8, 3.8, 5.2):
                page.wait_for_function('(a) => performance.now() - a[0] >= a[1]*1000', arg=[t0, t])
                shot(page, f'{d}_intro_{t:.1f}')
        else:
            depths = HOME
            if len(rest) > 1:
                depths = [(a.split(':')[0], float(a.split(':')[1])) for a in rest[1].split(',')]
            page.goto(BASE + HOME_PATH + '?nointro', wait_until='domcontentloaded')
            page.wait_for_function('() => window.__navrun && window.__world && window.__world.info', timeout=60000)
            time.sleep(1.5)
            info = page.evaluate('() => ({count: window.__world.info.count, len: window.__world.info.pathLen, ms: Math.round(window.__world.info.genMs), max: window.__navrun.max()})')
            print('scene', info)
            for i, (sec, p) in enumerate(depths):
                if device != 'mobile':
                    page.mouse.move(820, 520)
                page.evaluate('([s,p]) => { const n = window.__navrun; n.jump(s === "contact" ? n.max() : n.D.yOf(s, p)); }', [sec, p])
                time.sleep(2.0)
                if device != 'mobile':
                    page.evaluate('() => { window.__world.pointerActive = false; }')
                    time.sleep(0.25)
                shot(page, f'{d}{i:02d}_{sec}_{p}')
            fps = page.evaluate('() => new Promise(r => { let n=0; const t0=performance.now(); const f=()=>{ n++; if (performance.now()-t0 < 2000) requestAnimationFrame(f); else r(n/2); }; requestAnimationFrame(f); })')
            print('fps at last depth:', fps)
        overflow(page, f'home {device}')
        browser.close()
    elif mode in ('page', 'static'):
        path = '/' + rest[0].strip('/') + ('/' if rest[0].strip('/') else '')  # pass it without the leading slash from Git Bash
        device = rest[1] if len(rest) > 1 else 'desktop'
        browser = pw.chromium.launch(headless=True, args=NOGL if mode == 'static' else GL)
        ctx = context(browser, device, reduced_motion='reduce') if mode == 'static' else context(browser, device)
        page = ctx.new_page(); attach(page)
        page.goto(BASE + path, wait_until='load')
        time.sleep(1.5)
        tag = ('s' if mode == 'static' else 'p') + ('m' if device == 'mobile' else 'd') + '_' + (path.strip('/').replace('/', '-').replace('.', '') or 'home')
        total = scroll_steps(page, tag)
        print(f'{path} {device}: scrollable {total}px, html classes "{page.evaluate("() => document.documentElement.className")}"')
        overflow(page, f'{path} {device}')
        browser.close()

httpd.shutdown()

if frames:
    cols = 4
    w0, h0 = Image.open(frames[0]).size
    tw = 480 if w0 > h0 else 270
    th = int(tw * h0 / w0)
    rows = (len(frames) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * tw, rows * th), (6, 11, 58))
    for i, f in enumerate(frames):
        im = Image.open(f).convert('RGB').resize((tw, th), Image.LANCZOS)
        sheet.paste(im, ((i % cols) * tw, (i // cols) * th))
    sheet.save(out / f'sheet_{mode}_{frames[0].stem.split("_")[0]}.jpg', quality=84)

print('--- console ---')
seen = set()
for l in logs:
    if l not in seen:
        seen.add(l); print(l)
print('--- end ---')
