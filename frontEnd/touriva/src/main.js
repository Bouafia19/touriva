import { createApp, markRaw } from 'vue'
import axios from 'axios'
import i18n from './lang'
import { createPinia } from 'pinia'

// Vuetify
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import './styles/editorial.css'
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
                    primary: '#173F35',
                    secondary: '#102D27',
                    accent: '#21866B',
                    forestGreen: '#173F35',
                    deepGreen: '#102D27',
                    emerald: '#21866B',
                    warmIvory: '#FAF8F2',
                    sand: '#D9B98C',
                    sandLight: '#F5EDE0',
                    sandDark: '#B89564',
                    error: '#C24545',
                    info: '#2A6F85',
                    success: '#21866B',
                    warning: '#D9943B',
                    next: '#173F35',
                    touriva: '#173F35',
                    tourivaGold: '#D9B98C',
                    tourivaSand: '#D9B98C',
                    surface: '#ffffff',
                    background: '#FAF8F2',
                } 
            }
        },
    },
    defaults: {
        VImg: {
            eager: true,
        },
    },
})

// Dynamic API Base URL from environment variable, LAN IP, or localhost fallback
let rawApiBase = import.meta.env.VITE_API_BASE_URL || 'https://touriva-api.onrender.com'
if (rawApiBase && !rawApiBase.startsWith('http://') && !rawApiBase.startsWith('https://')) {
    rawApiBase = `https://${rawApiBase}`
}
const apiBase = rawApiBase
axios.defaults.baseURL = apiBase.endsWith('/') ? apiBase : `${apiBase}/`

// Attach valid Bearer token to authenticated requests automatically if available
axios.interceptors.request.use(
    config => {
        // If an Authorization header is already set, verify it is not malformed
        if (config.headers && config.headers.Authorization) {
            const authHeader = String(config.headers.Authorization)
            if (authHeader.includes('undefined') || authHeader.includes('null') || authHeader.trim() === 'Bearer') {
                delete config.headers.Authorization
            }
        }
        // If no Authorization header is set, try retrieving token from localStorage
        if (!config.headers.Authorization) {
            try {
                const stored = localStorage.getItem('userInfo')
                if (stored) {
                    const parsed = JSON.parse(stored)
                    const token = parsed?.token
                    if (token && typeof token === 'string' && token !== 'undefined' && token !== 'null' && token.trim() !== '') {
                        config.headers.Authorization = `Bearer ${token}`
                    }
                }
            } catch (e) {
                // Ignore parsing errors
            }
        }
        return config
    },
    error => Promise.reject(error)
)

// Centralized handling of 401 Unauthorized responses
axios.interceptors.response.use(
    response => response,
    async error => {
        const config = error.config
        if (error.response && error.response.status === 401) {
            const url = config?.url || ''
            // Only clear credentials if 401 occurred on a protected route, not on login attempt
            if (!url.includes('login') && !url.includes('signup')) {
                try {
                    localStorage.removeItem('userInfo')
                } catch (e) {}
            }
        }
        return Promise.reject(error)
    }
)

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
