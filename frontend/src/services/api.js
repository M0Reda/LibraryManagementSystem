import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('userRole')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const login = (data) => api.post('/auth/login', data)
export const register = (data) => api.post('/auth/register', data)

export const getBooks = () => api.get('/books')
export const getBook = (id) => api.get(`/books/${id}`)
export const createBook = (data) => api.post('/books', data)
export const updateBook = (id, data) => api.put(`/books/${id}`, data)
export const deleteBook = (id) => api.delete(`/books/${id}`)

export const getAuthors = () => api.get('/authors')
export const getAuthor = (id) => api.get(`/authors/${id}`)
export const createAuthor = (data) => api.post('/authors', data)
export const updateAuthor = (id, data) => api.put(`/authors/${id}`, data)
export const deleteAuthor = (id) => api.delete(`/authors/${id}`)

export const getMembers = () => api.get('/members')
export const getMember = (id) => api.get(`/members/${id}`)
export const updateMember = (id, data) => api.put(`/members/${id}`, data)
export const deleteMember = (id) => api.delete(`/members/${id}`)

export const getBorrowings = () => api.get('/borrowings')
export const getMemberBorrowings = (memberId) => api.get(`/borrowings/member/${memberId}`)
export const createBorrowing = (data) => api.post('/borrowings', data)
export const returnBorrowing = (id) => api.post(`/borrowings/${id}/return`)

export default api
