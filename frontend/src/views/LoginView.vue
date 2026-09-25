<script setup>
import { ref } from 'vue'
const showPassword = ref(false)
</script>

<template>
    <div class="login-page">
        <div class="login-page">
        <form class="login-card" @submit.prevent>
            <h1 class="title">Hello!</h1>
            <p class="subtitle">Sign in with ITKMITL account</p>

            <input class="field" type="text" placeholder="Username *" />

            <div class="password">
                <input
                    class="field"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="Password *"
                />
                <button
                    type="button"
                    class="eye"
                    aria-label="Toggle password visibility"
                    @click="showPassword = !showPassword"
                >
                    <!-- ตาเปิด -->
                    <svg v-if="showPassword" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />
                        <circle cx="12" cy="12" r="2.5" />
                    </svg>
                    <!-- ตาปิด -->
                    <svg v-else viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 9c4 5 14 5 18 0" />
                        <path d="M6.5 13.5l-1.5 2.5M12 15v3M17.5 13.5l1.5 2.5" />
                    </svg>
                </button>
            </div>

            <button type="submit" class="login-btn">Login</button>
            <a href="#" class="forgot" @click.prevent>Forgot your password?</a>
        </form>
    </div>
    </div>
</template>

<style scoped>
.login-page{
   /* width: 80vw; */
    height: 86vh;
    /* background-color: aliceblue; */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

}
.login-card {
    --brown: #5c4a3a;
    --maroon: #8f1b16;
    width: 50vw;
    box-sizing: border-box;
    padding: 16px;
    background: rgba(236, 236, 236, 0.85);
    border: 1px solid #333;
    border-radius: 22px;
    box-shadow: 2px 3px 4px rgba(0, 0, 0, 0.45);
    color: var(--brown);
    font-family: inherit;
}

.title {
    margin: 0;
    font-size: 64px;
    font-weight: 700;
    line-height: 1.15;
}

.subtitle {
    margin: 4px 0 24px;
    font-size: 17px;
    font-weight: 500;
}

/* ---------- inputs ---------- */
.field {
    display: block;
    width: 100%;
    height: 80px;
    box-sizing: border-box;
    padding: 0 20px;
    background: #d9d9d9;
    color: var(--brown);
    border: 2px solid transparent;
    border-radius: 24px;
    font: inherit;
    font-size: 30px;
    outline: none;
}

.field::placeholder {
    color: var(--brown);
    opacity: 1;
}

.field:focus {
    border-color: var(--maroon);
}

.field::-ms-reveal,
.field::-ms-clear {
    display: none;
}

.password {
    position: relative;
    margin-top: 20px;
}

.eye {
    position: absolute;
    top: 50%;
    right: 18px;
    transform: translateY(-50%);
    display: grid;
    place-items: center;
    padding: 4px;
    background: none;
    border: none;
    color: var(--maroon);
    cursor: pointer;
}

/* ---------- buttons ---------- */
.login-btn {
    display: block;
    width: 100%;
    height: 48px;
    margin-top: 34px;
    background: var(--maroon);
    color: #eee;
    border: none;
    border-radius: 24px;
    font: inherit;
    font-size: 30px;
    cursor: pointer;
}
 
.login-btn:hover {
    filter: brightness(1.15);
}
 
.forgot {
    display: block;
    margin: 22px 0 14px;
    text-align: center;
    color: var(--maroon);
    font-size: 17px;
    text-decoration: none;
}
 
.forgot:hover {
    text-decoration: underline;
}
 
@media (max-width: 640px) {
    .title {
        font-size: 44px;
    }
 
    .field,
    .login-btn {
        font-size: 22px;
    }
 
    .field {
        height: 64px;
    }
}
</style>