<script setup>
import { ref } from 'vue'
import saebIcon from '@/assets/images/SAEB_ICON.png' 
import { useDocumentsStore } from '@/stores/documents'

const docsStore = useDocumentsStore()
const selectedFiles = ref([])
const isDragging = ref(false)
const isUploading = ref(false)

function onDragOver(event) {
  event.preventDefault()
  isDragging.value = true
}

function onDragLeave(event) {
  event.preventDefault()
  isDragging.value = false
}

function onDrop(event) {
  event.preventDefault()
  isDragging.value = false
  const files = Array.from(event.dataTransfer.files)
  addFiles(files)
}

function onFileSelect(event) {
  const files = Array.from(event.target.files)
  addFiles(files)
}

function addFiles(files) {
  const pdfFiles = files.filter(file => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))
  
  if (pdfFiles.length !== files.length) {
    alert('ระบบรองรับเฉพาะไฟล์ .pdf เท่านั้นครับ')
  }
  
  // แปลงให้แต่ละไฟล์มีช่องเก็บ subjectCode ของตัวเอง
  const newFiles = pdfFiles.map(file => ({
    file: file,
    subjectCode: '', 
    title: file.name.replace('.pdf', '')
  }))
  
  selectedFiles.value.push(...newFiles)
}

function removeFile(index) {
  selectedFiles.value.splice(index, 1)
}

async function handleUpload() {
  if (selectedFiles.value.length === 0) return alert('กรุณาเลือกไฟล์อย่างน้อย 1 ไฟล์ครับ')

  // เช็กว่ากรอกรหัสวิชาครบทุกไฟล์หรือยัง
  const hasEmptySubject = selectedFiles.value.some(item => !item.subjectCode.trim())
  if (hasEmptySubject) {
    return alert('กรุณากรอก Subject Code ให้ครบทุกไฟล์ก่อนอัปโหลดครับ')
  }

  isUploading.value = true
  let successCount = 0

  for (const item of selectedFiles.value) {
    const result = await docsStore.uploadDocument({
      file: item.file,
      title: item.title, 
      subjectCode: item.subjectCode
    })
    
    if (result.success) {
      successCount++
    } else {
      alert(`อัปโหลดไฟล์ ${item.file.name} ไม่สำเร็จ: ${result.message}`)
    }
  }

  isUploading.value = false
  if (successCount > 0) {
    alert(`อัปโหลดสำเร็จ ${successCount} ไฟล์`)
    selectedFiles.value = [] // เคลียร์คิวเมื่อเสร็จ
  }
}
</script>

<template>
  <div class="upload-container">
    <div class="upload-box">
      <h1 class="page-title">Upload</h1>
      
      <div class="upload-content">
        <!-- พื้นที่ลากวางไฟล์และรายการไฟล์ -->
        <div 
          class="drop-zone" 
          :class="{ 'is-dragging': isDragging }"
          @dragover="onDragOver"
          @dragleave="onDragLeave"
          @drop="onDrop"
        >
          <img :src="saebIcon" alt="SAEB Logo" class="saeb-logo" />
          
          <div class="file-list" v-if="selectedFiles.length > 0">
            <p style="font-weight: bold; margin-bottom: 0.5rem; width: 100%; text-align: left;">Selected Files:</p>
            <div v-for="(item, index) in selectedFiles" :key="index" class="file-item-row">
              <div class="file-info">
                <span class="file-name">{{ item.file.name }}</span>
                <input type="text" v-model="item.subjectCode" placeholder="Subject Code" class="inline-input" />
              </div>
              <button class="remove-btn" @click="removeFile(index)">✕</button>
            </div>
          </div>
          <div v-else class="placeholder-text">
            Drag & Drop PDF files here<br/>or
          </div>

          <label class="choose-file-btn" style="margin-top: 1rem;">
            Choose Files
            <input type="file" accept=".pdf" multiple @change="onFileSelect" hidden />
          </label>
        </div>

        <!-- ปุ่มจัดการ (ย้ายมาอยู่ด้านขวาหรือด้านล่าง) -->
        <div class="action-section">
          <div class="action-buttons">
            <button class="cancel-btn" @click="selectedFiles = []">Cancel</button>
            <button class="upload-btn" @click="handleUpload" :disabled="isUploading">
              {{ isUploading ? 'Uploading...' : 'Upload All' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* เพิ่ม box-sizing ให้ครอบคลุมทุกองค์ประกอบในหน้านี้ เพื่อแก้ปัญหาล้นกรอบ */
* {
  box-sizing: border-box;
}

.upload-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 85vh;
  background-color: #fcf6e9;
  padding: 2rem; /* เพิ่ม padding เผื่อหน้าจอเล็ก */
}

.upload-box {
  background: #fdfbf7;
  border: 2px solid #000;
  box-shadow: 4px 4px 0px #000;
  padding: 2rem 3rem;
  width: 100%;
  max-width: 800px; /* เปลี่ยนจาก width ฟิกซ์ตายตัว เป็น max-width */
}

.page-title {
  font-size: 2rem;
  font-style: italic;
  font-weight: bold;
  margin-bottom: 2rem;
}

.upload-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.drop-zone {
  width: 100%;
  border: 3px dashed #e63946;
  border-radius: 8px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff;
  transition: all 0.3s;
  min-height: 300px;
}

.drop-zone.is-dragging {
  background-color: #fefae0;
  border-color: #2c9440;
}

.saeb-logo {
  width: 120px;
  margin-bottom: 1rem;
}

.file-list {
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 1rem;
  font-size: 0.95rem;
  padding-right: 5px;
}

.file-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f1f1f1;
  padding: 0.5rem 0.8rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.file-name {
  font-weight: bold;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inline-input {
  padding: 0.4rem;
  border: 1px solid #000;
  border-radius: 4px;
  width: 150px;
}

.remove-btn {
  background: none;
  border: none;
  color: #e63946;
  cursor: pointer;
  font-weight: bold;
  font-size: 1.1rem;
  margin-left: 1rem;
}

.placeholder-text {
  text-align: center;
  color: #666;
  margin-bottom: 1rem;
}

.choose-file-btn {
  background-color: #e9c46a;
  border: 2px solid #000;
  padding: 0.6rem 2rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 2px 2px 0px #000;
}

.choose-file-btn:active {
  box-shadow: 0px 0px 0px #000;
  transform: translate(2px, 2px);
}

.action-section {
  display: flex;
  justify-content: flex-end;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  width: 100%;
}

.cancel-btn, .upload-btn {
  flex: 1;
  padding: 0.8rem;
  font-weight: bold;
  font-style: italic;
  font-size: 1.1rem;
  border: 2px solid #000;
  box-shadow: 2px 2px 0px #000;
  cursor: pointer;
}

.cancel-btn {
  background-color: #fff;
}

.upload-btn {
  background-color: #e63946;
  color: #fff;
}

.upload-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  box-shadow: none;
}
</style>