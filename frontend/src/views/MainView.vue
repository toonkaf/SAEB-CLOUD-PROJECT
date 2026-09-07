<script setup>
import { ref } from 'vue'

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

function handleAddDocument() {
  // TODO: เปิด modal หรือ navigate ไปหน้า upload
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