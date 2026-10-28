<script setup>
import { ref, computed, onMounted } from 'vue'
import saebIcon from '@/assets/images/SAEB_ICON.png'
import { useDocumentsStore } from '@/stores/documents'

const docsStore = useDocumentsStore()
const searchKeyword = ref('')
const selectedTagCode = ref(null) 
const isAiOpen = ref(false)       
const userMessage = ref('')
const selectedDocIds = ref([])    

onMounted(() => {
    docsStore.fetchAllDocuments()
})

const availableTags = computed(() => {
    const codes = docsStore.allDocuments.map(doc => doc.subjectCode).filter(Boolean)
    return [...new Set(codes)]
})

const filteredDocuments = computed(() => {
    return docsStore.allDocuments.filter(doc => {
        const titleMatch = doc.title?.toLowerCase().includes(searchKeyword.value.toLowerCase()) || 
                            doc.fileName?.toLowerCase().includes(searchKeyword.value.toLowerCase())
        const codeMatch = doc.subjectCode?.toLowerCase().includes(searchKeyword.value.toLowerCase())
        const matchesSearch = titleMatch || codeMatch
        
        const matchesTag = selectedTagCode.value ? doc.subjectCode === selectedTagCode.value : true
        return matchesSearch && matchesTag
    })
})

function filterByTag(code) {
    selectedTagCode.value = selectedTagCode.value === code ? null : code
}

function selectAllTags() {
    selectedTagCode.value = null
}

function toggleAskAI() {
    isAiOpen.value = !isAiOpen.value
}

async function handleAskAI() {
    if (selectedDocIds.value.length === 0) return alert('กรุณาติ๊กเลือกเอกสารอย่างน้อย 1 ไฟล์ครับ')
    
    if (!isAiOpen.value) isAiOpen.value = true
    
    for (const id of selectedDocIds.value) {
        if (!docsStore.summaries[id]) {
            await docsStore.askAI(id)
        }
    }
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

        <div class="filter-tags">
            <span class="tag" :class="{ active: selectedTagCode === null }" @click="selectAllTags">
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

        <!-- รายการเอกสารจริงจาก Backend -->
        <div class="document-list">
            <div v-if="filteredDocuments.length === 0" class="no-result">
            ไม่พบเอกสารที่ค้นหา หรือยังไม่มีเอกสารในระบบ
            </div>
            <div v-for="doc in filteredDocuments" :key="doc.id" class="doc-card">
            <div class="doc-left">
                <!-- ผูก Checkbox เข้ากับ Array เก็บ ID -->
                <input type="checkbox" :value="doc.id" v-model="selectedDocIds" class="doc-checkbox" />
                <div class="doc-info">
                <span class="doc-name">{{ doc.title || doc.fileName }}</span>
                <span class="doc-sub"
                    >{{ (doc.size / 1024).toFixed(1) }} KB | Upload by :
                    {{ doc.uploader_id || 'Unknown' }}</span
                >
                </div>
            </div>
            <div class="doc-right">
                <span class="doc-code">{{ doc.subjectCode }}</span>
                <button class="open-btn" @click="docsStore.openDocument(doc.id)">open</button>
            </div>
            </div>
        </div>

        <div class="bottom-action">
            <button class="ask-ai-small-btn" @click="handleAskAI">
            {{ isAiOpen ? 'Update AI' : 'ASK AI' }}
            </button>
        </div>
        </section>

        <!-- ฝั่งขวา: หน้า AI -->
        <section v-if="isAiOpen" class="right-section ai-panel">
        <div class="ask-ai-box">
            <div class="ai-header-row">
            <span class="ask-ai-header-label">Ask AI Assistant</span>
            <button class="close-ai-btn" @click="toggleAskAI">✕</button>
            </div>

            <div class="chat-inner-container">
            <div class="chat-box-area" :class="{'center-content': selectedDocIds.length === 0 || docsStore.isAiLoading}">
                <!-- กรณีไม่มีไฟล์ถูกเลือกหรือยังไม่มีสรุป -->
                <img
                v-if="selectedDocIds.length === 0 && !docsStore.isAiLoading"
                :src="saebIcon"
                alt="SAEB"
                class="ai-logo"
                />
                <span v-else-if="docsStore.isAiLoading" style="color: #666; font-style: italic"
                >กำลังให้ AI สรุปข้อมูล...</span
                >

                <!-- แสดงผลสรุปของเอกสารที่ถูกเลือก -->
                <div
                v-else
                class="summary-results"
                >
                <div v-for="id in selectedDocIds" :key="id" style="margin-bottom: 1.5rem">
                    <strong style="color: #2c9440"
                    >📌 สรุปไฟล์: {{ docsStore.allDocuments.find((d) => d.id === id)?.title }}</strong
                    >
                    <p class="summary-text">
                    {{ docsStore.summaries[id] || 'กำลังรอข้อมูล...' }}
                    </p>
                </div>
                </div>
            </div>
            </div>
        </div>
        </section>
    </div>
</template>

<style scoped>
.content-container {
    display: flex;
    padding: 1rem 3rem;
    gap: 1rem;
    height: 80vh; /* บังคับความสูงตายตัว ป้องกัน Layout ยืด */
    overflow: hidden;
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
    height: 92%;
}

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
    border: 2px solid #2c9440;
    color: #2c9440;
    padding: 0.3rem 0.8rem;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: bold;
    background: #e9f5f3;
    cursor: pointer;
    transition: all 0.2s;
}

.tag.active,
.tag:hover {
    background-color: #2c9440;
    color: #fff;
}

.document-list {
    flex: 1; /* ดันเนื้อหาให้เต็มพื้นที่ และแสดง scrollbar เมื่อล้น */
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    padding-right: 0.5rem;
}

/* Custom Scrollbar สำหรับ Document List และ AI Chat */
.document-list::-webkit-scrollbar,
.chat-box-area::-webkit-scrollbar {
    width: 8px;
}
.document-list::-webkit-scrollbar-thumb,
.chat-box-area::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 4px;
}
.document-list::-webkit-scrollbar-track,
.chat-box-area::-webkit-scrollbar-track {
    background: #f1f1f1;
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
    background-color: #2c9440;
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
    padding-top: 1rem;
    border-top: 1px dashed #ccc;
}

.ask-ai-small-btn {
    background-color: #e9c46a;
    border: 2px solid #000;
    padding: 0.4rem 1.5rem;
    font-weight: bold;
    font-style: italic;
    box-shadow: 2px 2px 0px #000;
    cursor: pointer;
    transition:
        transform 0.1s ease,
        box-shadow 0.1s ease;
}

.ask-ai-small-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 4px 4px 0px #000;
}

.right-section.ai-panel {
    flex: 1;
    background: #fff;
    border: 2px solid #000;
    box-shadow: 4px 4px 0px #000;
    display: flex;
    flex-direction: column;
    height: 99%;
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
    overflow: hidden;
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
    overflow: hidden;
}

.chat-box-area {
    flex: 1;
    border: 2px solid #e63946;
    border-radius: 8px;
    background: #fff;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    overflow-y: auto; /* เพิ่ม Scrollbar ตรงนี้ */
}

/* จัดกึ่งกลางเฉพาะตอนหน้าว่างหรือกำลังโหลด */
.chat-box-area.center-content {
    align-items: center;
    justify-content: center;
}

.ai-logo {
    width: 100px;
    height: auto;
    opacity: 0.4;
}

.summary-results {
    width: 100%;
    text-align: left;
}

.summary-text {
    white-space: pre-wrap;
    font-size: 0.95rem;
    line-height: 1.6;
    margin-top: 0.5rem;
    color: #333;
}
</style>