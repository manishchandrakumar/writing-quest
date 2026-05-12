import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://arnav.manishchandrakumar.com',
  base: '/',
  trailingSlash: 'ignore',
  build: {
    assets: 'assets',
  },
});
