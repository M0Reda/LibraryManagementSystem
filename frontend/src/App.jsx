import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import BooksPage from './pages/BooksPage'
import BookDetailPage from './pages/BookDetailPage'
import AuthorsPage from './pages/AuthorsPage'
import MembersPage from './pages/MembersPage'
import BorrowingsPage from './pages/BorrowingsPage'

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ flex: 1 }}>{children}</main>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected — with Navbar */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout><HomePage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/books"
          element={
            <ProtectedRoute>
              <Layout><BooksPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/books/:id"
          element={
            <ProtectedRoute>
              <Layout><BookDetailPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/authors"
          element={
            <ProtectedRoute>
              <Layout><AuthorsPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/members"
          element={
            <ProtectedRoute>
              <Layout><MembersPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/borrowings"
          element={
            <ProtectedRoute>
              <Layout><BorrowingsPage /></Layout>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
