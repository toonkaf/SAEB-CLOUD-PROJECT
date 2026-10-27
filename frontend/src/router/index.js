import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
    {
        path: '/',
        name: 'home',
        component: () => import('@/views/HomeView.vue'),
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('@/views/LoginView.vue'),
        meta: { hideNav: true },
    },
    {
        path: '/regis',
        name: 'regis',
        component: () => import('@/views/RegisterView.vue'),
        meta: { hideNav: true },
    },
    {
        path: '/main',
        name: 'main',
        component: () => import('@/views/MainView.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/uploads',
        name: 'uploads',
        component: () => import('@/views/UploadView.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/documents',
        name: 'documents',
        component: () => import('@/views/DocumentView.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: () => import('@/views/NotFoundView.vue'),
    },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
})

// ต้อง app.use(pinia) ก่อน app.use(router) ใน main.js
router.beforeEach((to) => {
    const authStore = useAuthStore()
    if (to.meta.requiresAuth && !authStore.token) {
        return { name: 'login' }
    }
    return true
})

export default router