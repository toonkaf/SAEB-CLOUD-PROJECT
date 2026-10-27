<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth' // 1. อิมพอร์ต Pinia Store

const showPassword = ref(false)
const studentId = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const authStore = useAuthStore()
const router = useRouter()

// // 2. ฟังก์ชันรองรับการกด Login
// async function handleLogin() {
//     if (!studentId.value || !password.value) return

//     isLoading.value = true
//     errorMessage.value = ''

//     // เรียกฟังก์ชัน login ใน Pinia Store (ยิงหา AWS Backend)
//     const result = await authStore.login(studentId.value, password.value)

//     isLoading.value = false

//     if (result.success) {
//         // เข้าสู่ระบบสำเร็จ ย้ายไปหน้า Dashboard
//         router.push('/dashboard') // เปลี่ยน path เป็นหน้าหลักตามต้องการ
//         router.push('/main') // เปลี่ยน path เป็นหน้าหลักตามต้องการ
//     } else {
//         // แสดงข้อความ Error ที่ Backend / DynamoDB ส่งกลับมา
//         errorMessage.value = result.message
//     }
// }
// </script>

<template>
    <div class="regis-page">
        <form class="regis-card" @submit.prevent="handleLogin">
            <div style="display: flex;">
                <div style="margin-top: auto; margin-bottom: auto;">
                    <h1 class="title">Sign up</h1>
                    <p class="subtitle"></p>
                </div>
                <img src="@/assets/images/SAEB_ICON.png" class="logo-login">
                
            </div>

            <p class="subtitle">Student ID</p>
            <input class="field" type="text" placeholder="ex.6X07XXXX" v-model="studentId" />
            
            <p class="subtitle">Email</p>
            <input class="field" type="text" placeholder="ex.6X07XXXX@kmitl.ac.th" v-model="email" />
            
            <div class="password">
                <p class="subtitle">Password</p>
                <input
                    class="field"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="ex.SAEB123_"
                    v-model="password"
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

            <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

            <button type="submit" class="login-btn" :disabled="isLoading">
                {{ isLoading ? 'Signing up...' : 'Sign up' }}
            </button>
        </form>
    </div>
</template>


<style scoped>

.regis-page{
   /* width: 80vw; */
    min-height: 84vh;
    /* background-color: aliceblue; */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

}

.regis-card {
    --maroon: #8f1b16;
    width: 50vw;
    box-sizing: border-box;
    padding: 50px 16px 50px 16px;
    background: white;
    border: 1px solid #333;
    /* border-radius: 22px; */
    box-shadow: 2px 3px 4px rgba(0, 0, 0, 0.45);
    /* color: var(--brown); */
    font-family: inherit;
    
}

.title {
    margin: 0;
    font-size: 64px;
    font-weight: 700;
    line-height: 1.15;
}

.subtitle {
    margin: 4px 0 0px;
    font-size: 32px;
    font-weight: 500;
}

.logo-login{
    margin: auto;
    margin-right: 10px;
    height: 100px;
    justify-self: end;
}

/* ---------- inputs ---------- */
.field {
    display: block;
    width: 100%;
    height: 80px;
    box-sizing: border-box;
    padding: 0 20px;
    color: var(--brown);
    border: 2px solid transparent;
    /* border-radius: 24px; */
    font: inherit;
    font-size: 30px;
    outline: none;

    background-color: #F9F9F9;
    /* color: #000000; */
    box-shadow: 4px 4px 0px #2C9440;
    transition: all 0.2s ease;
}

.field::placeholder {
    color: #B6B6B6;
    opacity: 1;
}

/* .field:focus {
    background-color: #2C9440;
    color: #ffffff;
    box-shadow: 6px 6px 0px #F9F9F9;
    transform: translate(-2px, -2px);
} */

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
    color: #2C9440;
    cursor: pointer;
    margin-top: 3%;
}

/* ---------- buttons & messages ---------- */
.login-btn {
    display: block;
    width: 60%;
    height: 48px;
    margin: 34px auto 0 auto;
    background: var(--maroon);
    color: white;
    border: none;
    /* border-radius: 24px; */
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

@media (max-width: 900px) {
    .regis-card {
        width: 92vw;    /* เดิม 50vw แคบเกินไปบนจอเล็ก */
    }
}

@media (max-width: 640px) {
    .title {
        font-size: 44px;
    }

    .regis-card {
        padding: 32px 16px;
    }

    .logo-login {
        height: 64px;   /* กันหัวข้อกับโลโก้เบียดกัน */
    }

    .subtitle {
        font-size: 14px;
    }

    .field,
    .login-btn {
        font-size: 22px;
    }

    .field {
        height: 64px;
    }
}
.error-text {
    margin: 16px 0 0;
    text-align: center;
    color: var(--maroon);
    font-size: 18px;
}

.login-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>