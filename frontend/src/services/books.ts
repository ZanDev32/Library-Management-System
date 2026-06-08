import { request } from './auth'

export interface Book {
  id: number
  title: string
  author: string
  isbn?: string
  published_year?: number
  available: boolean
}

export function fetchBooks() {
  return request('/books') as Promise<Book[]>
}

export function fetchBook(id: number) {
  return request(`/books/${id}`) as Promise<Book>
}

export function createBook(book: Partial<Book>) {
  return request('/books', { method: 'POST', body: JSON.stringify(book) })
}

export function updateBook(id: number, book: Partial<Book>) {
  return request(`/books/${id}`, { method: 'PUT', body: JSON.stringify(book) })
}

export function deleteBook(id: number) {
  return request(`/books/${id}`, { method: 'DELETE' })
}
