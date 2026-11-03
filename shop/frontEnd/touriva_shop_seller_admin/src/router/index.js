import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      children: [
        {
          path: '',
          redirect: '/dashboard'
        },
        {
          path: '/dashboard',
          name: 'Dashboard',
          component: () => import('@/views/Dashboard.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/products',
          name: 'Products',
          component: () => import('@/views/Product/index.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/orders',
          name: 'Orders',
          component: () => import('@/views/Order/index.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/finances',
          name: 'Finances',
          component: () => import('@/views/Finances.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/store-profile',
          name: 'StoreProfile',
          component: () => import('@/views/StoreProfile.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/setting',
          redirect: '/store-profile'
        },
        {
          path: '/user',
          name: 'Account',
          component: () => import('@/views/User/Account.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/about',
          name: 'About',
          component: () => import('@/views/About.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/forbidden',
          name: 'Forbidden',
          component: () => import('@/views/Forbidden.vue')
        }
      ]
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/auth/Login.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/dashboard'
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const auth = useAuthStore()
    const ls = JSON.parse(localStorage.getItem('userInfo'))
    if (ls && ls.token) {
      auth.attempt(ls.token).then((valid) => {
        if (valid === false && to.name !== 'Login') {
          next({ name: 'Login' })
        } else {
          next()
        }
      }).catch(() => {
        next()
      })
    } else {
      next({ name: 'Login' })
    }
  } else {
    next()
  }
})

export default router
