export interface BorrowRecord {
  id: string
  user_id: string
  book_id: string
  status: 'pending' | 'approved' | 'rejected' | 'returned' | 'overdue'
  borrow_date: string | null
  due_date: string | null
  return_date: string | null
  created_at: string
  updated_at: string | null
}
