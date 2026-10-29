<script setup>
import { computed } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import saebIcon from '@/assets/images/SAEB_ICON.png';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const navItems = [
    { label: 'Home', to: '/main' },
    { label: 'Documents', to: '/documents' },
    { label: '+ Upload', to: '/uploads' },
]

// ซ่อนเมนูและปุ่ม Login/Logout เมื่อ route ตั้ง meta.hideNav หรืออยู่ที่หน้า Landing (/)
const hideNav = computed(() => !!route.meta.hideNav || route.path === '/');

// ฟังก์ชันสำหรับกด Logout
const handleLogout = () => {
    authStore.logout();
    router.push('/login');
};
</script>

<template>
    <div class="app-layout">
        <header class="app-header">
            <RouterLink to="/" aria-label="Go to home" class="logo">
                <img :src="saebIcon" alt="SAEB" class="logo-icon" />
            </RouterLink>
            <nav v-if="!hideNav" class="nav" aria-label="เมนูหลัก">
                <RouterLink
                v-for="item in navItems"
                :key="item.to"
                :to="item.to"
                class="nav-link"
                >
                {{ item.label }}
                </RouterLink>
            </nav>

            <!-- แสดงปุ่ม Logout เมื่อล็อกอินอยู่ และแสดง Login เมื่อไม่มี Session -->
            <template v-if="!hideNav">
                <button 
                    v-if="authStore.isAuthenticated" 
                    @click="handleLogout" 
                    class="login-link logout-btn"
                >
                    Logout
                </button>
                <RouterLink 
                    v-else 
                    to="/login" 
                    class="login-link"
                >
                    Login
                </RouterLink>
            </template>
        </header>

        <main class="app-main">
        <RouterView />
        </main>

        <footer class="app-footer">
            <span>© 2026 SAEB - All rights reserved.</span>
        </footer>

    </div>
</template>

<style scoped>
.app-header {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    min-height: 7vh;
    margin-top: -1.5vh;
    margin-bottom: 0vh;
    padding: 0 1.5rem;
    padding-bottom: 1vh;
    border-bottom: 1px solid #000;
}

.app-footer {
    min-height: 3vh;
    display: flex;
    flex-direction: column;
    align-items: end;
    border-top: 1px solid black;
    margin-bottom: -1.5vh;
    padding-top: 1vh;
    margin-top: 0vh;
}

/* เดิม overflow: hidden ซึ่งตัดเนื้อหาที่ยาวเกินจอมือถือ เปลี่ยนให้ตัดเฉพาะแนวนอน */
.app-main {
    overflow-x: hidden;
}

.logo {
    justify-self: start;
    display: flex;
}

.logo-icon {
    height: 6vh;
    aspect-ratio: inherit;
}

.nav {
    display: flex;
    align-items: center;
    gap: 2.5rem;
}

.nav-link,
.login-link {
    color: #000;
    text-decoration: none;
    font-weight: 700;
    transition: all 0.2s ease;
}

.nav-link {
    padding: 0.5rem 1.75rem;
}

.nav-link:hover{
    color: #F9F3E4;
    background-color: #000;
}

.nav:not(:hover) .nav-link.router-link-active {
    background: #000;
    color: #F9F3E4;
}

.login-link {
    justify-self: end;
}

/* ปรับแต่งปุ่ม Logout ให้สไตล์เหมือนลิงก์เดิม */
.logout-btn {
    background: none;
    border: none;
    font-family: inherit;
    font-size: inherit;
    cursor: pointer;
    padding: 0;
}

.logout-btn:hover {
    text-decoration: underline;
}

/* มือถือ/แท็บเล็ตเล็ก: แถวบน = โลโก้ + Logout/Login, แถวล่าง = เมนูกระจายเต็มความกว้าง */
@media (max-width: 720px) {
    .app-header {
        grid-template-columns: 1fr auto;
        grid-template-areas:
            "logo action"
            "nav  nav";
        row-gap: 0.5rem;
        padding: 0 0.75rem 1vh;
    }
    .logo {
        grid-area: logo;
    }
    .login-link {
        grid-area: action;
    }
    .nav {
        grid-area: nav;
        width: 100%;
        justify-content: space-between;
        gap: 0.25rem;
    }
    .nav-link {
        flex: 1;
        text-align: center;
        padding: 0.4rem 0.25rem;
        font-size: 0.9rem;
    }
    .logo-icon {
        height: 5vh;
    }
}
</style>