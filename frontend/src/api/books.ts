import { apiClient } from './client'
import type {
  Book,
  BookCreate,
  BookListResponse,
  BookUpdate,
} from '../types/book'

export interface BookFilters {
  q?: string
  author?: string
  isbn?: string
  available?: boolean
  page?: number
  page_size?: number
}

export async function fetchBooks(
  filters: BookFilters = {},
): Promise<BookListResponse> {
  const params: Record<string, string | number | boolean> = {}
  if (filters.q) params.q = filters.q
  if (filters.author) params.author = filters.author
  if (filters.isbn) params.isbn = filters.isbn
  if (filters.available !== undefined) params.available = filters.available
  params.page = filters.page ?? 1
  params.page_size = filters.page_size ?? 20

  const { data } = await apiClient.get<BookListResponse>('/books', { params })
  return data
}

export async function getBook(id: string): Promise<Book> {
  const { data } = await apiClient.get<Book>(`/books/${id}`)
  return data
}

export async function createBook(payload: BookCreate): Promise<Book> {
  const { data } = await apiClient.post<Book>('/books', payload)
  return data
}

export async function updateBook(
  id: string,
  payload: BookUpdate,
): Promise<Book> {
  const { data } = await apiClient.put<Book>(`/books/${id}`, payload)
  return data
}

export async function deleteBook(id: string): Promise<void> {
  await apiClient.delete(`/books/${id}`)
}
