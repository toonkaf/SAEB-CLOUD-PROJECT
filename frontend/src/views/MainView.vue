<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDocumentsStore } from '@/stores/documents'

const router = useRouter()
const store = useDocumentsStore()

const searchQuery = ref('')
const errorMessage = ref('')

onMounted(async () => {
    const result = await store.fetchAllDocuments()
    if (!result.success) errorMessage.value = result.message
})

// ค้นหาจากชื่อเอกสาร รหัสวิชา หรือผู้อัพโหลด
const filteredDocuments = computed(() => {
    const q = searchQuery.value.trim().toLowerCase()
    if (!q) return store.allDocuments
    return store.allDocuments.filter((d) =>
        [d.title, d.subjectCode, d.author].some((v) => (v || '').toLowerCase().includes(q))
    )
})

async function handleOpen(id) {
    errorMessage.value = ''
    const result = await store.openDocument(id)
    if (!result.success) errorMessage.value = result.message
}
</script>

<template>
    <div class="main-view">
        <div class="toolbar">
            <button type="button" class="add-btn" @click="router.push('/uploads')">
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

            <p v-if="errorMessage" class="error-text" role="alert">{{ errorMessage }}</p>
            <p v-if="store.isLoading" class="status-text">กำลังโหลด...</p>
            <p v-else-if="!filteredDocuments.length" class="status-text">
                {{ searchQuery ? 'ไม่พบเอกสารที่ค้นหา' : 'ยังไม่มีเอกสาร กด “เพิ่มเอกสารใหม่” เพื่ออัพโหลดไฟล์ PDF' }}
            </p>

            <div v-else class="documents-grid">
                <button
                    v-for="doc in filteredDocuments"
                    :key="doc.id"
                    type="button"
                    class="doc-card"
                    @click="handleOpen(doc.id)"
                >
                    <div class="doc-thumbnail">PDF</div>
                    <p class="doc-title">{{ doc.title }}</p>
                    <p class="doc-author">
                        <template v-if="doc.subjectCode">{{ doc.subjectCode }} · </template>By {{ doc.author }}
                    </p>
                </button>
            </div>
            <div class="page-count">page 1</div>
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
    align-items: stretch;
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    color: inherit;
    text-align: left;
    cursor: pointer;
}

.doc-card:hover .doc-thumbnail {
    border-color: #7a2222;
}

.doc-card:focus-visible {
    outline: 2px solid #7a2222;
    outline-offset: 3px;
}

.doc-thumbnail {
    display: grid;
    place-items: center;
    color: #8a7a6a;
    font-weight: bold;
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

.status-text {
    position: relative;
    z-index: 1;
    margin: 0;
    color: #8a7a6a;
}

.error-text {
    position: relative;
    z-index: 1;
    margin: 0 0 1rem;
    color: #e63946;
    font-weight: bold;
}
</style>