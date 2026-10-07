# NAV RUN: design system

Portfolio of Guilhem Carmouze, served at https://guilhem0908.github.io.
Content source: `FACTS.md` and the published READMEs only. All copy lives in `src/data/en.ts`
(shape in `types.ts`); facts, links, media and page switches live in `src/data/site.ts`.

## Concept

The site is one navigation run through a radiance field. A building made of about 300,000
real 3D Gaussians is trained in front of the visitor (noise condenses into rooms), then the
scroll bar becomes the trajectory: an A* path planned on an occupancy grid sliced from those
same Gaussians carries a robot's-eye camera from room to room, one project per room.
The world is printed as a blueprint (blue ground, white light, one red thread), so the only
true-colour moment on the page is Guilhem's real 360-degree panorama.

What the visitor must believe at the end: this person understands radiance fields,
panoramic geometry and robot navigation well enough to make them move.

## Site map

| Page | English | French (appears when `src/data/fr.ts` exists) | Template |
|------|---------|-----------------------------------------------|----------|
| Home, the run | `/` | `/fr/` | `views/HomeView.astro` |
| Case study | `/work/<slug>/` | `/fr/projets/<slug>/` | `views/CaseStudyView.astro` |
| Lab, side projects | `/lab/` | `/fr/labo/` | `views/LabView.astro` |
| CV | `/cv/` | `/fr/cv/` (appears when `src/data/cv/fr.ts` exists) | `views/CvView.astro`; switch `flags.cvPage` |

One header on every page: name (home), Work, Lab, CV, language, GitHub. On the home page it floats
over the world from the first paint, its two halves on plates like the instruments (paper on a plate
keeps its contrast whatever the splats behind do); it is a solid `--void` bar everywhere else (and
over the flow sections of the home page). Nothing links to a page whose switch is off.

## Colour tokens

| Token      | Hex       | Name       | Role |
|------------|-----------|------------|------|
| `--void`   | `#1632D4` | Blueprint  | Ground of the world, fog colour, page background. Never a gradient. |
| `--deep`   | `#060B3A` | Darkroom   | Shadow end of the splat ramp, text plates, the panorama stage. |
| `--paper`  | `#F4F6FF` | Paper      | All type, highlight end of the splat ramp, map lines. |
| `--haze`   | `#A9BBFF` | Haze       | Secondary text, hairlines, mid ramp. Tinted from the ground, never grey. |
| `--fil`    | `#FF3B30` | Fil rouge  | The one accent: the planned path, the tracked ball, focus ring, key figures. |
| `--cone`   | `#FFD326` | Cone       | In-world only: track cones, lane paint, the sensor field of view, "in progress". |

`--hair` (haze at 35 %) is the only rule colour. `--plate` (deep at 86 %) backs copy over the world.

Rules: blue and white carry the page; red is the thread and nothing else; yellow never
appears in type larger than a tag. Real media (the panorama, the camera feed) is the only
place where other hues exist. Contrast: paper on void 8.0:1, haze on void 4.6:1,
paper on deep 17:1. Red is never used for body text.

The splats themselves are duotone: baked luminance is mapped onto
deep -> void -> azure -> paper, then fogged to `--void`. Surfaces darker than the fog read as
navy silhouettes, brighter ones glow. Kinds that escape the ramp: `photo` (the AIST room,
built from his panorama), `fil` (path, ball), `cone` (cones, paint).

## Type

One family, used across its whole design space: **Mona Sans Variable** (OFL, self-hosted,
`@fontsource-variable/mona-sans`, axes wght 200-900 and wdth 75-125). No second face, no monospace.
Width is the system: expanded and heavy for names, normal for reading, condensed for instruments.

| Role        | Size                                   | wdth | wght | Line | Tracking | Case |
|-------------|----------------------------------------|------|------|------|----------|------|
| display-xl  | `clamp(3.4rem, 12.6vw, 13.5rem)`       | 125  | 860  | 0.84 | -0.035em | upper |
| display-l   | `clamp(2.5rem, 7.4vw, 7.75rem)`        | 120  | 820  | 0.9  | -0.03em  | upper |
| title       | `clamp(1.6rem, 3vw, 2.9rem)`           | 108  | 660  | 1.04 | -0.015em | sentence |
| figure      | `clamp(3.2rem, 8.4vw, 8.5rem)`         | 75   | 300  | 0.9  | -0.02em  | tabular |
| lead        | `clamp(1.1rem, 1.45vw, 1.4rem)`        | 100  | 460  | 1.38 | 0        | sentence |
| body        | `1rem` (16px), max 62ch                | 100  | 420  | 1.6  | 0        | sentence |
| readout     | `0.72rem`                              | 78   | 640  | 1.2  | 0.07em   | upper, tabular |

Giant figures (grafted from direction B): a measured number set in `figure`, up to
`clamp(3.6rem, 12.5vw, 12.5rem)`, with its exact meaning beside it in small type. Under the
unwrapped panorama of the run the number is sized from the band it sits under (16 % of its width,
at most 18 % of the window height), so it is as large as the room allows and its meaning keeps a
readable column. Used where a
number carries the argument and nowhere else: four in the AIST room (14 views, 0.037 to 0.020,
-27 % before distillation, 154 frames that failed the gate), the same on the case study, one per
side project. A "from" value is struck through in red and set at 56 %. A figure that reports a
failure is printed in `--fil`.

Readouts are instruments, not decoration: every number in the HUD is computed live
(Gaussian count, residual, pose, metres travelled). No invented metrics.

## Motion tokens

| Name       | Curve / rule                              | Duration   | Used for |
|------------|-------------------------------------------|------------|----------|
| `converge` | `cubic-bezier(0.16, 1, 0.3, 1)`           | 0.9-1.4 s  | Anything arriving: letters, plates, splats. |
| `plan`     | `cubic-bezier(0.77, 0, 0.175, 1)`         | 1.2-2.2 s  | Camera moves that are not scrubbed (intro dive, jumps). |
| `snap`     | `cubic-bezier(0.23, 1, 0.32, 1)`          | 140-220 ms | Hover, press, focus. |
| `track`    | linear scrub + exponential damping 6 s^-1 | continuous | Everything tied to scroll: camera, unwrap, wipe. |

Stagger: 18-28 ms per letter, random order (convergence is not left-to-right).
Press scale 0.97. Nothing bounces. Under reduced motion nothing above runs.

## Page grammar: continuous world

- One fixed full-viewport canvas. Sections are tall and transparent; each holds a sticky
  100dvh stage where HTML type sits over the world. No section backgrounds, no cards of
  unrelated imagery, no hard cuts except the panorama darkroom.
- State is a pure function of scroll: `director.ts` evaluates keyframe tracks
  (path position, camera height, pitch, fov, shader uniforms) from section offsets, so any
  scroll position can be jumped to and screenshotted.
- The hero is laid out for the window it gets, not for a screenshot size: the name is sized from
  the width and capped by the height; on a short laptop window the plate goes wide instead of tall
  and the links share a row with the skip link; on a short phone screen (a phone browser with its
  toolbars) the plate tightens and drops the list of fields. Checked from 320 x 568 to 1920 x 1080.
- Text always sits on the calm side; a plate (flat `--deep` at 86 %) backs body copy.
  Headlines sit directly on the world with a soft `--deep` ground (text-shadow, no offset look);
  where the world behind is busy (the cone track) the whole beat takes a plate.
- Each project room carries a solid "Read the case study" button as soon as that page exists.
- The run ends in two flow sections over the rising plan view: the lab cards, then the project
  index ("the run, without the run"), which the hero's skip link and the header's Work link reach.
- The minimap is the navigation. Waypoints are real buttons.

## Page grammar: case study and lab

Static documents: no WebGL, no animation library, about 2 KB of script.
- Ground is `--void`. Real media only ever sits in a **darkroom** band (`--deep`, full bleed).
  It is the same rule as on the home page: the panorama is the only photograph. A real picture
  inside the text column keeps a `--deep` mat around it; light figures keep their paper frame.
- Case study, in this order: kicker, title, one-sentence outcome; meta strip (role, team,
  period, organisation, stack) between hairlines; buttons (Code, Report, Video); darkroom with
  the window word and the lead media; three-line summary under red rules (problem, what I built,
  result); context; what I built; results; what failed or is unfinished; credits; links; next.
- Sections are a two-column grid: the heading in a 15 rem column, blocks in the other; figures,
  diagrams, tables and wide media span both. One column under 820 px.
- Blocks are typed (`types.ts`): text, list (red square bullets), steps (phases strung on a
  vertical red thread), pipeline, figures, media, pair, table.
- Pipeline diagram: numbered stages on a red thread; solid paper = the author's work, outlined =
  inputs, outputs and upstream components; the loop is a dashed bracket with its label.
- The one light moment: the **window word** (`360°`), display-xl letters cut out of the real
  repaired panorama, which pans once every 90 s (it wraps, it is equirectangular). Blocks arrive
  once with `converge` when they enter the viewport. Nothing else moves.
- Before/after: one frame, a draggable divider with a red handle, a range input for the
  keyboard, and a button that swaps the stills for the real video in the same frame.
- Lab: one section per project: darkroom with its hero clip, then name, what it is, repository,
  and one result as a giant figure, what the clip shows, where it comes from, stack.
- Page to page: cross-document view transitions where supported. The title the visitor clicked
  from (room title, index row) morphs into the page title; lab card clips morph into the lab clips.

## Page grammar: CV

A sheet of paper on the blueprint ground: the one calm page. `--paper` sheet, `--deep` ink,
secondary text in `--deep` mixed 28 % toward paper (7:1), links and section labels in `--void`,
red only for the thread under the header and the square bullets, `--cone` only for the
"in progress" tag. Same type system: the name expanded and heavy, the labels condensed, the text
at width 100. Two columns (education, research, projects | skills, side projects, languages,
other). Nothing moves. Every size is in em, so the sheet scales as one object: on screen it is as
wide as its container (up to 62 rem); in print it is exactly A4 at 8.5 pt with a white ground, and
`tools/cv_pdf.py` renders `public/cv/Guilhem_Carmouze_CV_<LANG>.pdf` from the built page and fails
when the sheet is taller than the page. Under 880 px the sheet reflows to one column. The CV
carries no phone number and no street address.

## Signature moves

1. **Convergence.** Training is the entrance animation for everything. Splats: a random
   cloud of large isotropic Gaussians moves to coarse cell centres, then densifies
   (children split off their parent cell and shrink to their final anisotropic shape).
   Letters do the same: scattered, blurred, wide, then they land.
2. **The red thread.** The A* path is the scroll bar. It is made of splats, so walls occlude it;
   the travelled part is solid, the planned part dashed. "Fil rouge" is also the name of his
   first robot project, where the thread ends.
3. **Unwrap and repair.** In the AIST room the perspective view opens into the full
   equirectangular panorama (direction-space morph in GLSL), then a diffusion front wipes
   the raw 3DGS render into the repaired one. Real video, his data. The panorama is 1024 texels
   for 360 degrees, so from inside it is magnified several times: it is sampled with a cubic
   B-spline and given a little grain, and on a phone the camera pulls back to 98 degrees while it
   is on screen. Once unwrapped, the band stops where the label bar of the video starts.
4. **Lens.** The cursor carries a 150 px lens that switches the render mode locally:
   depth ramp or raw ellipsoids. Click or press L to change mode. A HUD button applies it to the whole view.

## Motion inventory

| Section | World | Type |
|---------|-------|------|
| Intro (4.6 s, skippable) | Top-down noise cloud condenses into the floor plan, camera dives into the lobby. | Readout runs (iteration, residual, live Gaussian count). The header (name, Work, Lab, CV, language, GitHub) is there from the first paint, with a paper tag that says how to skip. |
| Hero / lobby | Camera settles at robot height; 14-view rig sculpture idles; pointer parallax. | Name converges; width axis 75 -> 125; links slide in. |
| AIST | Vestibule with a pinhole view of the raw render as a splat billboard (the source footage is never shown), then the room built from the panorama develops from duotone into true colour, artefact needles spin; iris to the real panorama; unwrap; repair wipe; re-wrap. | Title lines converge; five phases step with the scrub; three figures count nothing up, they are set. |
| SVLR | Camera turns through the south door. | One short plate. |
| TLSe Racing | Cone chicane; sensor field-of-view fan sweeps the floor and lights the cones it selects. | One marquee tied to scroll velocity. |
| Usine 4.0 | The camera leaves the lane on a boom and cranes to 5.3 m, looking down on the floor while it travels: ten mobile robots on one-way lanes queue, stop at docks and yield at the merge; six workstation arms swing. | Huge title scales with the crane. |
| Fil rouge | The robot keeps the ball on its image centre line (drawn on the floor with its field of view); the ball follows the pointer. The wall holds a screen with the real camera footage. | The web interface on a phone plays in a tile; live ball bearing readout. |
| Lab | Camera leaves through the roof. | Four cards with the real clips rise in; one figure each. |
| Index | Plan view holds. | Rows rise in. |
| Contact | Top-down: the world becomes the map, whole path drawn. | Email at display size. |

## Do not use

Manrope, Inter, any serif, any monospace. Peach or orange accent. Teal-black. Diorama or
"lab bench" framing, numbered stations 01-06, "ENTER"/"RUN" buttons. Cream or off-white page.
Italic accent word. Acid green terminal, typewriter text. Glass bento, identical rounded cards.
Purple or any gradient wash. Pills everywhere. Count-up vanity stats, skill bars.
Custom cursor replacing the pointer (the lens rides with it, the pointer stays). Em-dashes.
Stock or generated imagery. Any number not in FACTS.md.

## Mobile plan (390 px)

- Splat density 0.5 (about 155k), device pixel ratio capped at 1.25, fog pulled in, no lens.
- Minimap shrinks to a 104 px tile; readouts reduce to metres travelled. It steps aside just before
  the lab enters the screen, and comes back for the last section.
- Stages stack: headline on the world at top, copy on a solid `--deep` plate at the bottom.
- The panorama unwraps to a band across the width; the giant figures sit right under its caption,
  which keeps its first sentence only (which run the picture comes from).
- In the flow sections (lab, index) the minimap steps aside and the header takes a ground.
- Case study: the results table becomes a list of cards; wide lab clips scroll sideways in their frame.
- No horizontal scroll: display type is sized in vw and clipped by the stage, marquee is `overflow: clip`.

## Reduced motion / no WebGL plan

Default CSS is a complete static page (works without JavaScript): blueprint ground,
a pre-rendered poster of the lobby as hero (`tools/poster.py`: the world only, no interface and no
text, so it serves every language), the before/after frame with its
divider, both robot clips with controls, the lab cards, the project index, plain document flow.
Sentences that only make sense inside the 3D rooms are marked `gl-only` and stay out of it. An inline head script adds `html.gl` only
when WebGL2 exists and reduced motion is not requested; everything animated hangs off that class.
Reduced-motion visitors get a "Start the 3D run" button to opt in.

## Performance budget

- First paint needs CSS + one font file + about 45 KB of JS. three.js, the scene worker and
  shaders load after first paint through dynamic import.
- Own splat rasteriser (instanced quads, EWA covariance projection in GLSL, counting sort in
  a worker, culling behind the camera and beyond fog). Chosen over Spark: about 6 KB instead of
  about 900 KB gzipped, and fragment-level control for the lens and convergence.
- DPR capped at 1.5 (1.25 on phones). Canvas pauses when the tab is hidden.
  The panorama video loads only when the AIST room is close.

## Decision log (build-out)

- The Fil rouge screen is a plain textured quad drawn before the splats, in a hole of the wall:
  the splats in front of it (pen, robot, dust) are blended over it, so it is occluded correctly
  without a depth buffer.
- Factory lanes are one-way by construction, so the traffic needs no planner to stay honest:
  following distance, dock stops and one yield rule at the merge.
- The camera boom (`offX`, `offZ`) lets the crane leave the path without bending the red thread.
- Cross-document view transitions rather than a client router: the home page owns a WebGL
  context and a scroll director that should not be torn down and rebuilt by a router.
- French is switched on by the presence of `src/data/fr.ts`, not by a flag that could drift.
- French is written, not translated: first person, short sentences, no "vous" (interface instructions are in the infinitive), established terms left in English and glossed once. Typography is applied by one function over the finished data (`src/i18n/typography.ts`), so no sentence depends on someone typing a no-break space. Punctuation that belongs to a label (`Dépôt :`, `Vue :`) lives in the data, not in the templates. The share image exists once per language, captured from that language's home page.

## Decision log

- Blueprint blue ground instead of black: keeps distance from the classmate's dark lab and from
  the near-black AI default; it comes from floor plans and occupancy maps.
- Duotone splats: a procedural interior cannot pass as a photo, so it is printed, and the real
  panorama gets to be the only photograph.
- First-person, not diorama: the camera is the robot. The plan view exists only as map.
- One typeface with three widths instead of sans + mono.
