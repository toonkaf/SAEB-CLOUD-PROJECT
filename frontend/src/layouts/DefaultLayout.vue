<script setup>
import { RouterLink } from 'vue-router';
import saebIcon from '@/assets/images/SAEB_ICON.png';

</script>

<template>
    <div class="app-layout">
        <header class="app-header">
            <img :src="saebIcon" alt="SAEB" class="logo-icon" />
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

.logo-icon {
    width: 3%;
    aspect-ratio: inherit;
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