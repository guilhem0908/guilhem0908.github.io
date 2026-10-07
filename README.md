# guilhem0908.github.io

Portfolio of Guilhem Carmouze, final-year robotics engineering student (3D Gaussian Splatting,
360-degree vision, robot navigation), published at <https://guilhem0908.github.io>.

The home page is a navigation run through a radiance field: a building of procedural 3D
Gaussians is generated in the browser, an occupancy grid is sliced from it, an A* path is planned
on that grid, and the scroll bar drives a camera along the path, one project per room. The other
pages are static documents: case studies, the lab (side projects) and a one-page CV with its PDF.
French mirrors English (`/fr/`) once its content files exist.

Built with Astro 7 (static output), TypeScript, three.js with a hand-written Gaussian splat
rasteriser, GSAP and Lenis. No runtime CDN, no analytics, no external embed. The design system is
in [DESIGN.md](DESIGN.md).

## Run it

```bash
npm install
npm run dev        # http://127.0.0.1:4321
npm run build      # static site in dist/
npm run preview
```

Node 22 or newer.

## Deploy

`.github/workflows/deploy.yml` builds the site (`npm ci`, `npm run build`, Node 22), checks its
links (`node tools/check_links.mjs`) and publishes `dist/` with the official Pages actions
(`configure-pages`, `upload-pages-artifact`, `deploy-pages`) on every push to `main`. The link check
stops the deployment when an internal link is broken or when a repository the site links on GitHub
answers 404: a repository has to be public before the site that links it goes live. One-time setting on GitHub: **Settings > Pages > Build
and deployment > Source: GitHub Actions**. The site lives at the root of the domain, so there is
no `base` path. CI does not run Python: the CV PDFs and the share image are committed files.

## Where things are

| Path | What |
|---|---|
| `src/data/en.ts` | Every sentence of the home page, the case studies and the lab (shape in `src/data/types.ts`) |
| `src/data/cv/en.ts` | Every sentence of the CV (shape in `src/data/cv/types.ts`) |
| `src/data/shell.ts` | Structured-data copy and the 404 page |
| `src/data/site.ts` | Facts, links, the media manifest and the page switches |
| `src/i18n/routes.ts` | The site map: paths per language, which pages exist, hreflang alternates |
| `src/layouts/Base.astro` | Document shell shared by every page |
| `src/components/Seo.astro` | Title, description, canonical, hreflang, Open Graph, Twitter, icons, JSON-LD |
| `src/views/` | `HomeView` (the run), `CaseStudyView`, `LabView`, `CvView` |
| `src/pages/` | Thin route files (English at the root, other languages under `[lang]/`), `404.astro`, `robots.txt.ts` |
| `src/world/`, `src/scripts/main.ts` | The world: scene generator, planner, splat shaders, traffic, room culling (`layout.ts`), quality governor (`quality.ts`), frame recorder (`perf.ts`); the scroll director |
| `src/styles/` | `global.css` (tokens, type), `home.css`, `page.css`, `cv.css`, `notfound.css` |
| `public/media/` | Web-sized real media, every file listed in `src/data/site.ts` |
| `public/cv/` | The CV as PDF, one per language |
| `tools/` | Capture and generation scripts (Python, development only) |

## Adding content

- **A case study.** Write it under `work['<slug>']` in `src/data/en.ts`, then set `ready: true`
  for that slug in `caseStudies` in `src/data/site.ts`. The page, the button in its room on the
  home page, the link in the project index and the "next project" chain appear together.
- **A side project.** List it in `src/data/site.ts` with `published: true`, a repository, a visual
  and a stack, add its name to `SIDE_NAMES`, then add its copy under `lab.projects` in `en.ts` and `fr.ts`.
  The home page shows the entries marked `card: true` as cards with their clip and the others as
  one line each (`short` in their copy). A project whose repository is not public yet is not named
  in this repository: add it only when it is public.
- **French.** `src/data/fr.ts` (type `SiteContent`) and `src/data/cv/fr.ts` (type `CvContent`) are
  written. Their presence generates `/fr/`, `/fr/projets/<slug>/`, `/fr/labo/` and `/fr/cv/`, the
  `hreflang` links and the language switch. Both files are written with ordinary spaces and end with
  `frenchTypography(...)` (`src/i18n/typography.ts`), which inserts the no-break spaces before `: ; ? ! %`,
  inside guillemets and in numbers (`3 473 858`, `4 m`, `Usine 4.0`). The decimal comma is typed in
  the copy (`0,037`); the live readouts of the run take their decimal sign from the page language.
  A new case study or lab project goes into both `en.ts` and `fr.ts`, with the same numbers.
  A third language needs a key in `SEGMENTS` (`src/i18n/routes.ts`), `LANGS` (`site.ts`) and `shell.ts`.
- **The CV.** Edit `src/data/cv/en.ts`. The CV has to fit one A4 page, and the PDF script fails
  when it does not. Then regenerate the PDF (below).

## The CV and its PDF

`/cv/` is a sheet of paper on the blueprint ground; the same markup prints on one A4 page
(print rules at the end of `src/styles/cv.css`). The PDF is rendered from the built page, so the
two cannot drift apart:

```bash
npm run build
python tools/cv_pdf.py            # every language that has a built CV page; --png also writes a picture
npm run build                     # again, so the page shows the new file size
```

The script checks that the PDF has exactly one A4 page, that the name fits its line, that the
text is extractable and that no link points at the local server. The French PDF is produced the
same way (`python tools/cv_pdf.py fr`); French runs longer than English, so its copy is
tighter to keep the sheet on one page.

## Tools

All of them serve `dist/` themselves and stop with the script. They need Python with
`playwright` (headless Chromium) and `Pillow`; `cv_pdf.py` also needs `pypdf`, `fonttools` and
`brotli` (and `pypdfium2` for `--png`): it cuts static instances of the variable font so that the
PDF holds real TrueType fonts, which keeps its text extractable for applicant-tracking systems.

| Script | What |
|---|---|
| `tools/cv_pdf.py` | CV page to `public/cv/Guilhem_Carmouze_CV_<LANG>.pdf`; the English one is also copied to the two addresses of the CVs of the previous site (`public/Resume_Guilhem_Carmouze_IA.pdf`, `_Rob.pdf`), so old links get the current CV |
| `tools/og.py` | The 1200 x 630 share images `public/media/og.jpg` and `og-fr.jpg`, captured from the home pages (`python tools/og.py fr` for one language) |
| `tools/icons.py` | `favicon.svg`, `favicon.ico` and `apple-touch-icon.png`, drawn from the colour tokens |
| `tools/poster.py` | The static hero image `public/media/poster.jpg`: the lobby, world only, no interface and no text |
| `tools/pinhole.py` | `public/media/aist-pinhole.jpg`, the pinhole view on the vestibule wall, cut out of the raw 3DGRUT panorama |
| `tools/check_links.mjs` | Internal links of `dist/`, and whether every linked GitHub repository is public (Node, no dependency; run by the deploy workflow) |
| `tools/shots.py` | Art-director loop: scroll depths of the run, static pages, intro frames |
| `tools/perf.py` | Frame pacing of the run: scrolls the whole page at three speeds on two window sizes, a fresh page per run, medians of three; prints every long frame with its place in the run and where the time went (`--gpu low` asks for the integrated GPU) |
| `tools/arrival.py` | The first seconds: intro length, the scroll cue, the lights on the path, the peek, keys, wheel and click during the intro, the Start button, touch wording, reduced motion |
| `tools/sight.py` | Draws frozen positions of the run with and without the room culling and compares the pictures |
| `tools/governor.mjs` | The quality governor against simulated machines: a weak GPU, a very weak one, a lighter room, a browser capped at 30 frames a second, with and without a GPU timer (`node tools/governor.mjs`, Node 23.6 or newer) |
| `tools/pageshot.py` | Full-page captures of static pages (CV, 404, lab) at 1440 and 390 px |

## Performance

Add `?perf=1` to the address of the home page to see what the run costs on your machine: frame
time, GPU time, render scale and quality level, Gaussians drawn, sort time, and the last long
frame with the place where it happened. The buttons pin a quality level; "Auto" hands it back to
the governor. The method and the rules are in [DESIGN.md](DESIGN.md#performance).

```bash
npm run build
python tools/perf.py _work/perf/now.json                  # the fast GPU
python tools/perf.py _work/perf/low.json --gpu low        # the integrated GPU of a dual-GPU laptop
python tools/arrival.py                                   # the first seconds of the run
python tools/sight.py                                     # the room culling changes nothing on screen
node tools/governor.mjs                                   # the quality governor on simulated machines
```

## Search and sharing

Every page gets its title and description from the data files, a canonical URL, Open Graph and
Twitter tags with the share image, `<html lang>`, and JSON-LD (`Person`, `WebSite`, `ProfilePage`
or `WebPage`). `hreflang` alternates and `x-default` are emitted for every page that exists in
more than one language, on the page and in the sitemap. `@astrojs/sitemap` writes
`sitemap-index.xml`; `robots.txt` is built from the `site` address. Titles stay under 60 characters
and descriptions around 160. The 404 page is not indexed.

## Truth

Every number on the site comes from the internship records or from a script in the linked
repository, and is quoted with its meaning. Team projects say who did what. The factory hall of
the home page is an illustration, and says so. The CV carries no phone number and no street
address. The footage behind the AIST results is third-party video and is never shown: every picture
of those rooms is a render or a model output.

## Credits

- **Mona Sans** (Variable), by GitHub, SIL Open Font License 1.1, self-hosted through
  [`@fontsource-variable/mona-sans`](https://fontsource.org/fonts/mona-sans).
- [Astro](https://astro.build) and [`@astrojs/sitemap`](https://docs.astro.build/en/guides/integrations-guide/sitemap/) (MIT),
  [three.js](https://threejs.org) (MIT), [Lenis](https://lenis.darkroom.engineering) (MIT),
  [GSAP](https://gsap.com) (GreenSock standard "no charge" licence).
- Development tools only, not shipped: Playwright, Pillow, pypdf, pypdfium2.
- Real media: the figures, panoramas and clips come from the repositories linked on the site and
  from the team recordings of Projet Fil Rouge ([`waliwassim/PFR2`](https://github.com/waliwassim/PFR2));
  each page says what a figure shows and where it comes from. ArtiFixer-360 is a derivative of
  NVIDIA's ArtiFixer (Apache-2.0). The side projects were built in October 2026 with AI
  assistance, as the lab page says.
