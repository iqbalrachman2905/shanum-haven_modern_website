import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // 1. URL utama GitHub Pages lo
  site: 'https://purikencanapermai2.com',
  
  // 2. Base path sesuai nama repo supaya gambar gak error/404
  //base: '/pkp2-extension-version2',

  // 3. Integrasi bawaan lo
  integrations: [vue(), sitemap()],

  // 4. Konfigurasi gambar (wajib buat ngambil dari Google Drive)
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
    domains: ['drive.google.com']
  }
});
