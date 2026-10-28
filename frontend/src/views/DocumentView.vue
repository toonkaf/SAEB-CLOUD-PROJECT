<script setup>
import { ref, onMounted } from 'vue'
import { useDocumentsStore } from '@/stores/documents'

const store = useDocumentsStore()
const errorMessage = ref('')

onMounted(async () => {
    const result = await store.fetchDocuments()
    if (!result.success) errorMessage.value = result.message
})

async function handleOpen(id) {
    errorMessage.value = ''
    const result = await store.openDocument(id)
    if (!result.success) errorMessage.value = result.message
}

async function handleRemove(doc) {
    if (!window.confirm(`ลบ “${doc.title}” ใช่หรือไม่?`)) return
    errorMessage.value = ''
    const result = await store.removeDocument(doc.id)
    if (!result.success) errorMessage.value = result.message
}

// ใช้ปฏิทินพุทธ (พ.ศ.) พร้อมดักจับกรณีวันที่ไม่ถูกต้อง
function formatDateTime(date) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '-'
    return new Intl.DateTimeFormat('th-TH', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date)
}

// เพิ่ม Safe Check ป้องกัน bytes เป็น undefined / null / NaN
function formatSize(bytes) {
    if (!bytes || isNaN(bytes) || bytes === 0) return '0.0 KB'
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>

<template>
    <div class="document-view">
        <h1>เอกสาร</h1>

        <p v-if="errorMessage" class="error-text" role="alert">{{ errorMessage }}</p>

        <p v-if="store.isLoading" class="empty">กำลังโหลด...</p>

        <p v-else-if="!store.documents.length" class="empty">
        ยังไม่มีเอกสาร กด “+ Upload” เพื่อเลือกไฟล์ PDF จากเครื่อง
        </p>

        <ul v-else class="doc-list">
        <li v-for="doc in store.documents" :key="doc.id" class="doc-item">
            <div class="doc-icon" aria-hidden="true">PDF</div>
            <div class="doc-info">
            <p class="doc-name">
                {{ doc.title }}
                <span v-if="doc.subjectCode" class="doc-code">{{ doc.subjectCode }}</span>
            </p>
            <p class="doc-meta">
                {{ doc.fileName }} · {{ formatSize(doc.size) }}
            </p>
            <p class="doc-meta">
                อัพโหลดเมื่อ
                <time :datetime="doc.uploadedAt && doc.uploadedAt.toISOString ? doc.uploadedAt.toISOString() : ''">
                {{ formatDateTime(doc.uploadedAt) }}
                </time>
            </p>
            </div>
            <div class="doc-actions">
            <button type="button" class="open-btn" @click="handleOpen(doc.id)">เปิด</button>
            <button type="button" class="remove-btn" @click="handleRemove(doc)">ลบ</button>
            </div>
        </li>
        </ul>
    </div>
</template>

<style scoped>
.document-view {
    padding: 1rem 0;
    height: 80vh;
}

.empty {
    color: #8a7a6a;
}

.doc-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
}

.doc-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.8rem 1rem;
    background: #fdfbf7;
    border: 2px solid #000;
    box-shadow: 4px 4px 0px #000;
}

.doc-icon {
    flex-shrink: 0;
    width: 48px;
    aspect-ratio: 3 / 4;
    display: grid;
    place-items: center;
    background: #e63946;
    color: #fff;
    border: 2px solid #000;
    font-size: 0.75rem;
    font-weight: 700;
}

.doc-info {
    flex: 1;
    min-width: 0;
}

.doc-name {
    margin: 0;
    font-weight: bolder;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.doc-code {
    margin-left: 0.5rem;
    padding: 0.1rem 0.5rem;
    background: #e9c46a;
    border: 2px solid #000;
    font-size: 0.8rem;
    font-weight: bold;
}

.doc-meta {
    margin: 0.2rem 0 0;
    font-size: 0.85rem;
    color: #6b5d50;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.error-text {
    margin: 0 0 1rem;
    padding: 0.7rem 1rem;
    background: #fff;
    border: 2px solid #000;
    box-shadow: 2px 2px 0px #000;
    color: #e63946;
    font-weight: bold;
}

.doc-actions {
    flex-shrink: 0;
    display: flex;
    gap: 0.6rem;
}

.open-btn {
    background: #e9c46a;
    color: #000;
    border: 2px solid #000;
    box-shadow: 2px 2px 0px #000;
    padding: 0.4rem 1rem;
    font: inherit;
    font-weight: bold;
    font-style: italic;
    cursor: pointer;
    transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.open-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 4px 4px 0px #000;
}

.open-btn:active {
    transform: translate(1px, 1px);
    box-shadow: 1px 1px 0px #000;
}

.remove-btn {
    flex-shrink: 0;
    background: #fff;
    color: #e63946;
    border: 2px solid #000;
    box-shadow: 2px 2px 0px #000;
    padding: 0.4rem 1rem;
    font: inherit;
    font-weight: bold;
    font-style: italic;
    cursor: pointer;
    transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.remove-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 4px 4px 0px #000;
}

.remove-btn:active {
    transform: translate(1px, 1px);
    box-shadow: 1px 1px 0px #000;
}
</style>