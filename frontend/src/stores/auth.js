import { defineStore } from 'pinia'
import { ref } from 'vue'

// Store นี้เตรียมไว้สำหรับ auth ในอนาคต (เช่น Cognito)
// ตอนนี้ยังไม่ต่อ logic จริง แค่วาง state ไว้ก่อน
export const useAuthStore = defineStore('auth', () => {
    const idToken = ref(null)
    const accessToken = ref(null)
    const user = ref(null)

    function setTokens(tokens) {
        idToken.value = tokens.idToken
        accessToken.value = tokens.accessToken
    }

    function logout() {
        idToken.value = null
        accessToken.value = null
        user.value = null
    }

    return { idToken, accessToken, user, setTokens, logout }
})