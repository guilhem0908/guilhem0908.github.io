// French typography, applied once to a whole language file (data/fr.ts, data/cv/fr.ts, data/shell.ts).
//
// The copy is written with ordinary spaces and straight guillemets spacing; this function walks the
// finished object and makes the spaces the right ones, so that no sentence depends on an editor
// remembering to type a non-breaking space:
//
//   - a no-break space before  :  and a narrow no-break space before  ;  !  ?  and  %
//   - guillemets: « text » with no-break spaces inside
//   - a thin no-break space as the thousands separator (3 473 858)
//   - no line break between a number and its unit or noun (4 m, 14 vues, 28 / 28, 4096 × 2048)
//   - no line break inside names built from a word and a number (Usine 4.0, ROS 2, Phase 3)
//   - day and month, month and year stay together (15 avril, juin 2027)
//   - the typographic apostrophe (’) between two letters
//
// Strings that hold no space before a mark (URLs, "https://...") are left alone. The decimal comma is
// the author's job: numbers are written 0,037 in the French file, never converted here.

const NBSP = String.fromCodePoint(0x00a0); // no-break space
const NNBSP = String.fromCodePoint(0x202f); // narrow no-break space

const MONTHS = 'janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre';

type Replacer = string | ((substring: string, ...groups: string[]) => string);
const rules: [RegExp, Replacer][] = [
  // apostrophes between two letters
  [/(?<=\p{L})'(?=\p{L})/gu, '’'],
  // guillemets
  [/«\s+/g, `«${NBSP}`],
  [/\s+»/g, `${NBSP}»`],
  // high punctuation: a space before it becomes a no-break one
  [/ (?=:)/g, NBSP],
  [/ (?=[;!?])/g, NNBSP],
  // percent sign after a number
  [/(?<=\d) (?=%)/g, NNBSP],
  // thousands separator: 1 to 3 digits, then groups of 3 (never touch a decimal part)
  [/(?<![\d,.])(\d{1,3})((?: \d{3})+)(?![\d])/g, (_m, a, rest) => a + rest.replace(/ /g, NNBSP)],
  // a number stays with the sign or the word that follows it
  [/(?<=\d) (?=[×→/°]|[\p{L}])/gu, NBSP],
  [/(?<=[×→/]) (?=\d)/g, NBSP],
  // a word and its number
  [/\b(Usine|ROS|Phase|Partie|Bootstrap|HY-World|UR|SRI) (?=\d)/g, `$1${NBSP}`],
  // dates
  [new RegExp(`(?<=\\b\\d{1,2}) (?=(?:${MONTHS})\\b)`, 'g'), NBSP],
  [new RegExp(`(?<=\\b(?:${MONTHS})) (?=\\d{4}\\b)`, 'g'), NBSP],
];

export function fixFrenchString(input: string): string {
  let s = input;
  for (const [re, to] of rules) s = s.replace(re, to as string & ((m: string, ...g: string[]) => string));
  return s;
}

/** Deep copy of `value` with every string run through the French rules. */
export function frenchTypography<T>(value: T): T {
  if (typeof value === 'string') return fixFrenchString(value) as unknown as T;
  if (Array.isArray(value)) return value.map((v) => frenchTypography(v)) as unknown as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, frenchTypography(v)])) as T;
  }
  return value;
}
