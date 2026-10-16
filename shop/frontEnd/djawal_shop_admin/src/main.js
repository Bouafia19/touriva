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
        defaultTheme: 'myCustomTheme',
        themes: {
            myCustomTheme: {
                variables: {},
                colors: {
                    primary: '#007BFF',
                    secondary: '#424242',
                    accent: '#82B1FF',
                    error: '#FF5252',
                    info: '#2196F3',
                    success: '#4CAF50',
                    warning: '#FFC107',
                    next: '#4d1d6d'
                } 
            }
        },
    },
})

axios.defaults.baseURL = 'http://localhost:5000/'
// axios.defaults.baseURL = 'https://nextonlinestore-backend.onrender.com'
// axios.defaults.baseURL = 'http://192.168.1.7/'
// axios.defaults.baseURL = 'https://bildoz.com.dz'

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
