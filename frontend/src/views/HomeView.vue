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

<style scoped>

.home-hero {
    /* background-color: #5c4a3a; */
    position: relative;
    height: 80vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    /* font-size: 175px; */
}

.hero-title {
    font-size: 450px;
    color: #921B15;
    line-height: 1;
    margin: 0 0 2.5rem;  /* เดิม: 2.5rem — ลดระยะห่างลง */
    z-index: 1;
    text-align: center;
}


.bg-pattern {
    margin-top: -4rem;
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.6rem;
    opacity: 0.5;
    z-index: -10;
    pointer-events: none;
}

.bg-pattern p {
    font-family: 'Lacquer', sans-serif;
    font-size: 50px;
    text-align: center;
    color: #905E5E;
    margin: 0;
    transform: rotate(-1deg);
}

.login-btn {
    z-index: 1;
    display: inline-flex;
    align-items: center;
    /* gap: 0.5rem; */
    background: #7a2222;
    color: #efe8dc;
    border: none;
    border-radius: 20px;
    padding: 0.9rem 1.75rem;
    font-family: 'Lacquer', sans-serif;
    font-size: 2rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.15s ease, background 0.15s ease;
}

.login-btn:hover {
    background: #8f2a2a;
    transform: translateY(-2px);
}

.arrow {
    font-size: 1.2rem;
}

@media (max-width: 640px) {
    .hero-title {
        font-size: 4rem;
    }
    .bg-pattern p {
        font-size: 1rem;
    }
}

</style>