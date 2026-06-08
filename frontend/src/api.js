const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function authHeaders() {
  const token = localStorage.getItem('access_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function request(path, options = {}) {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...options.headers,
    },
    ...options,
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || response.statusText)
  }
  return response.json()
}

export async function login(email, password) {
  const form = new URLSearchParams()
  form.append('username', email)
  form.append('password', password)

  const response = await fetch(`${BACKEND_URL}/auth/login`, {
    method: 'POST',
    body: form,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || response.statusText)
  }
  const data = await response.json()
  localStorage.setItem('access_token', data.access_token)
  return data
}

export async function register(payload) {
  const response = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return response
}

export async function getCurrentUser() {
  try {
    return await request('/users/me')
  } catch {
    localStorage.removeItem('access_token')
    return null
  }
}

export async function fetchBooks({ q, author, isbn, available, page, page_size }) {
  const params = new URLSearchParams()
  if (q) params.append('q', q)
  if (author) params.append('author', author)
  if (isbn) params.append('isbn', isbn)
  if (available !== undefined && available !== null) params.append('available', available)
  if (page) params.append('page', page)
  if (page_size) params.append('page_size', page_size)
  return await request(`/books?${params.toString()}`)
}

export async function getBook(id) {
  return await request(`/books/${id}`)
}

export async function createBook(payload) {
  return await request('/books', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateBook(id, payload) {
  return await request(`/books/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deleteBook(id) {
  return await request(`/books/${id}`, {
    method: 'DELETE',
  })
}

export function logout() {
  localStorage.removeItem('access_token')
}
