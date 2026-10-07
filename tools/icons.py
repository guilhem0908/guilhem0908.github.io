"""Draw the site icons from the design tokens (src/styles/global.css: --void, --paper, --fil).

  python tools/icons.py

Writes public/favicon.svg, public/favicon.ico (16, 32, 48 px) and public/apple-touch-icon.png
(180 px, opaque: iOS rounds the corners itself). The mark is the whole site in one glyph: a
plan of walls (paper), the planned path (red) and the robot at its end.
Needs: python with `playwright` and `Pillow`.
"""
import base64
import io
import re
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / 'public'
css = (ROOT / 'src' / 'styles' / 'global.css').read_text(encoding='utf-8')
tok = {n: re.search(rf'--{n}:\s*(#[0-9a-fA-F]{{6}})', css).group(1).upper() for n in ('void', 'paper', 'fil')}

SVG = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="{tok['void']}"/><path d="M4.5 4.5H27.5V27.5" fill="none" stroke="{tok['paper']}" stroke-width="2.6" stroke-linecap="square"/><path d="M7.5 27.5V20H14V13H21" fill="none" stroke="{tok['fil']}" stroke-width="3.2" stroke-linecap="square" stroke-linejoin="miter"/><circle cx="21" cy="13" r="3.6" fill="{tok['fil']}"/></svg>
'''
(PUBLIC / 'favicon.svg').write_text(SVG, encoding='utf-8', newline='\n')
uri = 'data:image/svg+xml;base64,' + base64.b64encode(SVG.encode()).decode()


def render(browser, size: int) -> Image.Image:
    page = browser.new_context(viewport={'width': size, 'height': size}, device_scale_factor=1).new_page()
    page.set_content(f'<body style="margin:0;background:{tok["void"]}"><img src="{uri}" width="{size}" height="{size}" style="display:block"></body>')
    page.wait_for_function('() => document.images[0].complete')
    img = Image.open(io.BytesIO(page.screenshot())).convert('RGB')
    page.context.close()
    return img


with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True)
    apple = render(browser, 180)
    apple.save(PUBLIC / 'apple-touch-icon.png', optimize=True)
    big = render(browser, 256)
    big.save(PUBLIC / 'favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])
    browser.close()
print('wrote public/favicon.svg, public/favicon.ico, public/apple-touch-icon.png from', tok)
