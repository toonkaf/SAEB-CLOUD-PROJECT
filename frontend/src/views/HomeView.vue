<script setup>
// import saebIcon from '@/assets/images/SAEB_ICON.png';
function handleGoogleLogin() {
  // TODO: ต่อ OAuth logic ทีหลัง (Cognito Google Federated / Google Identity Services)
}
</script>

<template>
    <div class="home-page">
        <div style="height: 100%; width: 50%; display: flex; align-items: center; justify-content: center;">
            <img src="@/assets/images/SAEB_ICON.png" class="logo-home">
        </div>
        <div class="home-right">
            <div class="describe">
                <div class="circle">
                    <h4 >Smart</h4>
                </div>
                <div class="circle">
                    <h4>AI</h4>
                </div>
                <div class="circle">
                    <h4>Exam</h4>
                </div>
                <div class="circle">
                    <h4>Brief</h4>
                </div>
            </div>
            <br>
                <button class="arrow-banner">Log In &amp; Register</button>
        </div>
    </div>
</template>

<style scoped>
.home-page{
    /* width: 80vw; */
    height: 86vh;
    /* background-color: aliceblue; */
    display: flex;
    flex-wrap: wrap;
    list-style: none;
    /* justify-items: flex-start; */
}

.logo-home{
    width: 75%;
    margin: 2.5vh 0vw 15vh 10vw;
    filter: drop-shadow(4px 4px 8px rgba(0, 0, 0, 0.3));
}

.home-right{
    height: 100%;
    width: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.describe{
    height: 20%;
    width: 50%;
    display: grid;
    /* background-color: aqua; */
    align-items: center;
    grid-template-columns: 50% 50%;
    grid-template-rows: 50% 50%;
    gap: 12%;
}

.circle{
    width: 100%;
    height: 100%;
    border: 5px solid black;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.arrow-banner {
    /* ล้าง default button style */
    border: none;
    outline: none;
    font-family: inherit;

    /* style เดิม */
    position: relative;
    background: #6b6b1f;
    color: white;
    margin-left: 10%;
    padding: 1.2rem 3rem 1.2rem 2rem;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    clip-path: polygon(0% 0%, 85% 0%, 100% 50%, 85% 100%, 0% 100%);

    /* เพิ่มสำหรับ interactive */
    cursor: pointer;
    transition: background 0.15s ease, transform 0.15s ease;
    height: 7%;
    width: 60%;
}

.arrow-banner:hover {
    background: #80801f;
    transform: translateX(4px);
}

.arrow-banner:active {
    transform: translateX(1px);
}

/* สำคัญมาก: focus state สำหรับคนใช้ keyboard (Tab) */
.arrow-banner:focus-visible {
    outline: 3px solid #a8a860;
    outline-offset: 3px;
}

.arrow-banner::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: #a8a860;
}
</style>