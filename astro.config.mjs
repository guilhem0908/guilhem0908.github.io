import { existsSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const SITE = 'https://guilhem0908.github.io';

// The same page in the other language, for the sitemap. The pages declare it themselves with
// hreflang (src/components/Seo.astro); the route names are those of src/i18n/routes.ts.
const french = existsSync(new URL('./src/data/fr.ts', import.meta.url));
const TWINS = [['/work/', '/fr/projets/'], ['/lab/', '/fr/labo/'], ['/cv/', '/fr/cv/'], ['/', '/fr/']];
function alternates(url) {
  const path = new URL(url).pathname;
  for (const [en, fr] of TWINS) {
    const home = en === '/';
    if (home ? path === fr : path.startsWith(fr)) return { en: SITE + en + path.slice(fr.length), fr: SITE + path };
    if (home ? path === en : path.startsWith(en)) return { en: SITE + path, fr: SITE + fr + path.slice(en.length) };
  }
  return null;
}

// User site: served at the root of https://guilhem0908.github.io, so there is no `base`.
// Every page lives at <path>/index.html and is linked with its trailing slash (the canonical form).
export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'always',
  // sitemap-index.xml and sitemap-0.xml; the 404 page is left out by the integration.
  // Each URL lists its language alternates (xhtml:link), as each page does with hreflang.
  integrations: [
    sitemap({
      serialize(item) {
        const alt = french ? alternates(item.url) : null;
        if (alt) {
          item.links = [
            { lang: 'en', url: alt.en },
            { lang: 'fr', url: alt.fr },
            { lang: 'x-default', url: alt.en },
          ];
        }
        return item;
      },
    }),
  ],
  devToolbar: { enabled: false },
  server: { port: 4321, host: '127.0.0.1' },
  vite: {
    worker: { format: 'es' },
    build: { chunkSizeWarningLimit: 900 },
  },
});
