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
import * as labs from 'vuetify/labs/components'


// Editorial styles
import './styles/admin-editorial.css'

import App from './App.vue'
import router from './router'

const vuetify = createVuetify({
    components: {
        ...components,
        ...labs,
    },
    directives,
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
            mdi,
        },
    },
    theme: {
        defaultTheme: 'tourivaSellerTheme',
        themes: {
            tourivaSellerTheme: {
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
                    surface: '#ffffff',
                    background: '#FAF8F2',
                    next: '#173F35',
                    touriva: '#173F35',
                } 
            }
        },
    },
})

const apiBase = import.meta.env.VITE_SHOP_API_BASE_URL || 'http://localhost:5000/'
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
