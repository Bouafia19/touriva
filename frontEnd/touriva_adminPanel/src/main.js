import { createApp, markRaw } from 'vue'
import axios from 'axios'
import i18n from './lang'
import { createPinia } from 'pinia'

// Vuetify
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import '@/styles/admin-editorial.css'
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
        defaultTheme: 'tourivaAdminTheme',
        themes: {
            tourivaAdminTheme: {
                dark: false,
                variables: {},
                colors: {
                    primary: '#173F35',
                    secondary: '#102D27',
                    accent: '#21866B',
                    error: '#C24545',
                    info: '#2A6F85',
                    success: '#21866B',
                    warning: '#D9943B',
                    surface: '#FFFFFF',
                    background: '#FAF8F2',
                    forestGreen: '#173F35',
                    deepGreen: '#102D27',
                    emerald: '#21866B',
                    warmIvory: '#FAF8F2',
                    sand: '#D9B98C',
                    sandLight: '#F5EDE0',
                    sandDark: '#B89564',
                    next: '#173F35',
                    touriva: '#173F35',
                } 
            }
        },
    },
})

// Dynamic API Base URL from environment variable or proxy fallback
const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4004/'
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
