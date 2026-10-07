"""Render the CV pages of the built site to PDF: public/cv/Guilhem_Carmouze_CV_<LANG>.pdf

  npm run build
  python tools/cv_pdf.py            # every language that has a CV page in dist/
  python tools/cv_pdf.py en         # only the English one
  python tools/cv_pdf.py fr         # the French one, once src/data/cv/fr.ts exists and has been built
  python tools/cv_pdf.py --png      # also write _work/cv_<lang>.png, a picture of the PDF, for review

The PDF is what the browser prints for the page (the print rules are at the end of
src/styles/cv.css), so the page and the PDF cannot drift apart. The script fails when the CV does
not fit on one A4 page, when the name does not fit on its line, or when a link in the PDF would
point at the local server. The PDFs are committed (CI does not run Playwright): after changing the
CV copy, run this script, then `npm run build` again so the page shows the new file size.

Fonts: the site uses Mona Sans as a variable font, which Chromium can only write into a PDF as
Type 3 glyph drawings (no space characters, weaker text extraction for applicant-tracking systems).
So for the PDF only, this script cuts static instances of the variable font at exactly the weights
and widths the page uses (fontTools), and swaps them in. The layout is identical; the PDF then holds
real TrueType fonts. Nothing of this reaches the website.

The old hand-written site served two CVs at the root of the domain (Resume_Guilhem_Carmouze_IA.pdf
and Resume_Guilhem_Carmouze_Rob.pdf). Links to them may still circulate, so the same two addresses
now serve the current English CV: this script writes those copies into public/ as well.

Needs: python with `playwright` (headless chromium), `pypdf`, `fonttools` and `brotli`
(`pypdfium2` for --png). The server lives in this process and stops with it.
Port: NAVRUN_PORT (default 4332).
"""
import base64
import functools
import io
import http.server
import os
import shutil
import socketserver
import sys
import threading
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from playwright.sync_api import sync_playwright
from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject, TextStringObject

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / 'dist'
OUT = ROOT / 'public' / 'cv'
PORT = int(os.environ.get('NAVRUN_PORT', '4332'))
PNG = '--png' in sys.argv

# language -> path of its CV page inside dist/ (src/i18n/routes.ts: SEGMENTS)
PAGES = {'en': 'cv', 'fr': 'fr/cv'}
SUBJECT = {'en': 'Curriculum vitae', 'fr': 'Curriculum vitae'}
# addresses of the CVs of the previous site, kept alive with the current English CV
LEGACY = ['Resume_Guilhem_Carmouze_IA.pdf', 'Resume_Guilhem_Carmouze_Rob.pdf']
A4_PX = 297 / 25.4 * 96  # page height in CSS pixels
VARIABLE_FONT = ROOT / 'node_modules' / '@fontsource-variable' / 'mona-sans' / 'files' / 'mona-sans-latin-wdth-normal.woff2'


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


def static_fonts(page) -> list[str]:
    """Swap the variable font for static instances of it, one per (weight, width) the sheet uses.
    Returns problems (characters the font does not have)."""
    used = page.evaluate(
        """() => {
          const found = new Set();
          const walk = document.createTreeWalker(document.querySelector('.cv'), NodeFilter.SHOW_TEXT);
          while (walk.nextNode()) {
            const n = walk.currentNode;
            if (!n.textContent.trim()) continue;
            const cs = getComputedStyle(n.parentElement);
            found.add(parseFloat(cs.fontWeight) + '|' + parseFloat(cs.fontStretch));
          }
          return { combos: [...found], text: document.querySelector('.cv').innerText };
        }"""
    )
    problems = []
    cmap = TTFont(VARIABLE_FONT).getBestCmap()
    missing = sorted({c for c in used['text'] if not c.isspace() and ord(c) not in cmap})
    if missing:
        problems.append('[font] characters missing from the Latin subset of Mona Sans: ' + ' '.join(missing))
    faces = []
    for combo in sorted(used['combos']):
        wght, wdth = (float(v) for v in combo.split('|'))
        inst = instancer.instantiateVariableFont(TTFont(VARIABLE_FONT), {'wght': wght, 'wdth': wdth}, inplace=False)
        inst.flavor = None
        buf = io.BytesIO()
        inst.save(buf)
        b64 = base64.b64encode(buf.getvalue()).decode()
        faces.append(
            "@font-face { font-family: 'Mona Sans CV'; font-display: block; "
            f"src: url(data:font/ttf;base64,{b64}) format('truetype'); font-weight: {wght:g}; font-stretch: {wdth:g}%; }}"
        )
    page.add_style_tag(content=chr(10).join(faces) + chr(10) + ".cv, .cv * { font-family: 'Mona Sans CV', sans-serif !important; }")
    page.evaluate('() => document.fonts.ready')
    # every face must actually load: a face that did not would silently fall back to a system font
    for combo in used['combos']:
        wght, wdth = combo.split('|')
        ok = page.evaluate(
            """([w, s]) => document.fonts.load(`${w} 12px "Mona Sans CV"`).then((l) => l.length > 0)""", [wght, wdth]
        )
        if not ok:
            problems.append(f'[font] static instance {combo} did not load')
    return problems


def render(browser, lang: str) -> bool:
    page = browser.new_context(viewport={'width': 1200, 'height': 1600}).new_page()
    problems = []
    page.on('console', lambda m: problems.append(f'[{m.type}] {m.text}') if m.type == 'error' else None)
    page.on('pageerror', lambda e: problems.append(f'[pageerror] {e}'))
    page.goto(f'http://127.0.0.1:{PORT}/{PAGES[lang]}/', wait_until='networkidle')
    page.emulate_media(media='print')
    page.evaluate('() => document.fonts.ready')
    if not page.evaluate("() => document.fonts.check('1em \"Mona Sans Variable\"')"):
        problems.append('[font] Mona Sans Variable is not loaded')
    problems += static_fonts(page)

    m = page.evaluate(
        """() => {
          const r = (s) => document.querySelector(s).getBoundingClientRect();
          const name = document.querySelector('.cv-name');
          return {
            sheet: r('.cv').height, width: r('.cv').width,
            main: r('.cv-main').height, side: r('.cv-side').height,
            nameFits: name.scrollWidth <= name.clientWidth + 1,
            title: document.title, lang: document.documentElement.lang,
            overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
          };
        }"""
    )
    fill = m['sheet'] / A4_PX
    print(f'[{lang}] sheet {m["sheet"]:.0f} px of {A4_PX:.0f} ({fill:.0%}); main column {m["main"]:.0f} px, side column {m["side"]:.0f} px')

    tmp = ROOT / '_work' / f'cv_{lang}.pdf'
    tmp.parent.mkdir(exist_ok=True)
    page.pdf(path=str(tmp), prefer_css_page_size=True, print_background=True)
    page.context.close()

    data = tmp.read_bytes()
    reader = PdfReader(io.BytesIO(data))
    n = len(reader.pages)
    size = reader.pages[0].mediabox
    links = [
        a.get_object().get('/A', {}).get('/URI', '')
        for a in (reader.pages[0].get('/Annots') or [])
    ]
    text = reader.pages[0].extract_text() or ''
    kinds = {
        str(f.get_object().get('/Subtype'))
        for f in (reader.pages[0]['/Resources'].get('/Font') or {}).values()
    }

    ok = True
    def fail(msg):
        nonlocal ok
        ok = False
        print(f'[{lang}] FAIL: {msg}')

    if n != 1:
        fail(f'the PDF has {n} pages, it must have exactly 1: shorten the CV copy or lower --cv-print-size in cv.css')
    if abs(float(size.width) - 595.28) > 1 or abs(float(size.height) - 841.89) > 1:
        fail(f'page size is {float(size.width):.0f} x {float(size.height):.0f} pt, not A4')
    if fill > 1.0:
        fail('the sheet is taller than an A4 page')
    if not m['nameFits']:
        fail('the name does not fit on its line')
    if m['overflowX']:
        fail('horizontal overflow in print layout')
    if any('127.0.0.1' in u or 'localhost' in u for u in links):
        fail('a link in the PDF points at the local server: ' + ', '.join(u for u in links if '127.0.0.1' in u))
    if not links:
        fail('the PDF has no clickable link')
    if 'carmouze' not in text.lower():
        fail('the text of the PDF is not extractable')
    if '/Type3' in kinds:
        fail('the PDF still holds Type 3 fonts (the static fonts were not used)')
    for p in problems:
        fail(p)

    if ok:
        OUT.mkdir(parents=True, exist_ok=True)
        w = PdfWriter(clone_from=reader)
        w.add_metadata({
            '/Title': m['title'],
            '/Author': 'Guilhem Carmouze',
            '/Subject': SUBJECT.get(lang, 'Curriculum vitae'),
        })
        w._root_object[NameObject('/Lang')] = TextStringObject(m['lang'])
        target = OUT / f'Guilhem_Carmouze_CV_{lang.upper()}.pdf'
        with open(target, 'wb') as f:
            w.write(f)
        print(f'[{lang}] wrote {target.relative_to(ROOT)} ({target.stat().st_size / 1024:.0f} KB, 1 page, {len(links)} links, fonts: {", ".join(sorted(k.lstrip("/") for k in kinds))})')
        if lang == 'en':
            for name in LEGACY:
                shutil.copyfile(target, ROOT / 'public' / name)
            print(f'[{lang}] copied to public/ as {", ".join(LEGACY)}')
    if PNG:
        # a picture of the PDF itself (not of the page), for the review loop
        import pypdfium2
        pdf = pypdfium2.PdfDocument(data)
        img = pdf.get_page(0).render(scale=2).to_pil()
        pdf.close()
        img.save(ROOT / '_work' / f'cv_{lang}.png')
        print(f'[{lang}] wrote _work/cv_{lang}.png')
    if ok:
        tmp.unlink(missing_ok=True)
    else:
        print(f'[{lang}] the rejected PDF is kept at _work/cv_{lang}.pdf')
    return ok


def main():
    wanted = [a for a in sys.argv[1:] if not a.startswith('-')]
    for a in wanted:
        if a not in PAGES:
            sys.exit(f'unknown language {a!r}; known: {", ".join(PAGES)}')
    built = [l for l, p in PAGES.items() if (DIST / p / 'index.html').exists()]
    if wanted:
        missing = [l for l in wanted if l not in built]
        if missing:
            sys.exit(f'no built CV page for {", ".join(missing)}: run `npm run build` first')
    langs = wanted or built
    if not langs:
        sys.exit('no CV page in dist/: run `npm run build` first')

    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.ThreadingTCPServer(('127.0.0.1', PORT), functools.partial(Quiet, directory=str(DIST)))
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    ok = True
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            for lang in langs:
                ok = render(browser, lang) and ok
            browser.close()
    finally:
        httpd.shutdown()
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
