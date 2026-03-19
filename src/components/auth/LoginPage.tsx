import { GoogleLogin } from '@react-oauth/google'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'

export function LoginPage() {
  const { login } = useAuth()

  return (
    <div className="flex h-screen items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-8">
        {/* Logo / title */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-100 tracking-tight">
            Apollinare Catering
          </h1>
          <p className="mt-1 text-sm text-slate-400">Pannello di gestione email</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 px-10 py-8 flex flex-col items-center gap-6 w-80">
          <div className="text-center">
            <p className="text-sm text-slate-300">Accedi con il tuo account Google</p>
            <p className="mt-1 text-xs text-slate-500">Solo gli account autorizzati possono accedere</p>
          </div>

          <GoogleLogin
            onSuccess={({ credential }) => {
              if (!credential) return
              const ok = login(credential)
              if (!ok) {
                toast.error('Account non autorizzato')
              }
            }}
            onError={() => toast.error('Accesso fallito, riprova')}
            theme="filled_black"
            shape="rectangular"
            text="signin_with"
          />
        </div>
      </div>
    </div>
  )
}
