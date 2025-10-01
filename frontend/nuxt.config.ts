import { defineNuxtConfig } from 'nuxt/config';
import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  css: ['~/assets/css/main.css'], // Make sure this file imports tailwindcss (@import "tailwindcss";)

  compatibilityDate: '2025-10-01',

  // Adding Tailwind Vite plugin to enable Tailwind 4 features properly
  vite: {
    plugins: [tailwindcss()],
  },

  postcss: {
    plugins: {
      '@tailwindcss/postcss': {}, // This enables tailwind directives during PostCSS processing
    },
  },

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3001',
    },
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  app: {
    head: {
      title: 'Nuxt Starter App',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'A starter application with Nuxt 3' },
      ],
    },
  },
});
