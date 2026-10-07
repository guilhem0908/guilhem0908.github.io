// Check the built site: every internal link must resolve to a file of dist/, and every repository
// the site links on GitHub must be public. Run after `npm run build`:
//
//   node tools/check_links.mjs            internal links, then the repositories (needs the network)
//   node tools/check_links.mjs --offline  internal links only
//
// The deploy workflow runs it before publishing, so the site cannot go live with a link to a
// repository that is still private or missing: publish the repository first, or switch the project
// off in src/data/site.ts (published: false). Only a 404 fails the check; a network error or a
// rate limit is reported and tolerated. No dependency: Node 22 or newer.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const offline = process.argv.includes('--offline');
if (!existsSync(DIST)) { console.error('no dist/: run `npm run build` first'); process.exit(2); }

const walk = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const pages = walk(DIST).filter((f) => f.endsWith('.html'));
const ids = new Map(); // file -> Set of the ids it declares
const idsOf = (file) => {
  if (!ids.has(file)) ids.set(file, new Set([...readFileSync(file, 'utf8').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  return ids.get(file);
};
const fileOf = (path) => {
  const p = join(DIST, decodeURIComponent(path));
  if (existsSync(p) && statSync(p).isFile()) return p;
  const index = join(p, 'index.html');
  return existsSync(index) ? index : null;
};

const broken = [];
const repos = new Map(); // repository URL -> pages that link it
for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  const name = page.slice(DIST.length).split(sep).join('/');
  for (const m of html.matchAll(/\s(?:href|src|poster)="([^"]+)"/g)) {
    const url = m[1].replaceAll('&amp;', '&');
    if (/^(mailto:|tel:|data:)/.test(url)) continue;
    const gh = url.match(/^https:\/\/github\.com\/([\w.-]+\/[\w.-]+)/);
    if (gh) {
      const key = 'https://github.com/' + gh[1];
      repos.set(key, (repos.get(key) ?? new Set()).add(name));
      continue;
    }
    if (/^https?:/.test(url)) continue;
    const [path, hash] = url.split('#');
    const target = path === '' ? page : path.startsWith('/') ? fileOf(path) : null;
    if (!target) { broken.push(`${name}: ${url} (no such file)`); continue; }
    if (hash && target.endsWith('.html') && !idsOf(target).has(hash)) broken.push(`${name}: ${url} (no element with this id)`);
  }
}
console.log(`${pages.length} pages, internal links: ${broken.length ? broken.length + ' broken' : 'all resolve'}`);
broken.forEach((b) => console.log('  ' + b));

let missing = 0;
if (!offline) {
  for (const [url, from] of [...repos].sort()) {
    let status;
    try {
      status = (await fetch(url, { method: 'HEAD', redirect: 'follow' })).status;
    } catch (e) {
      status = `network error (${e.cause?.code ?? e.message})`;
    }
    if (status === 404) missing++;
    const mark = status === 404 ? 'MISSING' : status === 200 ? 'ok     ' : 'unsure ';
    console.log(`  ${mark} ${status}  ${url}  (linked from ${from.size} page${from.size > 1 ? 's' : ''})`);
  }
  console.log(missing
    ? `${missing} linked repositor${missing > 1 ? 'ies are' : 'y is'} not public: publish ${missing > 1 ? 'them' : 'it'} before deploying the site`
    : 'every linked repository answers');
}
process.exit(broken.length || missing ? 1 : 0);
