// /robots.txt: everything may be crawled; the sitemap is announced. Built from `site` in
// astro.config.mjs so that the address cannot drift.
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const origin = (site ?? new URL('https://guilhem0908.github.io')).origin;
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap-index.xml\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
