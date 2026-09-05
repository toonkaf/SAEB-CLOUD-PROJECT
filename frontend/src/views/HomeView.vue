<script setup>
function handleGoogleLogin() {
  // TODO: ต่อ OAuth logic ทีหลัง (Cognito Google Federated / Google Identity Services)
}
</script>

<template>
    <div class="home-page">
        <main class="home-hero">
        <div class="bg-pattern" aria-hidden="true">
            <p>Smart AI Exam Brief Smart AI Exam <br>
                Brief Smart AI Exam Brief <br>
                Exam Brief Smart AI Exam Brief Smart AI Exam Brief <br>
                Smart AI Exam Brief Smart AI Exam Brief <br>
                Brief Smart AI Exam Brief Smart AI Exam Brief <br>
                Smart AI Exam Brief Smart AI Exam Brief Smart <br>
                AI Exam Brief AI Smart AI Exam Brief Smart <br>
                Smart AI Exam Brief
            </p>
        </div>

        <h1 class="logo , hero-title">SAEB</h1>

        <button class="login-btn" @click="">
            Log in with Google OAuth
            <!-- <span class="arrow">›</span> -->
        </button>
        </main>
    </div>
</template>
