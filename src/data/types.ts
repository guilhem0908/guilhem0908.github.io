// Shape of a language file. en.ts implements it; fr.ts must implement the same shape.

import type { CaseSlug, Lang, MediaKey, RepoKey, SideName } from './site';

export interface LinkItem { label: string; href: string }

/** A number set large, with its exact meaning in small type. */
export interface BigFigure {
  value: string;
  /** shown struck through before the value, for "from -> to" figures */
  from?: string;
  unit?: string;
  meaning: string;
}

/** Building blocks of a case-study section. */
export type Block =
  | { kind: 'text'; title?: string; body: string[] }
  | { kind: 'list'; title?: string; items: { title?: string; text: string }[] }
  | { kind: 'figures'; items: BigFigure[] }
  | { kind: 'media'; media: MediaKey; alt: string; caption: string; wide?: boolean }
  | { kind: 'pair'; items: { media: MediaKey; alt: string; caption: string }[] }
  /** a row of clips side by side, each at its own ratio (portrait phone recordings) */
  | { kind: 'strip'; items: { media: MediaKey; alt: string; caption: string }[] }
  | { kind: 'steps'; items: { tag: string; title: string; body: string; note?: string; repo?: RepoKey; repoNote?: string }[] }
  | { kind: 'pipeline'; title: string; legend: { mine: string; upstream: string }; loopLabel: string; caption: string;
      nodes: { label: string; detail?: string; mine: boolean; loop?: boolean }[] }
  | { kind: 'table'; caption: string; head: string[]; rows: string[][] };

export interface CaseStudy {
  /** document title and meta description */
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  title: string;
  /** one sentence */
  outcome: string;
  /** optional display word shown as a window onto real media */
  window?: { word: string; media: MediaKey };
  meta: { role: string; team: string; period: string; organisation: string; stack: string };
  /** where the Video button points (an id on the page), if the lead of the page is a clip */
  videoAnchor?: string;
  lead:
    | { kind: 'compare'; before: MediaKey; after: MediaKey; beforeLabel: string; afterLabel: string; alt: string; caption: string; slider: string }
    | { kind: 'media'; media: MediaKey; alt: string; caption: string };
  summary: { problem: string; built: string; result: string };
  context: Block[];
  built: Block[];
  results: Block[];
  failed: Block[];
  credits: Block[];
  links: LinkItem[];
}

export interface Room {
  kicker: string;
  title: string;
}

export interface SideCopy {
  /** one sentence: what the project is */
  what: string;
  /** what the visual shows (also its alt text) */
  shows: string;
  /** one measured result, reproduced by a script in the repository */
  result: BigFigure;
  /** which part of the real work it extends */
  extends: string;
  /** home page, for a project listed in one line rather than as a card: what it is and its result, in one sentence */
  short?: string;
  /** licence line of third-party images in the clip, shown under it */
  credit?: string;
}

export interface SiteContent {
  lang: Lang;
  /** BCP 47 tag for <html lang> and number formatting */
  locale: string;
  meta: { homeTitle: string; homeDescription: string; labTitle: string; labDescription: string; ogAlt: string };
  ui: {
    skipToContent: string;
    nav: { label: string; home: string; work: string; lab: string; cv: string; github: string; switchTo: string; switchLabel: string };
    readCase: string;
    caseSoon: string;
    backToRun: string;
    code: string; report: string; video: string;
    repository: string;
    /** the label before a repository name, punctuation included: "Repository:" */
    repositoryLabel: string;
    external: string;
    caseLabels: {
      role: string; team: string; period: string; organisation: string; stack: string;
      summary: string; problem: string; built: string; result: string;
      context: string; builtTitle: string; results: string; failed: string; credits: string; links: string; next: string;
      nextLab: string;
    };
    footer: { rights: string; built: string; contact: string };
  };
  person: { line: string; school: string; city: string; languages: string };
  seeking: { tag: string; short: string; long: string; fields: string };
  home: {
    heroLinks: { cv: string; github: string; linkedin: string; email: string; skip: string };
    /** the invitation at the start of the run: what to do (wheel, touch), and the button that does it */
    cue: { scroll: string; swipe: string; start: string };
    posterAlt: string;
    start3d: string;
    run: {
      /** strings used by the WebGL run (serialised to the client) */
      intro: { building: string; training: string; slicing: string; planning: string; iterations: string; gaussians: string; residual: string; grid: string; path: string; pending: string; cells: string; skip: string };
      hud: { label: string; waypoint: string; pose: string; run: string; gaussians: string; mapAlt: string; jump: string; planView: string };
      zones: { lobby: string; vestibule: string; aist: string; track: string; factory: string; pen: string };
      /** prefix includes its punctuation: "View:" */
      view: { prefix: string; colour: string; depth: string; ellipsoids: string };
      lens: { depth: string; ellipsoids: string };
      bearing: string;
      /** the instrument panel behind ?perf=1 */
      perf: { title: string; frame: string; gpu: string; scale: string; level: string; splats: string; sort: string; long: string; device: string; none: string; auto: string; script: string; browser: string };
    };
    waypoints: { hero: string; aist: string; tlse: string; usine: string; pfr: string; lab: string; work: string; contact: string };
    /** one stage, as long as the other rooms: the detail is on the case-study page */
    aist: Room & {
      host: string;
      giant: string;
      /** the one stage inside the room: a title and two or three sentences */
      stageTitle: string; text: string[];
      /** the before / after still: its labels, which run it comes from, its alt text and the name of its slider */
      rawLabel: string; fixedLabel: string; caption: string; stillAlt: string; slider: string;
      /** shown only in the 3D run, where the visitor stands in the room built from that still */
      roomNote: string;
      /** two figures, each with its exact meaning */
      figures: { rig: BigFigure; depth: BigFigure };
    };
    svlr: { title: string; text: string; link: string };
    tlse: Room & { marquee: string; mine: string; team: string; also: string; demo: string; range: string; opening: string; selected: string };
    usine: Room & { status: string; text: string; note: string };
    pfr: Room & { mine: string; team: string; before: string; feedWall: string; feed: string; hmi: string; demo: string; robotAlt: string };
    lab: { title: string; text: string; more: string; others: string };
    index: { title: string; text: string; rows: Record<CaseSlug, { when: string; name: string; line: string }>; room: string };
    contact: { title: string };
  };
  /** case studies; a slug without an entry here cannot be published */
  work: Partial<Record<CaseSlug, CaseStudy>>;
  lab: {
    kicker: string;
    title: string;
    intro: string;
    /** said once, plainly */
    disclosure: string;
    labels: { shows: string; result: string; stack: string; extends: string };
    projects: Partial<Record<SideName, SideCopy>>;
    outro: string;
  };
}
