import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Home from '../views/Home.vue'
import AdminCategoryList from '@/views/admin/AdminCategoryList.vue';
import AdminCategoryForm from '@/views/admin/AdminCategoryForm.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/tabs',
      component: () => import('@/layouts/MainLayout.vue'),
      children: [
        {
          path: '/',
          name: 'Home',
          component: Home,
          meta: { requiresAuth: true }
        },
        {
          path: '/about',
          name: 'About',
          component: () => import('../views/About.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/dashboard',
          name: 'Dashboard',
          component: () => import('@/views/Dashboard.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/setting',
          name: 'Settings',
          component: () => import('@/views/Setting.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/users',
          name: 'Users',
          component: () => import('../views/User/index.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/brands',
          name: 'Brands',
          component: () => import('../views/Brand/index.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/activities',
          name: 'Activities',
          component: () => import('../views/Activity/index.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/restaurants',
          name: 'Restaurants',
          component: () => import('../views/Restaurant/index.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/sites',
          name: 'Sites',
          component: () => import('../views/Site/index.vue'),
          meta: { requiresAuth: true }
        },
         {
          path: '/hotels',
          name: 'Hotels',
          component: () => import('../views/Hotel/index.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/trips',
          name: 'Trips',
          component: () => import('../views/Trip/index.vue'),
          meta: { requiresAuth: true }
        },
         {
          path: '/tripSubscriptions',
          name: 'TripSubscriptions',
          component: () => import('../views/Trip/subscriptions.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/ads',
          name: 'Ads',
          component: () => import('../views/Advertising/index.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/publications',
          name: 'Publications',
          component: () => import('../views/Publication/index.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/plans',
          name: 'Plans',
          component: () => import('../views/Plan/index.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/notifications',
          name: 'Notifications',
          component: () => import('../views/Notification/index.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/location',
          name: 'Location',
          component: () => import('../views/Location.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/terms&conditions',
          name: 'TermsConditions',
          component: () => import('../views/Terms&Conditions/index.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/user',
          name: 'Account',
          component: () => import('../views/User/Account.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/billing',
          name: 'Billing',
          component: () => import('@/views/Billing/index.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/billing/:id/:typeAccount?',
          name: 'Detail',
          component: () => import('@/views/Billing/detail.vue'),
          meta: { requiresAuth: true },
          props: true
        },
        {
          path: '/billing/new',
          name: 'NewBilling',
          component: () => import('@/views/Billing/new.vue'),
          meta: { requiresAuth: true },
          props: true
        },
        {
          path: '/roles',
          name: 'Roles',
          component: () => import('@/views/Roles.vue'),
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
          path: '/forbidden',
          name: 'Forbidden',
          component: () => import('@/views/Forbidden.vue')
        },
      ],
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/auth/Login.vue')
    }
  ]
})

router.beforeEach((to, from, next) => {
  if(to.meta.requiresAuth){
      const auth = useAuthStore()
      const ls = JSON.parse(localStorage.getItem('userInfo'))
      if(ls){
        auth.attempt(ls.token).then((value) => {
          if(value === false && to.name != 'Login'){
            next({ name: "Login" })
          }else{
            // if(store.getters.ability.can('read', to.name) || ['Account', 'Home', 'About'].includes(to.name)){
              next() 
            // }else{
            //   next({ name: "Forbidden" })
            // }
          }
        })
      }else{
        next({ name: "Login" })
      }
  }else{
    next()
  }
});

export default router
