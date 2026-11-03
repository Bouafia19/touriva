import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Home from '../views/Home.vue'
import AdminCategoryList from '@/views/admin/AdminCategoryList.vue'
import AdminCategoryForm from '@/views/admin/AdminCategoryForm.vue'

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
          path: '/home',
          name: 'Home',
          component: Home,
          meta: { requiresAuth: true }
        },
        {
          path: '/dashboard',
          name: 'Dashboard',
          component: () => import('@/views/Dashboard.vue'),
          meta: { requiresAuth: true }
        },
        // Marketplace Operator Routes
        {
          path: '/admin/seller-applications',
          name: 'SellerApplications',
          component: () => import('@/views/admin/SellerApplications.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/admin/sellers',
          name: 'SellersList',
          component: () => import('@/views/admin/SellersList.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/admin/products/moderation',
          name: 'ProductModeration',
          component: () => import('@/views/admin/ProductModeration.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/admin/orders',
          name: 'MarketplaceOrders',
          component: () => import('@/views/admin/MarketplaceOrders.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/admin/commissions',
          name: 'CommissionLedger',
          component: () => import('@/views/admin/CommissionLedger.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/admin/marketplace-settings',
          name: 'MarketplaceSettings',
          component: () => import('@/views/admin/MarketplaceSettings.vue'),
          meta: { requiresAuth: true }
        },
        // General Catalog & Platform Management
        {
          path: '/products',
          name: 'Products',
          component: () => import('../views/Product/index.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/orders',
          name: 'Orders',
          component: () => import('@/views/Order/index.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/admin/categories',
          name: 'AdminCategories',
          component: AdminCategoryList,
          meta: { requiresAuth: true }
        },
        {
          path: '/admin/category/add',
          name: 'AddCategory',
          component: AdminCategoryForm,
          meta: { requiresAuth: true }
        },
        {
          path: '/admin/category/edit/:categoryId',
          name: 'EditCategory',
          component: AdminCategoryForm,
          props: true,
          meta: { requiresAuth: true }
        },
        {
          path: '/users',
          name: 'Users',
          component: () => import('../views/User/index.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/setting',
          name: 'Settings',
          component: () => import('@/views/Setting.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/about',
          name: 'About',
          component: () => import('../views/About.vue'),
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
