import axios from 'axios'
import * as SecureStore from 'expo-secure-store'

// Change this to your deployed backend URL in production
const BASE_URL = 'http://10.0.2.2:8080/api' // Android emulator → localhost

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token from secure storage
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch {}
  return config
})

// Handle 401 — token expired
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('auth_token')
      await SecureStore.deleteItemAsync('auth_user')
      // Navigation handled by AuthContext listener
    }
    return Promise.reject(error)
  }
)

export default api

// ---- API helpers ----

export const authApi = {
  register: (d) => api.post('/auth/register', d),
  login: (d) => api.post('/auth/login', d),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
}

export const projectApi = {
  getAll: (p) => api.get('/projects', { params: p }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (d) => api.post('/projects', d),
  update: (id, d) => api.put(`/projects/${id}`, d),
  delete: (id) => api.delete(`/projects/${id}`),
}

export const taskApi = {
  getAll: (p) => api.get('/tasks', { params: p }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (d) => api.post('/tasks', d),
  update: (id, d) => api.put(`/tasks/${id}`, d),
  delete: (id) => api.delete(`/tasks/${id}`),
}

export const dashboardApi = {
  get: () => api.get('/dashboard'),
}
