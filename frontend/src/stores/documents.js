import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/services/api'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'

export const MAX_SIZE = 20 * 1024 * 1024 // 20 MB

export function isPdf(file) {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

// ฟังก์ชันสำหรับถอดรหัสข้อมูล JWT Token กรณี State หาย
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

function extractId(val) {
  if (!val) return null
  // กรณี val เป็น string หรือ number ตรงๆ (เช่น "670700123")
  if (typeof val === 'string' || typeof val === 'number') {
    const str = String(val).trim()
    return str !== 'undefined' && str !== 'null' && str !== '' ? str : null
  }
  // กรณี val เป็น Object
  if (typeof val === 'object') {
    return (
      val.student_id ||
      val.studentId ||
      val.id ||
      val.user_id ||
      val.username ||
      val.email ||
      null
    )
  }
  return null
}

export const useDocumentsStore = defineStore('documents', () => {
  const documents = ref([])
  const allDocuments = ref([])
  const isLoading = ref(false)
  const summaries = ref({})
  const isAiLoading = ref(false)

  function authHeaders() {
    return { Authorization: `Bearer ${useAuthStore().token}` }
  }

  function errorMessageOf(error, fallback) {
    if (error.response?.status === 401) {
      useAuthStore().logout()
      router.push('/login')
      return 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่'
    }
    return error.response?.data?.message || fallback
  }

  // ฟังก์ชันดึง User ID โดยใช้ Key saeb_user และ saeb_token ตามใน auth.js
  function getCurrentUserId() {
  const authStore = useAuthStore()

  // 1. ดึงจาก authStore.user ใน Pinia
  const fromStore = extractId(authStore.user)
  if (fromStore) return fromStore

  // 2. ดึงจาก LocalStorage 'saeb_user'
  try {
    const savedUser = localStorage.getItem('saeb_user')
    if (savedUser && savedUser !== 'undefined') {
      const parsed = JSON.parse(savedUser)
      const fromLocal = extractId(parsed)
      if (fromLocal) return fromLocal
    }
  } catch {
    // กรณี saeb_user ใน localStorage ไม่ใช่ JSON (เป็นข้อความธรรมดา)
    const rawUser = localStorage.getItem('saeb_user')
    const fromRaw = extractId(rawUser)
    if (fromRaw) return fromRaw
  }

  // 3. ถอดรหัสโดยตรงจาก JWT Token 'saeb_token'
  const token = authStore.token || localStorage.getItem('saeb_token')
  if (token) {
    const decoded = parseJwt(token)
    const fromToken = extractId(decoded)
    if (fromToken) return fromToken
  }

  return null
}

  async function fetchDocuments() {
    isLoading.value = true
    try {
      const currentUserId = getCurrentUserId()

      if (!currentUserId || currentUserId === 'anonymous') {
        documents.value = []
        return { success: true }
      }

      const { data } = await apiClient.get('/documents/search', {
        headers: authHeaders(),
        params: { uploader_id: currentUserId }
      })

      documents.value = (data.documents || []).map((d) => {
        const rawDate = d.created_at || d.uploadedAt || d.uploaded_at
        const parsedDate = rawDate ? new Date(rawDate) : new Date()

        return {
          ...d,
          id: d.document_id || d.id,
          size: Number(d.file_size || d.size || d.fileSize || 0),
          subjectCode: d.subject_code || d.subjectCode || '',
          fileName: d.file_name || d.fileName || '',
          uploadedAt: isNaN(parsedDate.getTime()) ? new Date() : parsedDate
        }
      })

      return { success: true }
    } catch (error) {
      return { success: false, message: errorMessageOf(error, 'โหลดรายการเอกสารไม่สำเร็จ') }
    } finally {
      isLoading.value = false
    }
  }

  async function fetchAllDocuments() {
    isLoading.value = true
    try {
      const { data } = await apiClient.get('/documents/search', { headers: authHeaders() })

      allDocuments.value = (data.documents || []).map((d) => {
        const rawDate = d.created_at || d.uploadedAt || d.uploaded_at
        const parsedDate = rawDate ? new Date(rawDate) : new Date()

        return {
          ...d,
          id: d.document_id || d.id,
          size: Number(d.file_size || d.size || d.fileSize || 0),
          subjectCode: d.subject_code || d.subjectCode || '',
          fileName: d.file_name || d.fileName || '',
          uploadedAt: isNaN(parsedDate.getTime()) ? new Date() : parsedDate
        }
      })

      return { success: true }
    } catch (error) {
      return { success: false, message: errorMessageOf(error, 'โหลดรายการเอกสารไม่สำเร็จ') }
    } finally {
      isLoading.value = false
    }
  }

  async function uploadDocument({ file, title, subjectCode }) {
    if (!isPdf(file)) return { success: false, message: 'อัพโหลดได้เฉพาะไฟล์ .pdf เท่านั้น' }
    if (file.size > MAX_SIZE) return { success: false, message: 'ขนาดไฟล์ต้องไม่เกิน 20 MB' }

    const currentUserId = getCurrentUserId()
    if (!currentUserId || currentUserId === 'anonymous') {
      return { success: false, message: 'ไม่พบข้อมูลผู้ใช้งาน กรุณาล็อกอินใหม่อีกครั้ง' }
    }

    try {
      const { data } = await apiClient.post(
        '/upload-url',
        { 
          fileName: file.name, 
          size: file.size,
        },
        { headers: authHeaders() }
      )

      const uploadUrl = data.uploadUrl || data.upload_url
      const fileKey = data.s3Key || data.file_key || data.key

      let putResponse
      try {
        putResponse = await window.fetch(uploadUrl, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/pdf' 
          },
          body: file,
        })
      } catch {
        return { success: false, message: 'ส่งไฟล์ขึ้น S3 ไม่สำเร็จ (ตรวจสอบการตั้งค่า CORS ของ S3 Bucket)' }
      }

      if (!putResponse.ok) {
        return { success: false, message: 'ส่งไฟล์ขึ้น S3 ไม่สำเร็จ' }
      }

      await apiClient.post(
        '/documents',
        {
          title,
          subject_code: subjectCode,
          file_key: fileKey,
          file_name: file.name,
          fileName: file.name,
          file_size: file.size,
          fileSize: file.size,
          size: file.size,
          uploader_id: currentUserId
        },
        { headers: authHeaders() }
      )

      return { success: true }
    } catch (error) {
      return { success: false, message: errorMessageOf(error, 'อัพโหลดเอกสารไม่สำเร็จ') }
    }
  }

  async function removeDocument(id) {
    try {
      await apiClient.delete(`/documents/${id}`, { headers: authHeaders() })
      documents.value = documents.value.filter((d) => d.id !== id)
      return { success: true }
    } catch (error) {
      return { success: false, message: errorMessageOf(error, 'ลบเอกสารไม่สำเร็จ') }
    }
  }

  async function openDocument(id) {
  if (!id) {
    return { success: false, message: 'ไม่พบ ID ของเอกสาร' }
  }

  // 1. เปิดแท็บใหม่ไว้ล่วงหน้าทันที เพื่อป้องกัน Browser บล็อก Popup หรือค้างที่ about:blank
  const newTab = window.open('about:blank', '_blank')

  try {
    const { data } = await apiClient.get(`/documents/${id}/download-url`, { headers: authHeaders() })
    
    // ดึง URL โดยรองรับหลายรูปแบบ key
    const downloadUrl = data.url || data.download_url || data.downloadUrl

    if (downloadUrl && newTab) {
      // 2. ส่งผู้ใช้ไปยัง S3 Presigned URL เมื่อดึงข้อมูลสำเร็จ
      newTab.location.href = downloadUrl
      return { success: true }
    } else {
      // ถ้าไม่ได้ URL ให้ปิดแท็บที่เปิดค้างไว้
      if (newTab) newTab.close()
      return { success: false, message: 'ไม่พบลิงก์สำหรับเปิดเอกสาร' }
    }
  } catch (error) {
    // ถ้าเกิด Error ให้ปิดแท็บที่เปิดค้างไว้
    if (newTab) newTab.close()
    return { success: false, message: errorMessageOf(error, 'เปิดเอกสารไม่สำเร็จ') }
  }
}

  async function askAI(documentId) {
    isAiLoading.value = true
    try {
      const { data } = await apiClient.post('/summarize',
        { document_id: documentId },
        { headers: authHeaders() }
      )
      summaries.value[documentId] = data.summary_text
      return { success: true }
    } catch (error) {
      return { success: false, message: errorMessageOf(error, 'AI ไม่สามารถสรุปข้อมูลได้') }
    } finally {
      isAiLoading.value = false
    }
  }

  return {
    documents,
    allDocuments,
    isLoading,
    summaries,
    isAiLoading,
    fetchDocuments,
    fetchAllDocuments,
    uploadDocument,
    removeDocument,
    openDocument,
    askAI
  }
})