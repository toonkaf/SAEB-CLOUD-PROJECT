<script setup>
import { ref, reactive } from 'vue'

// TODO: แทนที่ mock data นี้ด้วยข้อมูลจริงจาก API ทีหลัง
const documents = ref([
    { id: 1, title: 'สรุป Discreate บท 1', author: 'coffee' },
    { id: 2, title: 'สรุป Discreate บท 1', author: 'coffee' },
    { id: 3, title: 'สรุป Discreate บท 1', author: 'coffee' },
    { id: 4, title: 'สรุป Discreate บท 1', author: 'coffee' },
    { id: 5, title: 'สรุป Discreate บท 1', author: 'coffee' },
    { id: 6, title: 'สรุป Discreate บท 1', author: 'coffee' },
    { id: 7, title: 'สรุป Discreate บท 1', author: 'coffee' },
    { id: 8, title: 'สรุป Discreate บท 1', author: 'coffee' },
    { id: 9, title: 'สรุป Discreate บท 1', author: 'coffee' },
    { id: 10, title: 'สรุป Discreate บท 1', author: 'coffee' },
])

const searchQuery = ref('')

// ส่วนจัดการ Popup อัปโหลดเอกสาร
const isOpen = ref(false)
const form = reactive({
  courseCode: '',
  sheetName: '',
  file: null
})

function handleAddDocument() {
  isOpen.value = true // กดแล้วเปิด Modal ขึ้นมา
}

// ฟังก์ชันเช็คไฟล์ (บังคับรับเฉพาะ .pdf)
const handleFileChange = (event) => {
  const selectedFile = event.target.files[0]
  if (selectedFile) {
    if (selectedFile.type === 'application/pdf') {
      form.file = selectedFile
    } else {
      alert('กรุณาอัปโหลดเฉพาะไฟล์นามสกุล .pdf เท่านั้นครับ!')
      event.target.value = ''
      form.file = null
    }
  }
}

// ฟังก์ชันตอนกดปุ่ม Done ใน Popup
const handleDone = () => {
  console.log('ข้อมูลเอกสารที่อัปโหลด:', {
    courseCode: form.courseCode,
    sheetName: form.sheetName,
    fileName: form.file ? form.file.name : null
  })

  // TODO: เขียนโค้ดส่งข้อมูลฟอร์มและไฟล์ไปให้ Backend ตรงนี้
  alert('อัปโหลดเอกสารสำเร็จ!')
  closeModal()
}

// ฟังก์ชันปิดและล้างค่าในฟอร์ม
const closeModal = () => {
  isOpen.value = false
  form.courseCode = ''
  form.sheetName = ''
  form.file = null
}
</script>

<template>
    <div class="main-view">
        <div class="toolbar">
            <button class="add-btn" @click="handleAddDocument">
                <span class="plus">+</span> เพิ่มเอกสารใหม่
            </button>

            <div class="search-box">
                <input
                v-model="searchQuery"
                type="text"
                placeholder="ค้นหาเอกสาร"
                />
                <span class="search-icon">🔍</span>
            </div>
            </div>

            <div class="documents-panel">
            <div class="bg-pattern" aria-hidden="true">
                <p>Smart AI Exam Brief Smart AI Exam <br>
                Brief Smart AI Exam Brief <br>
                Exam Brief Smart AI Exam Brief Smart AI Exam Brief <br>
                Smart AI Exam Brief Smart AI Exam Brief <br>
                Brief Smart AI Exam Brief Smart AI Exam Brief <br>
                Smart AI Exam Brief Smart AI Exam Brief Smart <br>
                AI Exam Brief AI Smart AI Exam Brief Smart <br>
                Smart AI Exam Brief
            </p>
            </div>

            <div class="documents-grid">
                <div
                v-for="doc in documents"
                :key="doc.id"
                class="doc-card"
                >
                <div class="doc-thumbnail"></div>
                <p class="doc-title">{{ doc.title }}</p>
                <p class="doc-author">By {{ doc.author }}</p>
                </div>
            </div>
            <div class="page-count">page 1</div>
            </div>
        </div>

        <!-- POPUP อัปโหลดไฟล์ PDF -->
        <div v-if="isOpen" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>อัปโหลดชีทเรียน</h2>
                    <button class="close-btn" @click="closeModal">&times;</button>
                </div>

                <form @submit.prevent="handleDone" class="modal-form">
                    <!-- ช่องใส่รหัสวิชา -->
                    <div class="form-group">
                        <label>รหัสวิชา</label>
                        <input 
                            type="text" 
                            v-model="form.courseCode" 
                            placeholder="เช่น 01418111" 
                            required
                        />
                    </div>

                    <!-- ช่องใส่ชื่อชีทเรียน -->
                    <div class="form-group">
                        <label>ชื่อชีทเรียน</label>
                        <input 
                            type="text" 
                            v-model="form.sheetName" 
                            placeholder="เช่น สรุป Lecture บทที่ 1" 
                            required
                        />
                    </div>

                    <!-- ช่องเลือกไฟล์ PDF -->
                    <div class="form-group">
                        <label>ไฟล์ PDF (.pdf เท่านั้น)</label>
                        <input 
                            type="file" 
                            accept="application/pdf" 
                            @change="handleFileChange" 
                            required
                        />
                    </div>

                    <!-- ปุ่มกด Action (ยกเลิก / Done) -->
                    <div class="modal-actions">
                        <button type="button" class="cancel-btn" @click="closeModal">ยกเลิก</button>
                        <button type="submit" class="done-btn">Done</button>
                    </div>
                </form>
            </div>
        </div>
</template>

<style scoped>
.main-view {
    min-height: 80vh;
    padding: 2rem;
}

.toolbar {
    display: flex;
    gap: 1vw;
    margin-bottom: 1.5vh;
}

.add-btn {
    font-family: 'Le mumure' , 'San-serif';
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background: #7a2222;
    color: #efe8dc;
    border: none;
    border-radius: 8px;
    padding: 0.7rem 1.2rem;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
}

.add-btn:hover {
    background: #8f2a2a;
}

.plus {
    font-size: 1.1rem;
}

.search-box {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
    background: #a89484;
    border-radius: 8px;
    padding: 0 1rem;
}

.search-box input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    padding: 0.7rem 0;
    color: #3a2f26;
    font-size: 0.95rem;
}

.search-box input::placeholder {
    color: #f0e9de;
}

.search-icon {
    opacity: 0.8;
}

.documents-panel {
    position: relative;
    background: #f4efe4;
    border: 1px solid #d8cdb8;
    border-radius: 12px;
    padding: 2rem;
    overflow: hidden;
}

.bg-pattern {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    opacity: 0.15;
    z-index: 0;
    pointer-events: none;
}

.bg-pattern p {
    font-family: 'Lacquer', sans-serif;
    font-size: 50px;
    text-align: center;
    color: #905E5E;
    margin: 0;
    transform: rotate(-1deg);
}

.documents-grid {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 1.5vh;
}

.doc-card {
    display: flex;
    flex-direction: column;
}

.doc-thumbnail {
    aspect-ratio: 3 / 4;
    background: #c9c4bb;
    border: 2px solid #fff;
    border-radius: 6px;
    margin-bottom: 0.6rem;
}

.doc-title {
    font-size: 1rem;
    font-weight: bolder;
    margin: 0;
}

.doc-author {
    font-size: 0.8rem;
    color: #8a7a6a;
    margin: 0.2rem 0 0;
}

/* Styling for Popup*/
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(58, 47, 38, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
}

.modal-content {
    background: #f4efe4;
    border: 1px solid #d8cdb8;
    border-radius: 12px;
    padding: 2rem;
    width: 100%;
    max-width: 420px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.2rem;
}

.modal-header h2 {
    font-size: 1.25rem;
    font-weight: bold;
    color: #3a2f26;
    margin: 0;
}

.close-btn {
    background: transparent;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #8a7a6a;
}

.modal-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
}

.form-group label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #3a2f26;
}

.form-group input[type="text"],
.form-group input[type="file"] {
    padding: 0.6rem 0.8rem;
    border: 1px solid #d8cdb8;
    border-radius: 8px;
    background: #fff;
    font-size: 0.9rem;
    outline: none;
    color: #3a2f26;
}

.form-group input[type="text"]:focus {
    border-color: #7a2222;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.8rem;
    margin-top: 1rem;
}

.cancel-btn {
    background: #d8cdb8;
    color: #3a2f26;
    border: none;
    border-radius: 8px;
    padding: 0.6rem 1.2rem;
    font-weight: 600;
    cursor: pointer;
}

.cancel-btn:hover {
    background: #c5b8a2;
}

.done-btn {
    background: #7a2222;
    color: #efe8dc;
    border: none;
    border-radius: 8px;
    padding: 0.6rem 1.2rem;
    font-weight: 600;
    cursor: pointer;
}

.done-btn:hover {
    background: #8f2a2a;
}

@media (max-width: 1024px) {
    .documents-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (max-width: 640px) {
    .toolbar {
        flex-direction: column;
    }
    .documents-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>