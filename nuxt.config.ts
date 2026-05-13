// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: ['@nuxtjs/color-mode', '@pinia/nuxt'],
  colorMode: {
    classSuffix: ''
  },
  runtimeConfig: {
    mysqlHost: process.env.MYSQL_HOST || '127.0.0.1',
    mysqlPort: Number(process.env.MYSQL_PORT || 3306),
    mysqlUser: process.env.MYSQL_USER || 'app',
    mysqlPassword: process.env.MYSQL_PASSWORD || 'secret',
    mysqlDatabase: process.env.MYSQL_DATABASE || 'tasksdb',
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production'
  }
})
