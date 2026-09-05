import { createRouter, createWebHistory } from 'vue-router'

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
    },
    {
        path: '/dashboard',
        name: 'dashboard',
        component: () => import('@/views/DashboardView.vue'),
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

// Guard เตรียมไว้ล่วงหน้า — ตอนนี้ยังไม่ต่อ backend จริง
// เมื่อมี auth store ใช้งานจริงแล้ว ค่อย uncomment logic ด้านล่าง
router.beforeEach((to) => {
    // const authStore = useAuthStore()
    // if (to.meta.requiresAuth && !authStore.idToken) {
    //   return { name: 'login' }
    // }
    return true
})

export default router