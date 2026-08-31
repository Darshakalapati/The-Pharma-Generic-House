// Twitter/X reuses the Open Graph card verbatim. `runtime` must be a literal
// in each route file — Next cannot follow a re-export for it.
export const runtime = 'nodejs';
export { default, alt, size, contentType } from './opengraph-image';
