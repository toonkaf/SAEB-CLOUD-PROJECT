<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import saebIcon from '@/assets/images/SAEB_ICON.png'
import { useDocumentsStore, isPdf, MAX_SIZE } from '@/stores/documents'

const store = useDocumentsStore()
const router = useRouter()

const title = ref('')
const subjectCode = ref('')
const fileInput = ref(null)
const selectedFile = ref(null)
const fileError = ref('')
const uploadError = ref('')
const isUploading = ref(false)

function triggerFileInput() {
    fileInput.value.click()
}

function handleFileChange(event) {
    const file = event.target.files[0]
    if (!file) return

    // accept=".pdf" แค่กรองในหน้าต่างเลือกไฟล์ ผู้ใช้ยังเลือก All files ได้ จึงต้องเช็กซ้ำ
    if (!isPdf(file)) {
        fileError.value = 'อัพโหลดได้เฉพาะไฟล์ .pdf เท่านั้น'
        selectedFile.value = null
        event.target.value = ''
        return
    }
    if (file.size > MAX_SIZE) {
        fileError.value = 'ขนาดไฟล์ต้องไม่เกิน 20 MB'
        selectedFile.value = null
        event.target.value = ''
        return
    }

    fileError.value = ''
    uploadError.value = ''
    selectedFile.value = file
    if (!title.value) {
        title.value = file.name.replace(/\.[^/.]+$/, "")
    }
}

async function handleUpload() {
    if (!selectedFile.value) {
        fileError.value = 'กรุณาเลือกไฟล์ PDF'
        return
    }

    isUploading.value = true
    uploadError.value = ''

    const result = await store.uploadDocument({
        file: selectedFile.value,
        title: title.value,
        subjectCode: subjectCode.value,
    })

    isUploading.value = false

    if (result.success) {
        router.push('/documents') // ไปดูรายการไฟล์ที่อัพโหลด
    } else {
        uploadError.value = result.message
    }
}

function handleCancel() {
    title.value = ''
    subjectCode.value = ''
    selectedFile.value = null
    fileError.value = ''
    uploadError.value = ''
    router.back()
}

function handleFileDrop(event) {
    const file = event.dataTransfer?.files[0]
    if (!file) return

    // เรียกใช้ logic ตรวจสอบไฟล์เดียวกับ handleFileChange
    processFile(file)
}

</script>

<template>
    <div class="upload-container">
        <h2 class="upload-title">Upload</h2>
        
        <div class="upload-content-grid">
            <!-- ฝั่งซ้าย: Dashed Dropzone -->
            <div 
                class="dropzone-box"
                @dragover.prevent
                @drop.prevent="handleFileDrop"
            >
            
                <div class="dropzone-inner">
                    <img :src="saebIcon" alt="SAEB" class="dropzone-logo" />
                    <span class="dropzone-note" :class="{ 'is-error': fileError }">
                        {{ fileError || (selectedFile ? `Selected: ${selectedFile.name}` : 'รองรับเฉพาะ .pdf') }}
                    </span>
                    
                    <!-- ปุ่มเลือกไฟล์ -->
                    <button type="button" class="choose-file-btn" @click="triggerFileInput">Choose File</button>
                    
                    <!-- Hidden Input สำหรับเปิดหน้าต่างเลือกไฟล์ในเครื่อง -->
                    <input 
                        type="file" 
                        ref="fileInput" 
                        @change="handleFileChange" 
                        accept="application/pdf,.pdf" 
                        style="display: none;" 
                    />
                </div>
            </div>

            <!-- ฝั่งขวา: Form -->
            <div class="form-section">
                <div class="form-group">
                    <label class="form-label">Title</label>
                    <input type="text" v-model="title" placeholder="Enter the title" maxlength="200" class="form-input" />
                </div>

                <div class="form-group">
                    <label class="form-label">Subject Code</label>
                    <input type="text" v-model="subjectCode" placeholder="Enter subject code" maxlength="20" class="form-input" />
                </div>

                <p v-if="uploadError" class="upload-error" role="alert">{{ uploadError }}</p>

                <div class="form-actions">
                    <button type="button" class="cancel-btn" :disabled="isUploading" @click="handleCancel">Cancel</button>
                    <button type="button" class="submit-upload-btn" :disabled="isUploading" @click="handleUpload">
                        {{ isUploading ? 'Uploading...' : 'Upload' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.upload-container {
    padding: 2.5rem 4rem;
    display: flex;
    flex-direction: column;
    min-height: 85vh;
    background-color: #fcf6e9;
}

.upload-title {
    font-size: 2rem;
    font-style: italic;
    font-weight: bold;
    margin-bottom: 1.5rem;
}

.upload-content-grid {
    display: flex;
    gap: 3rem;
    flex: 1;
}

.dropzone-box {
    flex: 1.2;
    border: 3px dashed #e63946;
    background-color: #fdfbf7;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    box-shadow: 4px 4px 0px #000;
}

.dropzone-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.2rem;
    text-align: center;
}

.dropzone-logo {
    width: 100px;
    height: auto;
}

.dropzone-note {
    font-size: 0.9rem;
    color: #444;
    max-width: 250px;
    word-break: break-all;
}

.choose-file-btn {
    background-color: #e9c46a;
    border: 2px solid #000;
    padding: 0.6rem 2rem;
    font-weight: bold;
    font-size: 1.1rem;
    box-shadow: 2px 2px 0px #000;
    cursor: pointer;
    transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.choose-file-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 4px 4px 0px #000;
}

.choose-file-btn:active {
    transform: translate(1px, 1px);
    box-shadow: 1px 1px 0px #000;
}

.form-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    justify-content: center;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-label {
    font-weight: bold;
    font-style: italic;
    font-size: 1.1rem;
}

.form-input {
    border: 2px solid #000;
    padding: 0.9rem 1rem;
    border-radius: 4px;
    background: #fff;
    font-size: 1rem;
    outline: none;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1rem;
}

.cancel-btn {
    background-color: #fff;
    border: 2px solid #000;
    padding: 0.5rem 2rem;
    font-weight: bold;
    font-style: italic;
    font-size: 1.1rem;
    color: #e63946;
    cursor: pointer;
    box-shadow: 2px 2px 0px #000;
    transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.cancel-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 4px 4px 0px #000;
}

.cancel-btn:active {
    transform: translate(1px, 1px);
    box-shadow: 1px 1px 0px #000;
}

.submit-upload-btn {
    background-color: #e63946;
    border: 2px solid #000;
    padding: 0.5rem 2.5rem;
    font-weight: bold;
    font-style: italic;
    font-size: 1.1rem;
    color: #fff;
    cursor: pointer;
    box-shadow: 2px 2px 0px #000;
    transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.submit-upload-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 4px 4px 0px #000;
}

.submit-upload-btn:active {
    transform: translate(1px, 1px);
    box-shadow: 1px 1px 0px #000;
}

.dropzone-note.is-error {
    color: #e63946;
    font-weight: bold;
}

.upload-error {
    margin: 0;
    color: #e63946;
    font-weight: bold;
    text-align: right;
}

.cancel-btn:disabled,
.submit-upload-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: 2px 2px 0px #000;
}
</style>