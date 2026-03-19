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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      retry: 1,
    },
  },
})

function AppRoutes() {
  const { user } = useAuth()

  if (!user) return <LoginPage />

  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center text-slate-400 text-sm">
          Loading…
        </div>
      }
    >
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/emails" replace />} />
          <Route path="chatbot" element={<ChatbotPage />} />
          <Route path="emails" element={<PendingEmailsPage />} />
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
