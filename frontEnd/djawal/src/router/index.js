import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Home from '../views/Home.vue'
import Categories from '@/views/category/Categories.vue'
import AdminAnnouncementForm from '@/views/admin/AdminAnnouncementForm.vue';
import CategoryList from '@/components/CategoryList.vue';
import AnnouncementList from '@/views/AnnouncementList.vue';
import AnnouncementDetail from '@/views/AnnouncementDetail.vue';
import AdminAnnouncementList from '@/views/admin/AdminAnnouncementList.vue'

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
          component: () => import('@/views/Tabs.vue'),
          meta: { requiresAuth: true, title: 'home' }
        },
        {
          path: '/updateProfile',
          name: 'UpdateProfile',
          component: () => import('@/views/UpdateProfile.vue'),
          meta: { requiresAuth: true, title: 'ProfileUpdate' }
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
        { path: '/admin/announcement/add', 
          name: 'AdminAnnouncementForm', 
          component: AdminAnnouncementForm,
          meta: { requiresAuth: true, title: 'AdminAnnouncementForm' } 
        },
        { 
          path: '/admin/announcement/edit/:announcementId', 
          name: 'EditAnnouncement', 
          component: AdminAnnouncementForm, 
          props: true,
          meta: { requiresAuth: true, title: 'AdminAnnouncementForm' } 
        },
        {
          path: '/category/:categoryId',
          name: 'CategoryList',
          component: CategoryList,
          props: true,
        },
        {
          path: '/category/:categoryId/announcements',
          name: 'AnnouncementList',
          component: AnnouncementList,
          props: true
        },
        {
          path: '/announcement/:announcementId',
          name: 'AnnouncementDetail',
          component: AnnouncementDetail,
          props: true,
        },
        { 
          path: '/admin/announcements', 
          name: 'AdminAnnouncements', 
          component: AdminAnnouncementList,
          meta: { requiresAuth: true, title: 'AnnouncementList' } 
        },
        {
          path: '/categoriesSeller',
          name: 'CategoriesSeller',
          component: () => import('@/views/category/CategoriesSeller.vue'),
          meta: { requiresAuth: true, title: 'categoriesSeller' }
        },
        {
          path: '/advertising',
          name: 'Advertising',
          component: () => import('@/views/Advertising.vue'),
          meta: { requiresAuth: true, title: 'Advertising' }
        },
        {
          path: '/trips',
          name: 'Trips',
          component: () => import('@/views/Trip/TripsList.vue'),
          meta: { requiresAuth: true, title: 'Trips' }
        },
        {
          path: '/myTrips',
          name: 'MyTrips',
          component: () => import('@/views/Trip/MyTrips.vue'),
          meta: { requiresAuth: true, title: 'MyTrips' }
        },
        {
          path: '/newTrip/:id',
          name: 'NewTrip',
          component: () => import('@/views/Trip/New.vue'),
          meta: { requiresAuth: true, title: 'NewTrip' }
        },
        {
          path: '/tripBuilder',
          name: 'TripBuilder',
          component: () => import('@/views/Trip/TripBuilder.vue'),
          meta: { requiresAuth: true, title: 'TripBuilder' }
        },
        {
          path: '/tripDetail/:id',
          name: 'TripDetail',
          component: () => import('@/views/Trip/TripDetail.vue'),
          meta: { requiresAuth: true, title: 'TripDetail' }
        },
        {
          path: '/tripSubscription/:id',
          name: 'TripSubscription',
          component: () => import('@/views/Trip/TripSubscription.vue'),
          meta: { requiresAuth: true, title: 'TripSubscription' }
        },
        {
          path: '/subscriptions',
          name: 'Subscriptions',
          component: () => import('@/views/Subscription/Subscriptions.vue'),
          meta: { requiresAuth: true, title: 'Subscriptions' }
        },
        {
          path: '/hotels',
          name: 'Hotels',
          component: () => import('@/views/Hotel/Hotels.vue'),
          meta: { requiresAuth: true, title: 'Hotels' }
        },
        {
          path: '/restaurants',
          name: 'Restaurants',
          component: () => import('@/views/Restaurant/Restaurants.vue'),
          meta: { requiresAuth: true, title: 'Restaurants' }
        },
        {
          path: '/sites',
          name: 'Sites',
          component: () => import('@/views/Site/Sites.vue'),
          meta: { requiresAuth: true, title: 'Sites' }
        },
        {
          path: '/places/:placeId',
          name: 'PlaceDetail',
          component: () => import('@/views/PlaceDetail.vue'),
          props: true
        }

      ],
    },
    {
      path: '/user',
      component: () => import('@/layouts/PageLayout.vue'),
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
          path: '/billing',
          name: 'Billing',
          component: () => import('@/views/profile/Billing.vue'),
          meta: { requiresAuth: true, title: 'Billing' }
        },
        {
          path: '/contactSupport',
          name: 'ContactSupport',
          component: () => import('@/views/profile/ContactSupport.vue'),
          meta: { requiresAuth: true, title: 'contactSupport' }
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
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    return { top: 0, behavior: "smooth" }; // Scroll to top with smooth animation
  },
})

router.beforeEach((to, from, next) => {
  if (Capacitor.isNativePlatform()) {
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
  } else {
    if(to.name === 'MyTrips' || to.name === 'Subscriptions'){
      const auth = useAuthStore()
      auth.getLSUserInfo().then((ls) => {
        if(ls){
          auth.attempt(ls.token).then((value) => {
            if(value === false){
              next({ name: "Login" })
            }else{
              next()
            }
          })
        }else{
          next({ name: "Login" })
        }
      })
    }else{
      next()
    } 
  }
})

export default router
