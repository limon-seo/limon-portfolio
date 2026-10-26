import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://limon-seo.github.io',
  base: '/limon-portfolio/',
  output: 'static',
  trailingSlash: 'always',
  build: {
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
});
