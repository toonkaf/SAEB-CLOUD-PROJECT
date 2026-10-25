<script setup>
// import saebIcon from '@/assets/images/SAEB_ICON.png';
function handleGoogleLogin() {
  // TODO: ต่อ OAuth logic ทีหลัง (Cognito Google Federated / Google Identity Services)
}
</script>

<template>
    <div class="home-page">
        <div class="home-hero">
            <img src="@/assets/images/MAIN_DES.png" class="home-des">
            <br>
            <button class="banner" @click="$router.push('/login')">Login</button>
        </div>
        <div class="home-visual">
            <img src="@/assets/images/BG_ICON_MAIN.png" class="logo-home-bg">
            <img src="@/assets/images/SAEB_ICON_W.png" class="logo-home">
        </div>
    </div>
</template>

<style scoped>
.home-page{
    /* width: 80vw; */
    height: 84vh;
    /* background-color: aliceblue; */
    display: flex;
    flex-wrap: wrap;
    list-style: none;
    /* justify-items: flex-start; */
}



.logo-home{
    width: 80%;
    margin: 2.5vh 0vw 15vh 0;
    z-index: 1;
    /* filter: drop-shadow(4px 4px 8px rgba(0, 0, 0, 0.3)); */
    position: absolute;
}
.logo-home-bg{
    width: 200%;
    z-index: -1;
    margin-left: 0;
    object-fit: cover;
    inset: 0;
    pointer-events: none;
}

.home-hero{
    height: 100%;
    width: 50%;
    padding-left: 10%;
    margin-right: -10%;
    /* background-color: aqua; */
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
}

.home-des{
    width: 60%;
    margin-top: -10vh;
}

.banner {
    border: none;
    outline: none;
    font-family: inherit;
    font-style: italic;
    font-size: 2rem;
    font-weight: 900;
    
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.2rem 3rem;
    cursor: pointer;
    width: 70%;

    background-color: #ffffff;
    color: #000000;
    box-shadow: 4px 4px 0px #2C9440;

    transition: all 0.2s ease;
}

.banner:hover,
.banner:focus-visible {
    background-color: #2C9440;
    color: #ffffff;
    box-shadow: 6px 6px 0px #ffffff;
    transform: translate(-2px, -2px);
}

.home-visual {
    height: 100%;
    width: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: visible;
}

/* ---------- มือถือ / แท็บเล็ตแนวตั้ง ---------- */
@media (max-width: 768px) {
    .home-page {
        height: auto;            /* ปลดล็อก 84vh */
        flex-direction: column;  /* เรียงบนลงล่าง */
        flex-wrap: nowrap;
    }

    .home-hero {
        width: 100%;
        height: auto;
        padding: 2rem 0 0;
        margin-right: 0;
        align-items: center;
    }

    .home-des {
        width: min(70%, 320px);
        margin-top: 0;
    }

    .banner {
        width: min(80%, 320px);
        font-size: 1.5rem;
        padding: 1rem 1.5rem;
    }

    .home-visual {
        width: 100%;
        height: 70vw;  /* กำหนดความสูงเอง เพราะ .logo-home เป็น absolute ไม่ช่วยดันความสูง */
    }

    .logo-home {
        width: 55%;
        margin: 0;
    }

    .logo-home-bg {
        width: 120%;   /* เดิม 200% กว้างเกินสำหรับมือถือ */
    }
}

</style>