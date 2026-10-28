import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/services/api'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'

export const MAX_SIZE = 20 * 1024 * 1024 // 20 MB

export function isPdf(file) {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

export const useDocumentsStore = defineStore('documents', () => {
  // รวม State ทั้งหมดไว้ด้านบน
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

  async function fetchDocuments() {
    isLoading.value = true
    try {
      const authStore = useAuthStore()
      const currentUserId = authStore.user?.student_id || 'anonymous'

      const { data } = await apiClient.get('/documents/search', {
        headers: authHeaders(),
        params: { uploader_id: currentUserId }
      })

      documents.value = data.documents.map((d) => {
        const rawDate = d.created_at || d.uploadedAt || d.uploaded_at
        const parsedDate = rawDate ? new Date(rawDate) : new Date()

        return {
          ...d,
          id: d.document_id || d.id,
          size: Number(d.file_size || d.size || d.fileSize || 0), // แก้ไข: เพิ่มดึงค่า fileSize และแปลงเป็น Number
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

      allDocuments.value = data.documents.map((d) => {
        const rawDate = d.created_at || d.uploadedAt || d.uploaded_at
        const parsedDate = rawDate ? new Date(rawDate) : new Date()

        return {
          ...d,
          id: d.document_id || d.id,
          size: Number(d.file_size || d.size || d.fileSize || 0), // แก้ไข: เพิ่มดึงค่า fileSize และแปลงเป็น Number
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

    try {
      // 1. ขอ Presigned URL จาก Backend
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

      // 2. อัปโหลดไฟล์ขึ้น S3 โดยใช้ Native fetch (ส่งเฉพาะ Content-Type ไม่ส่ง Authorization header)
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

      // 3. บันทึกข้อมูลเอกสารลง DynamoDB
      const authStore = useAuthStore()
      await apiClient.post(
        '/documents',
        {
          title,
          subject_code: subjectCode,
          file_key: fileKey,
          file_name: file.name,
          fileName: file.name,
          file_size: file.size,  // แนบค่าขนาดไฟล์ครบทุกรูปแบบ key
          fileSize: file.size,
          size: file.size,
          uploader_id: authStore.user?.student_id || 'anonymous'
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
    try {
      const { data } = await apiClient.get(`/documents/${id}/download-url`, { headers: authHeaders() })
      const tab = window.open(data.url, '_blank')
      if (tab) {
        tab.opener = null
      } else {
        window.location.href = data.url
      }
      return { success: true }
    } catch (error) {
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