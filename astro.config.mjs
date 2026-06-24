// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://siemenspart.com',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
  // پروژه کاملاً تک‌زبانه فارسی است؛ i18n داخلی Astro استفاده نمی‌شود.
});
