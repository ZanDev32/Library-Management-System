import { apiClient } from './client'
import type { BorrowRecord } from '../types/borrow'

export interface BorrowRequestPayload {
  book_id: string
}

export interface BorrowBatchAction {
  request_id: string
  action: 'approve' | 'reject'
  reason?: string
}

export interface BorrowListResponse {
  items: BorrowRecord[]
  total: number
  page: number
  page_size: number
}

export interface ReturnResponse {
  message: string
  days_late: number
}

export async function requestBorrow(payload: BorrowRequestPayload): Promise<BorrowRecord> {
  const { data } = await apiClient.post<BorrowRecord>('/borrows/request', payload)
  return data
}

export async function getMyBorrows(
  status?: string,
  page = 1,
  pageSize = 20,
): Promise<BorrowListResponse> {
  const params: Record<string, string | number> = { page, page_size: pageSize }
  if (status) params.borrow_status = status
  const { data } = await apiClient.get<BorrowListResponse>('/borrows/my', { params })
  return data
}

export async function getAllBorrows(
  status?: string,
  page = 1,
  pageSize = 20,
): Promise<BorrowListResponse> {
  const params: Record<string, string | number> = { page, page_size: pageSize }
  if (status) params.borrow_status = status
  const { data } = await apiClient.get<BorrowListResponse>('/borrows', { params })
  return data
}

export async function processBorrowRequests(
  actions: BorrowBatchAction[],
): Promise<{ results: Array<{ request_id: string; status: string; action?: string; message?: string }> }> {
  const { data } = await apiClient.post('/borrows/process', { actions })
  return data
}

export async function scanReturn(loanId: string): Promise<ReturnResponse> {
  const { data } = await apiClient.post<ReturnResponse>('/borrows/return', { loan_id: loanId })
  return data
}
