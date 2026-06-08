const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export async function request(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('lms_token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  if (token) headers.Authorization = `Bearer ${token}`
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (!response.ok) {
    throw new Error(await response.text())
  }
  return response.json()
}

export async function login(email: string, password: string) {
  const body = new URLSearchParams()
  body.set('username', email)
  body.set('password', password)
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!response.ok) throw new Error('Login failed')
  const data = await response.json()
  localStorage.setItem('lms_token', data.access_token)
  return data
}

export async function register(email: string, password: string) {
  return request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) })
}

export async function getCurrentUser() {
  return request('/auth/me')
}

export function logout() {
  localStorage.removeItem('lms_token')
}
