// Language-independent facts and switches. Copy lives in en.ts (and fr.ts when it exists).
// Source of truth for every fact: ../../../FACTS.md and the published READMEs.

export const SITE_URL = 'https://guilhem0908.github.io';

export const LANGS = ['en', 'fr'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'en';

export const person = {
  name: 'Guilhem Carmouze',
  first: 'Guilhem',
  last: 'Carmouze',
  monogram: 'GC',
  email: 'l7guilhem@gmail.com',
  github: 'https://github.com/guilhem0908',
  linkedin: 'https://www.linkedin.com/in/guilhem-carmouze/',
};

/**
 * Switches for pages that are not built yet. Nothing links to a page whose switch is off.
 * - cvPage: the CV page (src/views/CvView.astro). Each language needs its own copy in src/data/cv/.
 */
export const flags = {
  cvPage: true,
};

// ------------------------------------------------------------------ repositories

const GH = 'https://github.com/guilhem0908/';
export const repos = {
  'artifixer-360-pipeline': GH + 'artifixer-360-pipeline',
  nav_3dgs_pano: GH + 'nav_3dgs_pano',
  KachakaNavigation: GH + 'KachakaNavigation',
  TLSe_Racing_Driverless: GH + 'TLSe_Racing_Driverless',
  PathPlanning: GH + 'PathPlanning',
  PFR: GH + 'PFR',
  PFR2: 'https://github.com/waliwassim/PFR2',
  'amr-traffic-lab': GH + 'amr-traffic-lab',
  erpkit: GH + 'erpkit',
  microsplat: GH + 'microsplat',
  'gaussian-projection-bench': GH + 'gaussian-projection-bench',
} as const;
export type RepoKey = keyof typeof repos;

export const external = {
  aistReport: repos['artifixer-360-pipeline'] + '/blob/main/docs/assets/readme/Rapport_de_stage_2026_CARMOUZE_Guilhem.pdf',
  svlrReport: 'https://alecbossard.com/svlr/report',
};

// ------------------------------------------------------------------- case studies

export const CASE_SLUGS = ['aist-360-navigation', 'tlse-racing-driverless', 'projet-fil-rouge', 'usine-4-0'] as const;
export type CaseSlug = (typeof CASE_SLUGS)[number];
export type RoomId = 'aist' | 'tlse' | 'pfr' | 'usine';

/**
 * One entry per case study, in reading order.
 * ready: false means the page is not generated and no link to it is rendered anywhere.
 * To publish one: write its content under `work[slug]` in en.ts, then set ready to true.
 */
export const caseStudies: Record<CaseSlug, { ready: boolean; room: RoomId; code: RepoKey[]; report?: string }> = {
  'aist-360-navigation': {
    ready: true,
    room: 'aist',
    code: ['artifixer-360-pipeline', 'nav_3dgs_pano', 'KachakaNavigation'],
    report: external.aistReport,
  },
  'tlse-racing-driverless': { ready: true, room: 'tlse', code: ['TLSe_Racing_Driverless', 'PathPlanning'] },
  'projet-fil-rouge': { ready: true, room: 'pfr', code: ['PFR2', 'PFR'] },
  // The class project has no code to show. Its page links the personal study by name, in the text.
  'usine-4-0': { ready: true, room: 'usine', code: [] },
};

export const slugOfRoom = (room: RoomId): CaseSlug => CASE_SLUGS.find((s) => caseStudies[s].room === room)!;

// -------------------------------------------------------------------------- media

export interface ImageAsset { kind: 'image'; src: string; w: number; h: number; paper?: boolean }
export interface VideoAsset { kind: 'video'; mp4: string; webm?: string; poster: string; w: number; h: number }
export type Asset = ImageAsset | VideoAsset;

const img = (src: string, w: number, h: number, paper = false): ImageAsset => ({ kind: 'image', src: `/media/${src}`, w, h, paper });
const vid = (name: string, w: number, h: number, webm = true): VideoAsset => ({
  kind: 'video', mp4: `/media/${name}.mp4`, webm: webm ? `/media/${name}.webm` : undefined, poster: `/media/${name}.jpg`, w, h,
});

/** Every file under public/media that a page may show. paper: a light figure that needs a frame. */
export const media = {
  poster: img('poster.jpg', 1440, 900),
  og: img('og.jpg', 1200, 630),
  ogFr: img('og-fr.jpg', 1200, 630),
  panoRaw: img('pano-raw.jpg', 1024, 468),
  panoRepaired: img('pano-repaired.jpg', 1024, 468),
  panoPair: { kind: 'video', mp4: '/media/pano.mp4', webm: '/media/pano.webm', poster: '/media/pano-still.jpg', w: 1792, h: 448 } as VideoAsset,
  aistOutput: img('aist-erp-025.jpg', 1024, 512),
  aistRigCoverage: img('aist-rig-coverage.webp', 1640, 562, true),
  aistDistill: img('aist-distill-compare.jpg', 928, 466),
  pfrBall: vid('pfr-ball', 640, 480, false),
  pfrHmi: vid('pfr-hmi', 432, 768, false),
  pfrRobot: img('pfr-robot.webp', 1197, 586),
  labErpkit: vid('lab/erpkit', 880, 654),
  labMicrosplat: vid('lab/microsplat', 808, 238),
  labProjection: vid('lab/gaussian-projection-bench', 900, 440),
  labAmr: vid('lab/amr-traffic-lab', 896, 276),
  // case studies: TLSe Racing, Projet Fil Rouge, Usine 4.0
  tlseClosedLoop: vid('tlse-closed-loop', 960, 380),
  tlsePlanners: vid('tlse-planners', 890, 300),
  tlseLaps: img('tlse-laps.webp', 1400, 960),
  tlsePlannerFigure: img('tlse-planners.webp', 1294, 1224),
  pfrPad: vid('pfr-pad', 432, 768, false),
  pfrVoice: vid('pfr-voice', 432, 768, false),
  pfrContact: img('pfr-contact.webp', 1584, 1344),
  pfrPipeline: img('pfr-pipeline.webp', 1876, 1372),
  usineThroughput: img('usine-throughput.webp', 1680, 944, true),
} as const;
export type MediaKey = keyof typeof media;

/** The share image of a language: the home page captured with the line written in that language. */
export const ogImage = (lang: Lang): ImageAsset => (lang === 'fr' ? media.ogFr : media.og);

// ------------------------------------------------------------------ side projects

/** Names of the side projects whose repository is public: the keys of `lab.projects` in the language files. */
export const SIDE_NAMES = ['erpkit', 'microsplat', 'gaussian-projection-bench', 'amr-traffic-lab'] as const;
export type SideName = (typeof SIDE_NAMES)[number];

export interface SideProject { name: string; published: boolean; repo?: RepoKey; visual?: MediaKey; stack: string[] }

/**
 * published: false keeps a project in the data and renders nothing for it.
 * This file is public with the site, so a project whose repository is not public yet is not named
 * here: it lives in side.local.ts, next to this file and ignored by git (same shape, default export,
 * published: false), and is merged in below when that file exists.
 * Publishing one = move its entry here with published: true, a repo, a visual and a stack, add its
 * name to SIDE_NAMES and its copy under `lab.projects` in en.ts.
 */
const listed: SideProject[] = [
  { name: 'erpkit', published: true, repo: 'erpkit', visual: 'labErpkit', stack: ['Python', 'NumPy', 'Pillow', 'pytest'] },
  { name: 'microsplat', published: true, repo: 'microsplat', visual: 'labMicrosplat', stack: ['Python', 'NumPy', 'PyTorch', 'pytest'] },
  { name: 'gaussian-projection-bench', published: true, repo: 'gaussian-projection-bench', visual: 'labProjection', stack: ['Python', 'NumPy', 'Matplotlib', 'pytest'] },
  { name: 'amr-traffic-lab', published: true, repo: 'amr-traffic-lab', visual: 'labAmr', stack: ['Python', 'pytest', 'Matplotlib'] },
];
const local = import.meta.glob<{ default: SideProject[] }>('./side.local.ts', { eager: true });
export const sideProjects: SideProject[] = [...listed, ...Object.values(local).flatMap((m) => m.default ?? [])];

const isSideName = (name: string): name is SideName => (SIDE_NAMES as readonly string[]).includes(name);
/** The ones that are rendered: published, with a repository, a visual and a public name. */
export const publishedSide = sideProjects.filter(
  (p): p is SideProject & { name: SideName; repo: RepoKey; visual: MediaKey } =>
    p.published && Boolean(p.repo) && Boolean(p.visual) && isSideName(p.name),
);
