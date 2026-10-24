<script setup>
import { RouterLink } from 'vue-router';
import saebIcon from '@/assets/images/SAEB_ICON.png';

const navItems = [
    { label: 'Home', to: '/main' },
    { label: 'AI', to: '/ai' },
    { label: '+ Upload', to: '/uploads' },
]
// มาแก้ path เอานะ
</script>

<template>
    <div class="app-layout">
        <header class="app-header">
            <RouterLink to="/" aria-label="Go to home" class="logo">
                <img :src="saebIcon" alt="SAEB" class="logo-icon" />
            </RouterLink>
            
            <nav class="nav" aria-label="เมนูหลัก">
                <RouterLink
                v-for="item in navItems"
                :key="item.to"
                :to="item.to"
                class="nav-link"
                >
                {{ item.label }}
                </RouterLink>
            </nav>

    <RouterLink to="/login" class="login-link">Login</RouterLink>
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
    grid-template-columns: 1fr auto 1fr; /* ซ้าย | กลาง | ขวา */
    align-items: center;
    min-height: 7vh;
    margin-top: -1.5vh;
    margin-bottom: 0vh;
    padding: 0 1.5rem;
    padding-bottom: 1vh;
    border-bottom: 1px solid #000;
    /* background-color: #000; */
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
    /* background-color: #000; */
}

.app-main {
    overflow: hidden; /* ตัดเฉพาะแนวนอน (กันรูปพื้นหลังที่กว้างเกิน) แต่แนวตั้งขยายตามเนื้อหาได้ */
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
    /* font-size: 1.5rem; */
    transition: all 0.2s ease;
}

.nav-link {
    padding: 0.5rem 1.75rem;
}

.nav-link:hover{
    color: #F9F3E4;
    background-color: #000;
}

.login-link {
    justify-self: end;
}


@media (max-width: 720px) {
    .app-header {
        padding: 0 0.5rem 1vh;
    }
    .nav {
        gap: 0.25rem;
    }
    .nav-link {
        padding: 0.4rem 0.6rem;
    }
    .logo-icon {
        height: 5vh;
    }
}


</style>