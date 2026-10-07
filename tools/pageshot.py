"""Full-page screenshots of built pages, for the review loop of static pages (CV, 404, lab, case studies).

  python tools/pageshot.py <out_dir> <path> [<path> ...] [--widths 1440,390] [--print]

  paths   page paths inside dist/ without the leading slash: cv  404.html  fr/cv  lab  .  (. is the home page)
  --print emulate the print media (the CV as the PDF shows it)

Prints console errors, failed requests and horizontal overflow for every capture. The server lives
in this process and stops with it. Port: NAVRUN_PORT (default 4332). Seconds to wait after load: NAVRUN_WAIT (default 1.2).
"""
import functools
import http.server
import os
import socketserver
import sys
import threading
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
PORT = int(os.environ.get('NAVRUN_PORT', '4332'))
args = sys.argv[1:]
widths = [1440, 390]
if '--widths' in args:
    i = args.index('--widths')
    widths = [int(w) for w in args[i + 1].split(',')]
    del args[i:i + 2]
printing = '--print' in args
args = [a for a in args if a != '--print']
out, paths = Path(args[0]), args[1:]
out.mkdir(parents=True, exist_ok=True)


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


socketserver.TCPServer.allow_reuse_address = True
httpd = socketserver.ThreadingTCPServer(('127.0.0.1', PORT), functools.partial(Quiet, directory=str(ROOT / 'dist')))
threading.Thread(target=httpd.serve_forever, daemon=True).start()

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, args=['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader', '--enable-webgl'])
    for p in paths:
        url_path = '/' + p.strip('/') + ('' if p.endswith('.html') or p.strip('/') == '' else '/')
        if p.strip('/') in ('', '.'):
            url_path = '/'
        for w in widths:
            logs = []
            mobile = w < 600
            ctx = browser.new_context(viewport={'width': w, 'height': 844 if mobile else 900}, device_scale_factor=2 if mobile else 1, is_mobile=mobile, has_touch=mobile)
            page = ctx.new_page()
            page.on('console', lambda m: logs.append(f'[{m.type}] {m.text}') if m.type in ('error', 'warning') else None)
            page.on('pageerror', lambda e: logs.append(f'[pageerror] {e}'))
            page.on('requestfailed', lambda r: logs.append(f'[requestfailed] {r.url}'))
            page.on('response', lambda r: logs.append(f'[http {r.status}] {r.url}') if r.status >= 400 and not r.url.endswith('404.html') else None)
            page.goto(f'http://127.0.0.1:{PORT}{url_path}', wait_until='load')
            if printing:
                page.emulate_media(media='print')
            time.sleep(float(os.environ.get('NAVRUN_WAIT', '1.2')))
            ov = page.evaluate('() => [document.documentElement.scrollWidth, document.documentElement.clientWidth, document.documentElement.scrollHeight]')
            name = (p.strip('/').replace('/', '-').replace('.', '') or 'home') + f'_{w}' + ('_print' if printing else '') + '.png'
            page.screenshot(path=str(out / name), full_page=True)
            print(f'{url_path} @{w}: {name}, height {ov[2]}px, overflow {"NONE" if ov[0] <= ov[1] else f"{ov[0]} > {ov[1]}"}')
            for l in dict.fromkeys(logs):
                print('   ', l)
            ctx.close()
    browser.close()
httpd.shutdown()
