export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  modules: ['@nuxt/ui', '@pinia/nuxt', '@nuxtjs/i18n', '@vueuse/nuxt', '@nuxt/image'],

  css: ['~/assets/css/main.css'],

  // Admin panel is a SPA (talks to the NestJS API with a Bearer token)
  ssr: false,

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:4000/api',
      apiOrigin: process.env.NUXT_PUBLIC_API_ORIGIN || 'http://localhost:4000',
      socketUrl: process.env.NUXT_PUBLIC_SOCKET_URL || 'http://localhost:4000',
    },
  },

  app: {
    head: {
      title: 'ShoeStore Admin Panel',
      htmlAttrs: { lang: 'lo' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'ShoeStore — ລະບົບຈັດການຮ້ານຂາຍເກີບ' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },

  i18n: {
    locales: [
      { code: 'lo', name: 'ລາວ', file: 'lo.json' },
      { code: 'en', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'lo',
    strategy: 'no_prefix',
    langDir: 'locales',
    detectBrowserLanguage: { useCookie: true, cookieKey: 'shoestore_locale', redirectOn: 'root' },
  },

  ui: {
    colorMode: false,
  },

  typescript: { strict: false },

  vite: {
    optimizeDeps: { include: ['echarts', 'vue-echarts', 'dayjs', 'socket.io-client'] },
  },
})
