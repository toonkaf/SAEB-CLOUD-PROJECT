<script setup>
import { ref, computed } from 'vue'
import saebIcon from '@/assets/images/SAEB_ICON.png'

const searchKeyword = ref('')
const selectedTagCode = ref(null) // null หมายถึงเลือก "ALL"
const isAiOpen = ref(false)     // สถานะเปิด-ปิดหน้า Ask AI ฝั่งขวา
const userMessage = ref('')     // ข้อความแชทกับ AI

// ข้อมูลตัวอย่างเอกสาร
const documents = ref([
  { id: 1, title: 'Calculus II', pages: 86, uploader: 'P\'Coffee', code: '06066000', checked: true },
  { id: 2, title: 'Linear Algebra', pages: 64, uploader: 'P\'Latte', code: '06066001', checked: false },
  { id: 3, title: 'Physics I', pages: 120, uploader: 'P\'Mocha', code: '06066002', checked: false },
  { id: 4, title: 'Calculus II (Midterm)', pages: 45, uploader: 'P\'Espresso', code: '06066000', checked: true },
  { id: 5, title: 'Data Structures', pages: 95, uploader: 'P\'Americano', code: '06066003', checked: false },
])

// รายชื่อรหัสวิชาทั้งหมดสำหรับทำปุ่ม Tag (ดึงแบบไม่ซ้ำ)
const availableTags = computed(() => {
  const codes = documents.value.map(doc => doc.code)
  return [...new Set(codes)]
})

// ฟังก์ชันกรองเอกสาร (กรองตามช่องค้นหา และ Tag รหัสวิชาที่เลือก)
const filteredDocuments = computed(() => {
  return documents.value.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
                          doc.code.toLowerCase().includes(searchKeyword.value.toLowerCase())
    const matchesTag = selectedTagCode.value ? doc.code === selectedTagCode.value : true
    return matchesSearch && matchesTag
  })
})

// ฟังก์ชันคลิกที่ Tag เพื่อกรองวิชา
function filterByTag(code) {
  if (selectedTagCode.value === code) {
    selectedTagCode.value = null // ถ้าคลิกซ้ำให้กลับไปเลือก ALL
  } else {
    selectedTagCode.value = code
  }
}

// ฟังก์ชันเลือกดูทุกวิชา (ALL)
function selectAllTags() {
  selectedTagCode.value = null
}

// ฟังก์ชันเปิด-ปิด Ask AI ด้านขวา
function toggleAskAI() {
  isAiOpen.value = !isAiOpen.value
}

// ฟังก์ชันส่งข้อความแชทหา AI
function sendMessage() {
  if (!userMessage.value.trim()) return
  console.log('User sent to AI:', userMessage.value)
  userMessage.value = ''
}
</script>

<template>
  <div class="content-container">
    <!-- ฝั่งซ้าย: คลังสรุป -->
    <section :class="['left-section', { 'full-width': !isAiOpen }]">
      <h2 class="section-title">คลังสรุป</h2>

      <div class="search-box-container">
        <input 
          type="text" 
          v-model="searchKeyword" 
          placeholder="ค้นหาวิชาหรือชื่อสรุป" 
          class="search-input" 
        />
        <button class="search-btn">ค้นหา</button>
      </div>

      <!-- ปุ่ม Tag รหัสวิชาทั้งหมด (มีปุ่ม ALL ด้านหน้า) -->
      <div class="filter-tags">
        <span 
          class="tag"
          :class="{ active: selectedTagCode === null }"
          @click="selectAllTags"
        >
          ALL
        </span>
        <span 
          v-for="code in availableTags" 
          :key="code" 
          class="tag"
          :class="{ active: selectedTagCode === code }"
          @click="filterByTag(code)"
        >
          {{ code }}
        </span>
      </div>

      <!-- รายการเอกสารที่ผ่านการกรองแล้ว -->
      <div class="document-list">
        <div v-if="filteredDocuments.length === 0" class="no-result">
          ไม่พบเอกสารที่ค้นหา
        </div>
        <div v-for="doc in filteredDocuments" :key="doc.id" class="doc-card">
          <div class="doc-left">
            <input type="checkbox" v-model="doc.checked" class="doc-checkbox" />
            <div class="doc-info">
              <span class="doc-name">{{ doc.title }}</span>
              <span class="doc-sub">{{ doc.pages }} Pages | Upload by : {{ doc.uploader }}</span>
            </div>
          </div>
          <div class="doc-right">
            <span class="doc-code">{{ doc.code }}</span>
            <button class="open-btn">open</button>
          </div>
        </div>
      </div>

      <div class="bottom-action">
        <button class="ask-ai-small-btn" @click="toggleAskAI">
          {{ isAiOpen ? 'Close AI' : 'ASK AI' }}
        </button>
      </div>
    </section>

    <!-- ฝั่งขวา: หน้า AI ที่จะเลื่อน/แสดงขึ้นมาเมื่อกดปุ่ม Ask AI -->
    <section v-if="isAiOpen" class="right-section ai-panel">
      <div class="ask-ai-box">
        <div class="ai-header-row">
          <span class="ask-ai-header-label">Ask AI Assistant</span>
          <button class="close-ai-btn" @click="toggleAskAI">✕</button>
        </div>
        
        <div class="chat-inner-container">
          <div class="chat-box-area">
            <img :src="saebIcon" alt="SAEB" class="ai-logo" />
          </div>
          <div class="chat-input-wrapper">
            <input type="text" v-model="userMessage" placeholder="อธิบายเนื้อหาให้หน่อย . . ." class="chat-text-input" />
            <button class="send-btn" @click="sendMessage">send</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.content-container {
  display: flex;
  padding: 2rem 3rem;
  gap: 2rem;
  min-height: 85vh;
  background-color: #fcf6e9;
  transition: all 0.3s ease;
}

.left-section {
  flex: 1.2;
  background: #fdfbf7;
  border: 2px solid #000;
  padding: 1.5rem;
  box-shadow: 4px 4px 0px #000;
  display: flex;
  flex-direction: column;
  transition: flex 0.3s ease;
}

/* ถ้าปิด AI ฝั่งซ้ายจะขยายเต็มจอสวยๆ */
.left-section.full-width {
  flex: 1;
}

.section-title {
  font-size: 1.8rem;
  font-style: italic;
  font-weight: bold;
  margin-bottom: 1rem;
}

.search-box-container {
  display: flex;
  background: #000;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.search-input {
  flex: 1;
  padding: 0.8rem 1rem;
  border: none;
  outline: none;
  font-size: 1rem;
  background: #fff;
  color: #000;
}

.search-btn {
  background-color: #e63946;
  color: #fff;
  border: none;
  padding: 0 1.5rem;
  font-weight: bold;
  cursor: pointer;
}

.filter-tags {
  display: flex;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.tag {
  border: 2px solid #2C9440;
  color: #2C9440;
  padding: 0.3rem 0.8rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: bold;
  background: #e9f5f3;
  cursor: pointer;
  transition: all 0.2s;
}

/* สไตล์ตอนกดเลือก Tag รหัสวิชา / ALL */
.tag.active, .tag:hover {
  background-color: #2C9440;
  color: #fff;
}

.document-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  max-height: 420px;
  padding-right: 0.5rem;
}

.no-result {
  text-align: center;
  color: #777;
  padding: 2rem;
  font-style: italic;
}

.doc-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fefae0;
  border: 2px solid #000;
  padding: 0.8rem 1rem;
  border-radius: 6px;
}

.doc-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.doc-checkbox {
  width: 20px;
  height: 20px;
  accent-color: #e63946;
  cursor: pointer;
}

.doc-info {
  display: flex;
  flex-direction: column;
}

.doc-name {
  font-weight: bold;
  font-style: italic;
  font-size: 1.1rem;
}

.doc-sub {
  font-size: 0.85rem;
  color: #555;
}

.doc-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.doc-code {
  border: 1px solid #000;
  padding: 0.2rem 0.6rem;
  font-size: 0.9rem;
  background: #fff;
  border-radius: 4px;
}

.open-btn {
  background-color: #2C9440;
  color: #fff;
  border: 2px solid #000;
  padding: 0.3rem 1rem;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
}

.bottom-action {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

.ask-ai-small-btn {
  background-color: #e9c46a;
  border: 2px solid #000;
  padding: 0.4rem 1.5rem;
  font-weight: bold;
  font-style: italic;
  box-shadow: 2px 2px 0px #000;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.ask-ai-small-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0px #000;
}

/* Right Section (Ask AI Panel) */
.right-section.ai-panel {
  flex: 1;
  background: #fff;
  border: 2px solid #000;
  box-shadow: 4px 4px 0px #000;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.ask-ai-box {
  padding: 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.ai-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.ask-ai-header-label {
  color: #e63946;
  font-style: italic;
  font-weight: bold;
  font-size: 1.1rem;
}

.close-ai-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
}

.chat-inner-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-top: 0.5rem;
  gap: 0.8rem;
}

.chat-box-area {
  flex: 1;
  border: 2px solid #e63946;
  border-radius: 8px;
  background: #fff;
  min-height: 200px;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-logo {
    width: 100px;
    height: auto;
    opacity: 0.4;
}

.chat-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.chat-text-input {
  border: 1px solid #000;
  padding: 0.8rem;
  border-radius: 4px;
  outline: none;
  background: #fefae0;
  font-size: 0.95rem;
}

.send-btn {
  align-self: flex-end;
  background-color: #2C9440;
  color: #fff;
  border: 2px solid #000;
  padding: 0.3rem 1.5rem;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
  box-shadow: 2px 2px 0px #000;
}
</style>