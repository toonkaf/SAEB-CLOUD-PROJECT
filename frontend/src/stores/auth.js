import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('saeb_token') || null)
  const user = ref(JSON.parse(localStorage.getItem('saeb_user') || 'null'))

  // ฟังก์ชัน Login ยิงหา Backend Node.js
  async function login(student_id, password) {
    try {
      const response = await apiClient.post('/login', {
        student_id,
        password
      })

      const { token: jwtToken, user: userData } = response.data

      // บันทึก State ลง Pinia และ LocalStorage
      token.value = jwtToken
      user.value = userData

      localStorage.setItem('saeb_token', jwtToken)
      localStorage.setItem('saeb_user', JSON.stringify(userData))

      return { success: true, message: response.data.message }
    } catch (error) {
      // เพิ่ม error.response?.data?.error เข้าไป
      const message = error.response?.data?.message || error.response?.data?.error || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
      return { success: false, message }
    }
  }

  // ฟังก์ชัน Logout
  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('saeb_token')
    localStorage.removeItem('saeb_user')
  }

  return { token, user, login, logout }
})