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

// 2. ฟังก์ชันรองรับการกด Login
async function handleLogin() {
  if (!studentId.value || !password.value) return

  isLoading.value = true
  errorMessage.value = ''

  // เรียกฟังก์ชัน login ใน Pinia Store (ยิงหา AWS Backend)
  const result = await authStore.login(studentId.value, password.value)

  isLoading.value = false

  if (result.success) {
    // เข้าสู่ระบบสำเร็จ ย้ายไปหน้า Dashboard
    router.push('/dashboard') // เปลี่ยน path เป็นหน้าหลักตามต้องการ
  } else {
    // แสดงข้อความ Error ที่ Backend / DynamoDB ส่งกลับมา
    errorMessage.value = result.message
  }
}
</script>

<template>
  <div class="login-page">
    <!-- ลบ <div> ซ้อนออก และผูก @submit.prevent กับ handleLogin -->
    <form class="login-card" @submit.prevent="handleLogin">
      <h1 class="title">Hello!</h1>
      <p class="subtitle">Sign in with ITKMITL account</p>

      <!-- ผูก v-model="studentId" -->
      <input
        v-model="studentId"
        class="field"
        type="text"
        placeholder="Student ID *"
        required
      />

      <div class="password">
        <!-- ผูก v-model="password" -->
        <input
          v-model="password"
          class="field"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Password *"
          required
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

      <!-- แสดงข้อความแจ้งเตือนถ้าเกิด Error -->
      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

      <!-- ปุ่ม Login พร้อมสถานะ Loading -->
      <button type="submit" class="login-btn" :disabled="isLoading">
        {{ isLoading ? 'Signing in...' : 'Login' }}
      </button>

      <a href="#" class="forgot" @click.prevent>Forgot your password?</a>
    </form>
  </div>
</template>

<style scoped>
.login-page {
  height: 86vh;
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

/* ---------- buttons & messages ---------- */
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

.login-btn:disabled {
  background: #a37270;
  cursor: not-allowed;
}

.login-btn:hover:not(:disabled) {
  filter: brightness(1.15);
}

.error-text {
  color: var(--maroon);
  margin: 12px 0 0;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
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
  .login-card {
    width: 90vw;
  }

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