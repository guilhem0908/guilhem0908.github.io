// Content loader. English always exists. Any other language is switched on by the mere
// presence of its file: adding src/data/fr.ts (default export of type SiteContent) is all it
// takes for the French routes, the hreflang links and the language switch to appear.

import en from './en';
import { DEFAULT_LANG, LANGS, type Lang } from './site';
import type { SiteContent } from './types';

const optional = import.meta.glob<{ default: SiteContent }>('./fr.ts', { eager: true });

const byLang: Partial<Record<Lang, SiteContent>> = { en };
for (const [file, mod] of Object.entries(optional)) {
  const lang = file.replace('./', '').replace('.ts', '') as Lang;
  if ((LANGS as readonly string[]).includes(lang) && mod?.default) byLang[lang] = mod.default;
}

/** Languages that have a content file, default first. */
export const availableLangs: Lang[] = LANGS.filter((l) => byLang[l]);

/** Content for a language; falls back to English when the language has no file. */
export function getContent(lang: Lang): SiteContent {
  return byLang[lang] ?? byLang[DEFAULT_LANG]!;
}

export const hasLang = (lang: Lang) => Boolean(byLang[lang]);
