import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { LoginPage } from '@/components/auth/LoginPage'
import { Layout } from '@/components/layout/Layout'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const ChatbotPage = lazy(() =>
  import('@/components/chatbot/ChatbotPage').then((m) => ({ default: m.ChatbotPage })),
)
const PendingEmailsPage = lazy(() =>
  import('@/components/pending_emails/PendingEmailsPage').then((m) => ({
    default: m.PendingEmailsPage,
  })),
)
const GestionalePage = lazy(() =>
  import('@/components/gestionale/GestionalePage').then((m) => ({
    default: m.GestionalePage,
  })),
)
const EventoDetailPage = lazy(() =>
  import('@/components/gestionale/EventoDetailPage').then((m) => ({
    default: m.EventoDetailPage,
  })),
)
const LocationiPage = lazy(() =>
  import('@/components/gestionale/LocationiPage').then((m) => ({
    default: m.LocationiPage,
  })),
)
const ListaCaricaPage = lazy(() =>
  import('@/components/gestionale/ListaCaricaPage').then((m) => ({
    default: m.ListaCaricaPage,
  })),
)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      retry: 1,
    },
  },
})

const Fallback = () => (
  <div className="flex h-screen items-center justify-center text-slate-400 text-sm">
    Loading…
  </div>
)

function AppRoutes() {
  const { user } = useAuth()

  if (!user) return <LoginPage />

  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/gestionale" replace />} />
          <Route path="chatbot" element={<ChatbotPage />} />
          <Route path="emails" element={<PendingEmailsPage />} />
          {/* Gestionale — SF-001+ */}
          <Route path="gestionale" element={<GestionalePage />} />
          <Route path="gestionale/eventi/:id" element={<EventoDetailPage />} />
          <Route path="gestionale/location" element={<LocationiPage />} />
          <Route path="gestionale/eventi/:id/lista-carico" element={<ListaCaricaPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: '#1e293b',
                  color: '#f1f5f9',
                  fontSize: '0.875rem',
                },
              }}
            />
          </AuthProvider>
        </QueryClientProvider>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  )
}
