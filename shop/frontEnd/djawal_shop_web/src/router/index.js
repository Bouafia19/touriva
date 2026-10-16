import { createRouter, createWebHistory } from 'vue-router'
import { Capacitor } from "@capacitor/core"
import { useAuthStore } from '@/stores/auth'
import Home from '../views/Home.vue'
import AnnouncementDetail from '@/views/AnnouncementDetail.vue'
import Categories from '@/views/category/Categories.vue'
import ProductDetail from '@/views/Product/detail.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/tabs'
    },
    {
      path: '/home',
      name: 'Home',
      component: Home
    },
    {
      path: '/tabs',
      component: () => import('@/layouts/MainLayout.vue'),
      children: [
        {
          path: '',
          name: 'Tabs',
          component: () => import('@/views/Tabs.vue')
        },
        {
          path: '/announcement/:announcementId',
          name: 'AnnouncementDetail',
          component: AnnouncementDetail,
          props: true,
        },
        {
          path: '/updateProfile',
          name: 'UpdateProfile',
          component: () => import('@/views/UpdateProfile.vue'),
          meta: { requiresAuth: true, title: 'ProfileUpdate' }
        },
        {
          path: '/advertising',
          name: 'Advertising',
          component: () => import('@/views/Advertising.vue'),
          meta: { requiresAuth: true, title: 'Advertising' }
        },
        {
          path: '/categories',
          name: 'Categories',
          component: Categories,
        },
        {
          path: '/subcategories/:id',
          name: 'Subcategories',
          component: () => import('@/views/category/Subcategories.vue'),
        },
        {
          path: '/publications/:id',
          name: 'Publications',
          component: () => import('@/views/Publication/Publications.vue'),
        },
        {
          path: '/products',
          name: 'Products',
          component: () => import('@/views/Product/index.vue'),
        },
        {
          path: '/wallpaper',
          name: 'Wallpaper',
          component: () => import('@/views/Product/index.vue'),
        },
        {
          path: '/painting',
          name: 'Painting',
          component: () => import('@/views/Product/index.vue'),
        },
        {
          path: '/product/:productId',
          name: 'ProductDetail',
          component: ProductDetail,
          props: true,
        },
        {
          path: '/orders',
          name: 'Orders',
          component: () => import('@/views/Order/index.vue'),
          meta: { requiresAuth: true, title: 'Orders' }
        },
      ],
    },
    {
      path: '/user',
      component: () => import('@/layouts/PageLayout.vue'),
      // component: () => {
      //   return Capacitor.isNativePlatform() ? import('@/layouts/PageLayout.vue') : import('@/layouts/MainLayout.vue');
      // },
      children: [
        { path: '/login', 
          name: 'Login',  
          meta: { title: 'Login' }, 
          component: () => import('@/views/user/Login.vue') 
        },
        { path: '/signup',
          name: 'Signup',  
          meta: { title: 'SignUp' }, 
          component: () => import('@/views/user/Signup.vue') 
        },
        {
          path: '/notifications',
          name: 'Notifications',
          component: () => import('@/views/profile/Notifications.vue'),
          meta: { requiresAuth: true, title: 'notifications' }
        },
        {
          path: '/contactSupport',
          name: 'ContactSupport',
          component: () => import('@/views/profile/ContactSupport.vue'),
          meta: { title: 'contactSupport' }
        },
        {
          path: '/documents',
          name: 'Documents',
          component: () => import('@/views/Documents.vue'),
          props: true,
          meta: { requiresAuth: true, title: 'documents' }
        },
        {
          path: '/document',
          name: 'Document',
          component: () => import('@/views/Document.vue'),
          props: true,
          meta: { requiresAuth: true, title: 'document' }
        },
        {
          path: '/pending',
          name: 'Pending',
          component: () => import('@/views/Pending.vue'),
          props: true,
          meta: { requiresAuth: true, title: 'documents' }
        },
        {
          path: '/forgotPassword',
          name: 'ForgotPassword',
          meta: { title: 'forgotPassword'},
          component: () => import('@/views/ForgotPassword.vue'),
        },
        {
          path: '/checkPhone',
          name: 'CheckPhone',
          component: () => import('@/views/CheckPhone.vue'),
          meta: { title: 'forgotPassword'}
        },
        {
          path: '/codeVerification/:phonenumber',
          name: 'CodeVerification',
          component: () => import('@/views/user/CodeVerification.vue'),
          meta: { title: 'SignUp' }
        },
        {
          path: '/userInformation/:phonenumber',
          name: 'UserInformation',
          component: () => import('@/views/user/UserInformation.vue'),
          meta: { title: 'SignUp' }
        },
        {
          path: '/terms&conditions',
          name: 'Terms&conditions',
          component: () => import('@/views/user/Terms&conditions.vue'),
          meta: { title: 'terms'}
        }
      ]
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    // always scroll to top
    return { top: 0 };
  },
})

router.beforeEach((to, from, next) => {
  if(to.meta.requiresAuth){
    const auth = useAuthStore()
    auth.getLSUserInfo().then((ls) => {
      
      if(ls){
        auth.attempt(ls.token).then((value) => {
          
          if(value === false && to.name != 'Login'){
            next({ name: "Login" })
          }else{
            next()
          }
        })
      }else{
        next({ name: "Home" })
      }
    })
  }else{
    next()
  }
})

export default router
