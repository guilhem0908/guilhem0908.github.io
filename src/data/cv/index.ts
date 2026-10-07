// CV copy loader. English always exists. Any other language is switched on by the presence of
// its file: adding src/data/cv/fr.ts (default export of type CvContent) creates /fr/cv/, its
// hreflang link and the language switch on the CV page. `python tools/cv_pdf.py` then renders
// the matching PDF (public/cv/Guilhem_Carmouze_CV_FR.pdf) from the built page.

import en from './en';
import { DEFAULT_LANG, LANGS, type Lang } from '../site';
import type { CvContent } from './types';

const optional = import.meta.glob<{ default: CvContent }>('./fr.ts', { eager: true });

const byLang: Partial<Record<Lang, CvContent>> = { en };
for (const [file, mod] of Object.entries(optional)) {
  const lang = file.replace('./', '').replace('.ts', '') as Lang;
  if ((LANGS as readonly string[]).includes(lang) && mod?.default) byLang[lang] = mod.default;
}

/** Languages that have a CV, default first. */
export const cvLangs: Lang[] = LANGS.filter((l) => byLang[l]);

export const hasCv = (lang: Lang) => Boolean(byLang[lang]);

/** CV copy for a language; falls back to English. */
export function getCv(lang: Lang): CvContent {
  return byLang[lang] ?? byLang[DEFAULT_LANG]!;
}

/** Published file name of the PDF, e.g. Guilhem_Carmouze_CV_EN.pdf. */
export const cvPdfName = (lang: Lang) => `Guilhem_Carmouze_CV_${lang.toUpperCase()}.pdf`;

/** Site path of the PDF, e.g. /cv/Guilhem_Carmouze_CV_EN.pdf (public/cv/ holds the files). */
export const cvPdfPath = (lang: Lang) => `/cv/${cvPdfName(lang)}`;
