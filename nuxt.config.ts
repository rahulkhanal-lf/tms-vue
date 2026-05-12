// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: ['@nuxtjs/color-mode'],
  colorMode: {
    classSuffix: ''  // adds class "dark" (not "dark-mode") to <html>
  }
})
