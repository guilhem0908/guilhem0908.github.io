// Shape of the CV copy. cv/en.ts implements it; cv/fr.ts must implement the same shape:
// its presence switches on /fr/cv/ and the French PDF (see cv/index.ts and tools/cv_pdf.py).
// Facts that do not depend on the language (name, email, links) live in ../site.ts.

import type { Lang } from '../site';

export interface CvLink { label: string; href: string }

export interface CvEntry {
  /** a role, a degree or a project name */
  title: string;
  /** a period, set at the right of the title */
  when: string;
  /** the organisation line under the title */
  org?: string;
  /** a short status tag next to the title ("In progress") */
  tag?: string;
  bullets?: string[];
  /** one small, secondary sentence under the bullets */
  note?: string;
  /** repositories and documents, shown as a "Code" line */
  links?: CvLink[];
}

export interface CvContent {
  lang: Lang;
  /** document title and description of the /cv/ page */
  meta: { title: string; description: string };
  ui: {
    /** accessible name of the sheet */
    sheetLabel: string;
    download: string;
    print: string;
    /** one line under the buttons, e.g. "One A4 page." */
    pageNote: string;
    /** the word before the size of the PDF, e.g. "PDF" */
    pdfWord: string;
    /** the unit of the size of the PDF: "KB", "Ko" */
    sizeUnit: string;
    /** label of the repository line under an entry */
    code: string;
  };
  header: {
    title: string;
    location: string;
    seeking: { tag: string; text: string; fields: string };
  };
  headings: { education: string; research: string; projects: string; side: string; skills: string; languages: string; other: string };
  education: CvEntry[];
  research: CvEntry[];
  projects: CvEntry[];
  /** side projects: one line each, under a heading and a one-sentence disclosure */
  side: { note: string; items: { name: string; text: string; href: string }[] };
  skills: { group: string; items: string }[];
  languages: { name: string; level: string }[];
  other: CvEntry[];
}
