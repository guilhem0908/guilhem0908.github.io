// The site map, in one place. English is the default language and has no prefix;
// every other language lives under /<lang>/ with its own segment names.
//
//   /                          /fr/
//   /work/<slug>/              /fr/projets/<slug>/
//   /lab/                      /fr/labo/
//   /cv/                       /fr/cv/
//
// A page exists only if its switch is on (data/site.ts) and its content exists (data/<lang>.ts).

import { availableLangs, getContent } from '../data';
import { cvLangs, hasCv } from '../data/cv';
import { CASE_SLUGS, DEFAULT_LANG, caseStudies, flags, type CaseSlug, type Lang } from '../data/site';

/** '404' is the not-found page: it exists once, at /404.html, and is never listed or translated. */
export type PageKind = 'home' | 'work' | 'lab' | 'cv' | '404';

export const SEGMENTS: Record<Lang, { work: string; lab: string; cv: string }> = {
  en: { work: 'work', lab: 'lab', cv: 'cv' },
  fr: { work: 'projets', lab: 'labo', cv: 'cv' },
};

const prefix = (lang: Lang) => (lang === DEFAULT_LANG ? '' : `/${lang}`);

/** Absolute path (with trailing slash) of a page in a language. */
export function href(lang: Lang, kind: PageKind, slug?: CaseSlug): string {
  const p = prefix(lang);
  const seg = SEGMENTS[lang];
  if (kind === '404') return '/404.html';
  if (kind === 'home') return `${p}/`;
  if (kind === 'work') return `${p}/${seg.work}/${slug}/`;
  if (kind === 'lab') return `${p}/${seg.lab}/`;
  return `${p}/${seg.cv}/`;
}

/** True when the case study can be linked: switched on, and written in English. */
export function caseReady(slug: CaseSlug): boolean {
  return caseStudies[slug].ready && Boolean(getContent(DEFAULT_LANG).work[slug]);
}

export const readyCases = (): CaseSlug[] => CASE_SLUGS.filter(caseReady);

/** True when the CV page can be linked in a language: switched on, and written in that language. */
export const cvReady = (lang: Lang = DEFAULT_LANG): boolean => flags.cvPage && hasCv(lang);

/** The case study that follows `slug` among the published ones, or null when it is the last. */
export function nextCase(slug: CaseSlug): CaseSlug | null {
  const list = readyCases();
  const i = list.indexOf(slug);
  return i >= 0 && i < list.length - 1 ? list[i + 1] : null;
}

/** Other languages in which the same page exists: for hreflang and the language switch. */
export function alternates(kind: PageKind, slug?: CaseSlug): { lang: Lang; href: string }[] {
  if (kind === '404') return [];
  const langs = kind === 'cv' ? cvLangs : availableLangs;
  return langs.map((lang) => ({ lang, href: href(lang, kind, slug) }));
}

/** Languages in which the CV page is generated, other than the default one. */
export const cvPrefixedLangs = (): Lang[] => cvLangs.filter((l) => l !== DEFAULT_LANG);

/** Languages other than the default that have a content file (they get /<lang>/ routes). */
export const prefixedLangs = (): Lang[] => availableLangs.filter((l) => l !== DEFAULT_LANG);
