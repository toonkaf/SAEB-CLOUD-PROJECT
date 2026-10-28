import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/services/api'

// ฟังก์ชันช่วยถอดรหัส JWT Token แบบปลอดภัย
function parseJwt(token) {
  try {
    if (!token) return null
    const base64Url = token.split('.')[1]
    if (!base64Url) return null
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    try {
      return JSON.parse(window.atob(token.split('.')[1]))
    } catch {
      return null
    }
  }
}

// ฟังก์ชันช่วยดึงข้อมูล User จาก LocalStorage หรือดึงซ่อมจาก JWT Token
function getInitialUser() {
  const savedUser = localStorage.getItem('saeb_user')
  if (savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
    try {
      return JSON.parse(savedUser)
    } catch {
      // ข้ามกรณี parse JSON ไม่สำเร็จ
    }
  }

  const savedToken = localStorage.getItem('saeb_token')
  if (savedToken) {
    const decoded = parseJwt(savedToken)
    if (decoded) return decoded
  }

  return null
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('saeb_token') || null)
  const user = ref(getInitialUser())

  // เช็กว่ามี Session/Token จริงหรือไม่
  const isAuthenticated = computed(() => !!token.value)

  // ฟังก์ชัน Login
  async function login(student_id, password) {
    try {
      const response = await apiClient.post('/login', {
        student_id,
        password
      })

      const { token: jwtToken, user: userData } = response.data

      token.value = jwtToken
      user.value = userData || parseJwt(jwtToken)

      localStorage.setItem('saeb_token', jwtToken)
      localStorage.setItem('saeb_user', JSON.stringify(user.value))

      return { success: true, message: response.data.message }
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data?.error || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
      return { success: false, message }
    }
  }

  // ฟังก์ชัน Register
  async function register(student_id, email, password) {
    try {
      const response = await apiClient.post('/register', { student_id, email, password })
      return { success: true, message: response.data.message }
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data?.error || 'เกิดข้อผิดพลาดในการสมัครสมาชิก'
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

  return { token, user, isAuthenticated, login, register, logout }
})