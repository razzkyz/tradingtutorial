import { useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'warning'
  onClose: () => void
  duration?: number
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />
  }

  const styles = {
    success: 'bg-gradient-to-r from-emerald-900/95 to-green-900/95 border-emerald-500/50 text-emerald-100 shadow-[0_0_30px_rgba(16,185,129,0.6)]',
    error: 'bg-gradient-to-r from-red-900/95 to-rose-900/95 border-red-500/50 text-red-100 shadow-[0_0_30px_rgba(239,68,68,0.6)]',
    warning: 'bg-gradient-to-r from-yellow-900/95 to-orange-900/95 border-yellow-500/50 text-yellow-100 shadow-[0_0_30px_rgba(245,158,11,0.6)]'
  }

  return (
    <div className={`fixed top-20 right-4 z-[9999] max-w-md w-full animate-slide-in-right`}>
      <div className={`${styles[type]} backdrop-blur-sm border-2 rounded-lg px-4 py-3 flex items-center gap-3 transition-all duration-300`}>
        <div className="flex-shrink-0">
          {icons[type]}
        </div>
        <p className="flex-1 font-medium text-sm">
          {message}
        </p>
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
