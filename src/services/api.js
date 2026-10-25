import axios from 'axios'

// เตรียม baseURL ไว้เรียก backend ในอนาคต
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '',
    timeout: 10000,
})

// TODO: ต่อ interceptor แนบ token ตอนมี auth จริง
// apiClient.interceptors.request.use((config) => { ... })

export default apiClient