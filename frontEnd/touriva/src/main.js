import { createApp, markRaw } from 'vue'
import axios from 'axios'
import i18n from './lang'
import { createPinia } from 'pinia'

// Vuetify
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import App from './App.vue'
import router from './router'

const vuetify = createVuetify({
    components,
    directives,
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
            mdi,
        },
    },
    theme: {
        defaultTheme: 'tourivaTheme',
        themes: {
            tourivaTheme: {
                dark: false,
                variables: {},
                colors: {
                    primary: '#0f766e',
                    secondary: '#0f172a',
                    accent: '#f59e0b',
                    error: '#ef4444',
                    info: '#0284c7',
                    success: '#10b981',
                    warning: '#f59e0b',
                    next: '#0f766e',
                    touriva: '#0f766e',
                    tourivaGold: '#f59e0b',
                    surface: '#ffffff',
                    background: '#f8fafc',
                } 
            }
        },
    },
})

// Dynamic API Base URL from environment variable or proxy fallback
const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/'
axios.defaults.baseURL = apiBase.endsWith('/') ? apiBase : `${apiBase}/`

const app = createApp(App)
const pinia = createPinia()

pinia.use(({ store }) => {
    store.router = markRaw(router)
})

app.use(i18n)
app.use(vuetify)
app.use(pinia)
app.use(router)

app.mount('#app')
