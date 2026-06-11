/**
 * api.js
 * -------
 * All HTTP requests to the backend live here.
 * We use axios — it's like fetch() but simpler and handles errors better.
 *
 * HOW IT WORKS:
 *  - We create one axios instance with the base URL already set.
 *  - Every request automatically attaches the JWT token from localStorage.
 *  - Any component imports from this file: import { postAPI } from '../services/api'
 */

import axios from 'axios'

// Base URL — change this to your backend URL when you deploy
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create a reusable axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Before every request: attach the JWT token if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ss_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// After every response: if 401 (Unauthorized), force logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ss_token')
      localStorage.removeItem('ss_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  googleLogin: (token) => api.post('/auth/google', { token }),
  getMe:    ()     => api.get('/auth/me'),
}

// ─── POSTS ────────────────────────────────────────────────────────────────────
export const postAPI = {
  // Get feeds — level is 'society' | 'area' | 'public'
  getFeed:      (level, params) => api.get(`/posts/feed/${level}`, { params }),
  getPost:      (id)            => api.get(`/posts/${id}`),
  createPost:   (data)          => api.post('/posts', data),
  deletePost:   (id)            => api.delete(`/posts/${id}`),
  likePost:     (id)            => api.put(`/posts/${id}/like`),
  addComment:   (id, text)      => api.post(`/posts/${id}/comments`, { text }),
  deleteComment:(postId, cmtId) => api.delete(`/posts/${postId}/comments/${cmtId}`),
}

// ─── SOCIETY ──────────────────────────────────────────────────────────────────
export const societyAPI = {
  create:     (data) => api.post('/society', data),
  join:       (code) => api.post('/society/join', { code }),
  getMembers: (id)   => api.get(`/society/${id}/members`),
  getMyInfo:  ()     => api.get('/society/mine'),
}

// ─── AREA ─────────────────────────────────────────────────────────────────────
export const areaAPI = {
  getArea:    (id)   => api.get(`/area/${id}`),
  searchArea: (q)    => api.get('/area/search', { params: { q } }),
}

// ─── BUSINESS ─────────────────────────────────────────────────────────────────
export const businessAPI = {
  register:   (data) => api.post('/business', data),
  getMyBiz:   ()     => api.get('/business/mine'),
  promote:    (data) => api.post('/business/promote', data),
  getNearby:  (areaId) => api.get(`/business/nearby/${areaId}`),
}

// ─── USER ─────────────────────────────────────────────────────────────────────
export const userAPI = {
  getProfile:    (id)   => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar:  (file) => {
    const form = new FormData()
    form.append('avatar', file)
    return api.post('/users/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
export const notifAPI = {
  getAll:   () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
}

export default api
