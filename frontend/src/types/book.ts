export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publisher: string | null;
  year: number | null;
  quantity: number;
  available_quantity: number;
  available: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface BookCreate {
  title: string;
  author: string;
  isbn: string;
  publisher?: string;
  year?: number;
  quantity?: number;
}

export interface BookUpdate {
  title?: string;
  author?: string;
  isbn?: string;
  publisher?: string;
  year?: number;
  quantity?: number;
}

export interface BookListResponse {
  items: Book[];
  total: number;
  page: number;
  page_size: number;
}
