import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute, RoleGuard } from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import BookCatalog from './pages/BookCatalog'
import BookDetail from './pages/BookDetail'
import BookForm from './pages/BookForm'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/books"
            element={
              <ProtectedRoute>
                <BookCatalog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/books/new"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['librarian']}>
                  <BookForm />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/books/:id"
            element={
              <ProtectedRoute>
                <BookDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/books/:id/edit"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['librarian']}>
                  <BookForm />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
