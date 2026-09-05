<script setup>
import { RouterLink } from 'vue-router';

</script>

<template>
    <div class="app-layout">
        <header class="app-header">
            <span class="logo">SAEB</span>
            <!-- <nav>
                <h2>SAEB</h2
                <RouterLink to="/" class="title"> SAEB => Smart AI Exam Brief </RouterLink>
                <RouterLink to="/login">Login</RouterLink>
                <RouterLink to="/dashboard">Dashboard</RouterLink>
                <RouterLink to="/documents">เอกสาร</RouterLink>
            </nav> -->
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
.app-header nav {
    display: flex;
    gap: 1rem;
    padding: 1rem;
}
</style>