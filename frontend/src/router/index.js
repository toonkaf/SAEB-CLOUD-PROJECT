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

router.beforeEach((to) => {
    const authStore = useAuthStore()
    
    // 1. ถ้าหน้านั้นต้องใช้สิทธิ์ (requiresAuth) แต่ไม่มี Token ให้เด้งไปหน้า login
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        return { name: 'login' }
    }

    // 2. ถ้าล็อกอินอยู่แล้ว แต่อยู่ดีๆ กดเข้าหน้า login หรือ regis ให้เด้งไปหน้า main
    if (authStore.isAuthenticated && (to.name === 'login' || to.name === 'regis')) {
        return { name: 'main' }
    }

    return true
})

export default router