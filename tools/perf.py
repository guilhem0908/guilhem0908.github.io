"""Frame pacing of the home run, measured in headless Chromium on the built site.

  python tools/perf.py <out.json> [--dist dist] [--label after] [--runs 3]
                       [--viewports 1440x900,1920x1080] [--speeds 1300,2700,4200]
                       [--scenarios scroll,arrival] [--gpu high|low] [--dsf 1] [--cpu 1] [--home /]

  scroll    load /?nointro, then scroll the whole page top to bottom at a constant speed (px/s)
  arrival   load / with the intro and record until two seconds after the hero is interactive
  idle      the hero for six seconds, nobody scrolling: the noise floor of the machine

Every run is a fresh page (shader compilation, first texture uploads and first text splits only
happen once per visit, so a second pass on the same page would hide them). Each (viewport, speed)
is repeated --runs times and the medians are reported. For every long frame the script prints the
scroll position (section and progress in it), where the time went, and what happened around it.

  --gpu low    asks Chromium for the integrated GPU of a dual-GPU laptop (--force_low_power_gpu)
  --dsf 2      device pixel ratio of the page
  --cpu 4      CPU throttling rate of the main thread (DevTools protocol)

The page records the frames itself (src/world/perf.ts, window.__perf); this script only drives it.
Needs: python with `playwright`. The server lives in this process and stops with it.
Port: NAVRUN_PORT (default 4321).
"""
import argparse
import functools
import http.server
import json
import os
import re
import socketserver
import statistics
import threading
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
ap = argparse.ArgumentParser()
ap.add_argument('out')
ap.add_argument('--dist', default='dist')
ap.add_argument('--label', default='run')
ap.add_argument('--runs', type=int, default=3)
ap.add_argument('--viewports', default='1440x900,1920x1080')
ap.add_argument('--speeds', default='1300,2700,4200')
ap.add_argument('--scenarios', default='scroll,arrival')
ap.add_argument('--gpu', default='high', choices=['high', 'low'])
ap.add_argument('--dsf', type=float, default=1)
ap.add_argument('--cpu', type=float, default=1)
ap.add_argument('--home', default='/')
ap.add_argument('--quiet', action='store_true')
A = ap.parse_args()

DIST = (ROOT / A.dist).resolve()
PORT = int(os.environ.get('NAVRUN_PORT', '4321'))
ARGS = ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-webgl']
if A.gpu == 'low':
    ARGS.append('--force_low_power_gpu')
LONG, VERY = 31.0, 47.5   # two and three 60 Hz intervals: reported as "over 33 ms" and "over 50 ms"


class Handler(http.server.SimpleHTTPRequestHandler):
    """Static files with Range support (videos), like the real host."""

    def log_message(self, *a):
        pass

    def send_head(self):
        rng = self.headers.get('Range')
        path = self.translate_path(self.path)
        if not rng or os.path.isdir(path) or not os.path.isfile(path):
            return super().send_head()
        m = re.match(r'bytes=(\d*)-(\d*)', rng)
        size = os.path.getsize(path)
        if not m:
            return super().send_head()
        a = int(m.group(1)) if m.group(1) else max(0, size - int(m.group(2) or 0))
        b = int(m.group(2)) if m.group(1) and m.group(2) else size - 1
        b = min(b, size - 1)
        if a > b:
            self.send_error(416)
            return None
        f = open(path, 'rb')
        f.seek(a)
        self.send_response(206)
        self.send_header('Content-Type', self.guess_type(path))
        self.send_header('Content-Range', f'bytes {a}-{b}/{size}')
        self.send_header('Content-Length', str(b - a + 1))
        self.send_header('Accept-Ranges', 'bytes')
        self.end_headers()
        self._left = b - a + 1
        return f

    def copyfile(self, source, outputfile):
        left = getattr(self, '_left', None)
        if left is None:
            return super().copyfile(source, outputfile)
        while left > 0:
            chunk = source.read(min(65536, left))
            if not chunk:
                break
            outputfile.write(chunk)
            left -= len(chunk)
        self._left = None


socketserver.TCPServer.allow_reuse_address = True
httpd = socketserver.ThreadingTCPServer(('127.0.0.1', PORT), functools.partial(Handler, directory=str(DIST)))
httpd.daemon_threads = True
threading.Thread(target=httpd.serve_forever, daemon=True).start()
BASE = f'http://127.0.0.1:{PORT}'

SCROLL = """async (speed) => {
  const n = window.__navrun, P = window.__perf;
  const max = n.max();
  P.start();
  await new Promise((r) => setTimeout(r, 400));
  await new Promise((res) => n.lenis.scrollTo(max, { duration: max / speed, easing: (t) => t, lock: true, force: true, onComplete: res }));
  await new Promise((r) => setTimeout(r, 600));
  P.stop();
  const d = P.dump();
  const sections = {};
  for (const k in n.D.sections) sections[k] = { top: n.D.sections[k].top, span: n.D.sections[k].span };
  return { ...d, sections, max, vh: innerHeight, scale: n.world.renderer.getPixelRatio(), count: n.info.count };
}"""

ARRIVAL = """async () => {
  const P = window.__perf, n = window.__navrun;
  await new Promise((r) => setTimeout(r, 2000));
  P.stop();
  const d = P.dump();
  const sections = {};
  for (const k in n.D.sections) sections[k] = { top: n.D.sections[k].top, span: n.D.sections[k].span };
  const mark = (k) => (d.events.find((e) => e.kind === k) || {}).t;
  return { ...d, sections, max: n.max(), vh: innerHeight, scale: n.world.renderer.getPixelRatio(), count: n.info.count, marks: { hero: mark('hero-in'), interactive: mark('intro-done') } };
}"""

IDLE = """async (seconds) => {
  const n = window.__navrun, P = window.__perf;
  P.start();
  await new Promise((r) => setTimeout(r, seconds * 1000));
  P.stop();
  const d = P.dump();
  const sections = {};
  for (const k in n.D.sections) sections[k] = { top: n.D.sections[k].top, span: n.D.sections[k].span };
  return { ...d, sections, max: n.max(), vh: innerHeight, scale: n.world.renderer.getPixelRatio(), count: n.info.count };
}"""


def pct(v, p):
    if not v:
        return 0.0
    s = sorted(v)
    k = (len(s) - 1) * p
    lo, hi = int(k), min(int(k) + 1, len(s) - 1)
    return s[lo] + (s[hi] - s[lo]) * (k - lo)


def where(y, sections, vh):
    best, bp = None, 0.0
    for name, s in sections.items():
        p = (y - s['top']) / s['span']
        if -0.0001 <= p <= 1.0001:
            return f'{name} {p:.2f}'
        if y >= s['top'] and (best is None or s['top'] > sections[best]['top']):
            best, bp = name, p
    return f'{best} {bp:.2f}' if best else 'top'


def analyse(d):
    f = {k: i for i, k in enumerate(d['fields'])}
    rows = d['rows'][2:]                      # the first frames carry the gap before the recording
    dt = [r[f['DT']] for r in rows]
    gpu = [r[f['GPU']] for r in rows if r[f['GPU']] >= 0]
    longs = []
    for r in rows:
        if r[f['DT']] <= LONG:
            continue
        near = [f"{e['kind']} {e['detail']}".strip() for e in d['events'] if -260 <= e['t'] - r[f['T']] <= 60]
        parts = {k: r[f[k]] if k in f else 0 for k in ('JS', 'TWEEN', 'LENIS', 'SIM', 'DRAW', 'DOM', 'PAINT', 'SORT', 'APPLY', 'GPU')}
        longs.append({'dt': r[f['DT']], 'y': r[f['Y']], 'at': where(r[f['Y']], d['sections'], d['vh']),
                      'splats': r[f['SPLATS']], **parts, 'near': near[:6]})
    mean = lambda k: statistics.fmean(r[f[k]] for r in rows) if rows and k in f else 0
    out = {
        'frames': len(rows), 'median': pct(dt, 0.5), 'p95': pct(dt, 0.95), 'p99': pct(dt, 0.99), 'worst': max(dt) if dt else 0,
        'over33': sum(1 for v in dt if v > LONG), 'over50': sum(1 for v in dt if v > VERY),
        'js': mean('JS'), 'tween': mean('TWEEN'), 'lenis': mean('LENIS'), 'sim': mean('SIM'), 'draw': mean('DRAW'), 'dom': mean('DOM'), 'paint': mean('PAINT'),
        'js_p99': pct([r[f['JS']] for r in rows], 0.99), 'paint_p99': pct([r[f['PAINT']] for r in rows], 0.99),
        'sort': mean('SORT'), 'apply': mean('APPLY'), 'lat': mean('LAT'),
        'upload_kb': mean('UPLOAD') / 1024, 'gpu': statistics.fmean(gpu) if gpu else -1, 'gpu_p95': pct(gpu, 0.95) if gpu else -1,
        'gpu_max': max(gpu) if gpu else -1, 'splats': mean('SPLATS'), 'splats_max': max((r[f['SPLATS']] for r in rows), default=0),
        'scale': d.get('scale'), 'scale_min': min((r[f['SCALE']] for r in rows if r[f['SCALE']] > 0), default=0),
        'sorts': sum(1 for r in rows if r[f['SORT']] > 0), 'long': longs,
        'quality': [f"{e['detail']}" for e in d['events'] if e['kind'] == 'quality'],
    }
    # where the GPU works hardest
    if gpu:
        top = sorted((r for r in rows if r[f['GPU']] >= 0), key=lambda r: -r[f['GPU']])[:1]
        out['gpu_peak_at'] = where(top[0][f['Y']], d['sections'], d['vh'])
    by = {}
    for r in rows:
        if r[f['GPU']] < 0:
            continue
        sec = where(r[f['Y']], d['sections'], d['vh']).split(' ')[0]
        by.setdefault(sec, []).append(r[f['GPU']])
    out['gpu_by_section'] = {k: round(statistics.fmean(v), 2) for k, v in by.items()}
    return out


def med(runs, key):
    v = [r[key] for r in runs if r.get(key) is not None]
    return statistics.median(v) if v else None


def line(tag, runs):
    g = med(runs, 'gpu')
    return (f"{tag:<34} frames {med(runs, 'frames'):>5.0f}  median {med(runs, 'median'):5.1f}  p95 {med(runs, 'p95'):5.1f}  "
            f"p99 {med(runs, 'p99'):5.1f}  worst {med(runs, 'worst'):6.1f}  >33ms {med(runs, 'over33'):>4.0f}  >50ms {med(runs, 'over50'):>3.0f}  "
            f"js {med(runs, 'js'):4.2f}  paint {med(runs, 'paint'):4.2f}  gpu {g:5.2f} (p95 {med(runs, 'gpu_p95'):5.2f})  splats {med(runs, 'splats'):>7.0f}")


results = {'label': A.label, 'dist': str(DIST), 'gpu': A.gpu, 'dsf': A.dsf, 'cpu': A.cpu, 'args': ARGS, 'cases': []}
with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, args=ARGS)
    for vp in A.viewports.split(','):
        w, h = (int(v) for v in vp.split('x'))

        def page_for(path, init=None):
            ctx = browser.new_context(viewport={'width': w, 'height': h}, device_scale_factor=A.dsf)
            page = ctx.new_page()
            logs = []
            page.on('console', lambda m: logs.append(f'[{m.type}] {m.text}') if m.type in ('error', 'warning') else None)
            page.on('pageerror', lambda e: logs.append(f'[pageerror] {e}'))
            if init:
                page.add_init_script(f'({init})()')
            cdp = ctx.new_cdp_session(page)
            cdp.send('Performance.enable')
            if A.cpu != 1:
                cdp.send('Emulation.setCPUThrottlingRate', {'rate': A.cpu})
            page.goto(BASE + path, wait_until='domcontentloaded')
            page.wait_for_function('() => window.__navrun && window.__world && window.__world.info && window.__perf', timeout=90000)
            return ctx, page, cdp, logs

        def metrics(cdp):
            m = {x['name']: x['value'] for x in cdp.send('Performance.getMetrics')['metrics']}
            return {k: m.get(k, 0) for k in ('LayoutDuration', 'RecalcStyleDuration', 'ScriptDuration', 'TaskDuration', 'LayoutCount', 'RecalcStyleCount', 'JSHeapUsedSize')}

        if 'scroll' in A.scenarios:
            for speed in (int(s) for s in A.speeds.split(',')):
                runs = []
                for i in range(A.runs):
                    ctx, page, cdp, logs = page_for(A.home + '?nointro')
                    page.mouse.move(w * 0.57, h * 0.58)
                    time.sleep(1.5)
                    m0 = metrics(cdp)
                    d = page.evaluate(SCROLL, speed)
                    m1 = metrics(cdp)
                    r = analyse(d)
                    r['renderer'] = page.evaluate("() => { const g = window.__world.renderer.getContext(); const e = g.getExtension('WEBGL_debug_renderer_info'); return e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : ''; }")
                    r['layout_ms'] = (m1['LayoutDuration'] - m0['LayoutDuration']) * 1000
                    r['style_ms'] = (m1['RecalcStyleDuration'] - m0['RecalcStyleDuration']) * 1000
                    r['script_ms'] = (m1['ScriptDuration'] - m0['ScriptDuration']) * 1000
                    r['task_ms'] = (m1['TaskDuration'] - m0['TaskDuration']) * 1000
                    r['heap_mb'] = m1['JSHeapUsedSize'] / 1e6
                    r['max_scroll'] = d['max']
                    r['events'] = [e for e in d['events'] if e['kind'] != 'beat']
                    r['console'] = logs
                    runs.append(r)
                    ctx.close()
                case = {'scenario': 'scroll', 'viewport': vp, 'speed': speed, 'runs': runs}
                results['cases'].append(case)
                print(line(f'{A.label} scroll {vp} {speed}px/s', runs), flush=True)
                if not A.quiet:
                    for i, r in enumerate(runs):
                        for L in r['long']:
                            print(f"    run {i + 1}: {L['dt']:6.1f} ms at {L['at']:<12} (y {L['y']:.0f})  js {L['JS']:.1f} [tween {L['TWEEN']:.1f} lenis {L['LENIS']:.1f} sim {L['SIM']:.1f} draw {L['DRAW']:.1f} dom {L['DOM']:.1f}] "
                                  f"paint {L['PAINT']:.1f} gpu {L['GPU']:.1f} sort {L['SORT']:.1f}+{L['APPLY']:.1f}  {'; '.join(L['near'])}")

        if 'idle' in A.scenarios:
            # the noise floor of the machine: the hero, nobody scrolling
            runs = []
            for i in range(A.runs):
                ctx, page, cdp, logs = page_for(A.home + '?nointro')
                page.mouse.move(w * 0.57, h * 0.58)
                time.sleep(1.5)
                r = analyse(page.evaluate(IDLE, 6))
                r['console'] = logs
                runs.append(r)
                ctx.close()
            results['cases'].append({'scenario': 'idle', 'viewport': vp, 'runs': runs})
            print(line(f'{A.label} idle {vp}', runs), flush=True)

        if 'arrival' in A.scenarios:
            runs = []
            for i in range(A.runs):
                ctx, page, cdp, logs = page_for(A.home + '?perf=rec')
                page.wait_for_function("() => document.documentElement.classList.contains('intro-done')", timeout=60000)
                d = page.evaluate(ARRIVAL)
                r = analyse(d)
                r['hero_ms'] = d['marks'].get('hero')
                r['interactive_ms'] = d['marks'].get('interactive')
                r['events'] = [e for e in d['events'] if e['kind'] != 'beat']
                r['console'] = logs
                runs.append(r)
                ctx.close()
            results['cases'].append({'scenario': 'arrival', 'viewport': vp, 'runs': runs})
            print(line(f'{A.label} arrival {vp}', runs) + f"  hero {med(runs, 'hero_ms') or 0:.0f} ms  interactive {med(runs, 'interactive_ms') or 0:.0f} ms", flush=True)
            if not A.quiet:
                for i, r in enumerate(runs):
                    for L in r['long']:
                        print(f"    run {i + 1}: {L['dt']:6.1f} ms at {L['at']:<12}  js {L['JS']:.1f} [sim {L['SIM']:.1f} draw {L['DRAW']:.1f} dom {L['DOM']:.1f}] paint {L['PAINT']:.1f} gpu {L['GPU']:.1f}  {'; '.join(L['near'])}")
    browser.close()
httpd.shutdown()

# medians of the repeated runs, one row per case
summary = []
for c in results['cases']:
    runs = c['runs']
    row = {'scenario': c['scenario'], 'viewport': c['viewport'], 'speed': c.get('speed')}
    for k in ('frames', 'median', 'p95', 'p99', 'worst', 'over33', 'over50', 'js', 'js_p99', 'tween', 'lenis', 'sim', 'draw', 'dom', 'paint', 'paint_p99', 'sort', 'sorts', 'apply', 'lat',
              'upload_kb', 'gpu', 'gpu_p95', 'gpu_max', 'splats', 'splats_max', 'scale', 'scale_min', 'layout_ms', 'style_ms', 'script_ms', 'task_ms', 'heap_mb', 'hero_ms', 'interactive_ms', 'max_scroll'):
        v = med(runs, k)
        if v is not None:
            row[k] = round(v, 2)
    # places where a long frame came back in at least two of the runs
    seen = {}
    for i, r in enumerate(runs):
        for L in r['long']:
            sec, p = L['at'].split(' ') if ' ' in L['at'] else (L['at'], '0')
            key = f'{sec} {round(float(p) * 20) / 20:.2f}'
            seen.setdefault(key, set()).add(i)
    row['repeatable_long'] = sorted(k for k, v in seen.items() if len(v) >= 2)
    row['renderer'] = runs[0].get('renderer', '')
    summary.append(row)
results['summary'] = summary
Path(A.out).parent.mkdir(parents=True, exist_ok=True)
Path(A.out).write_text(json.dumps(results, indent=1), encoding='utf-8')
print('written', A.out)
