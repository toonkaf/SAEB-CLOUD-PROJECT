<script setup>
import { RouterLink } from 'vue-router';
import saebIcon from '@/assets/images/SAEB_ICON.png';

const navItems = [
    { label: 'Home', to: '/main' },
    { label: 'AI', to: '/ai' },
    { label: '+ Upload', to: '/documents' },
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
    height: 10vh;
    padding: 0 2rem;
    border-bottom: 1px solid #000;
}

.logo {
    justify-self: start;
    display: flex;
}

.logo-icon {
    height: 5vh;
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
    font-size: 1.5rem;
}

.nav-link {
    padding: 0.5rem 1.75rem;
}

.login-link {
    justify-self: end;
}


@media (max-width: 720px) {
    .app-header {
        height: 72px;
        padding: 0 1rem;
    }
    .brand-icon {
        height: 40px;
    }
    .nav {
        gap: 0.25rem;
    }
    .nav-link,
    .login-link {
        font-size: 1rem;
    }
    .nav-link {
        padding: 0.4rem 0.75rem;
    }
}



.app-header {
    height: 5vh;
    /* border-bottom: 3px solid #921B15; */
    margin-top: -1.5vh;
    padding-bottom: 1vh;
    margin-bottom: 0vh;
}

.app-footer {
    height: 2vh;
    display: flex;
    flex-direction: column;
    align-items: end;
    /* border-top: 3px solid #921B15; */
    margin-bottom: -1.5vh;
    padding-top: 1vh;
    margin-top: 0vh;
}
</style>