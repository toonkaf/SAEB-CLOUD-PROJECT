import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/services/api'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'

export const MAX_SIZE = 20 * 1024 * 1024 // 20 MB (ต้องตรงกับ backend)

export function isPdf(file) {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

export const useDocumentsStore = defineStore('documents', () => {
  const documents = ref([])
  const isLoading = ref(false)

  function authHeaders() {
    return { Authorization: `Bearer ${useAuthStore().token}` }
  }

  // แปลง error จาก API เป็นข้อความ และเด้งไปหน้า login ถ้า token หมดอายุ
  function errorMessageOf(error, fallback) {
    if (error.response?.status === 401) {
      useAuthStore().logout()
      router.push('/login')
      return 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่'
    }
    return error.response?.data?.message || fallback
  }

  async function fetchDocuments() {
    isLoading.value = true
    try {
      const { data } = await apiClient.get('/documents', { headers: authHeaders() })
      documents.value = data.documents.map((d) => ({ ...d, uploadedAt: new Date(d.uploadedAt) }))
      return { success: true }
    } catch (error) {
      return { success: false, message: errorMessageOf(error, 'โหลดรายการเอกสารไม่สำเร็จ') }
    } finally {
      isLoading.value = false
    }
  }

  // อัพโหลด 3 ขั้น: ขอลิงก์ -> ส่งไฟล์ขึ้น S3 -> บันทึก metadata
  async function uploadDocument({ file, title, subjectCode }) {
    if (!isPdf(file)) return { success: false, message: 'อัพโหลดได้เฉพาะไฟล์ .pdf เท่านั้น' }
    if (file.size > MAX_SIZE) return { success: false, message: 'ขนาดไฟล์ต้องไม่เกิน 20 MB' }

    try {
      const { data } = await apiClient.post(
        '/documents/upload-url',
        { fileName: file.name, size: file.size },
        { headers: authHeaders() }
      )

      // ใช้ fetch ไม่ใช้ apiClient เพราะ S3 ไม่ต้องการ header Authorization ของเรา
      let putResponse
      try {
        putResponse = await fetch(data.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/pdf' },
          body: file,
        })
      } catch {
        return { success: false, message: 'ส่งไฟล์ขึ้น S3 ไม่สำเร็จ (ตรวจสอบการตั้งค่า CORS ของ bucket)' }
      }
      if (!putResponse.ok) {
        return { success: false, message: 'ส่งไฟล์ขึ้น S3 ไม่สำเร็จ' }
      }

      await apiClient.post(
        '/documents',
        { title, subjectCode, fileName: file.name, s3Key: data.s3Key },
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
    // เปิดแท็บก่อน await เพื่อไม่ให้เบราว์เซอร์บล็อก popup
    const tab = window.open('', '_blank')
    try {
      const { data } = await apiClient.get(`/documents/${id}/download-url`, { headers: authHeaders() })
      if (tab) {
        tab.opener = null
        tab.location.href = data.url
      } else {
        window.location.href = data.url
      }
      return { success: true }
    } catch (error) {
      if (tab) tab.close()
      return { success: false, message: errorMessageOf(error, 'เปิดเอกสารไม่สำเร็จ') }
    }
  }

  return { documents, isLoading, fetchDocuments, uploadDocument, removeDocument, openDocument }
})