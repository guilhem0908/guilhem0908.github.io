"""Regenerate public/media/poster.jpg (the lobby, world only: hero image of the static page)
from the built site. The 1200 x 630 share image has its own script: tools/og.py.

  npm run build && python tools/poster.py && npm run build
"""
import functools
import http.server
import os
import socketserver
import threading
import time
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
PORT = int(os.environ.get('NAVRUN_PORT', '4321'))
OUT = ROOT / 'public' / 'media'
TMP = ROOT / '_work'
TMP.mkdir(exist_ok=True)


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


socketserver.TCPServer.allow_reuse_address = True
httpd = socketserver.ThreadingTCPServer(('127.0.0.1', PORT), functools.partial(Quiet, directory=str(ROOT / 'dist')))
threading.Thread(target=httpd.serve_forever, daemon=True).start()

with sync_playwright() as pw:
    b = pw.chromium.launch(headless=True, args=['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader', '--enable-webgl'])
    for name, (w, h), hide in (
        # main * as well: the run sets visibility on the hero inline, which a hidden parent does not override
        ('poster', (1440, 900), 'main, main *, .top, .hud, .lens, .intro'),
    ):
        page = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1).new_page()
        page.goto(f'http://127.0.0.1:{PORT}/?nointro', wait_until='domcontentloaded')
        page.wait_for_function('() => window.__navrun && window.__world && window.__world.info', timeout=60000)
        page.add_style_tag(content=f'{hide} {{ visibility: hidden !important; }}')
        page.evaluate('() => { window.__world.pointerActive = false; }')
        time.sleep(3.0)
        png = TMP / f'{name}.png'
        page.screenshot(path=str(png))
        Image.open(png).convert('RGB').save(OUT / f'{name}.jpg', quality=82, optimize=True, progressive=True)
        png.unlink()
        print(name, (OUT / f'{name}.jpg').stat().st_size, 'bytes')
    b.close()
httpd.shutdown()
