import { AlertTriangle, LogOut } from 'lucide-react'

interface LogoutModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function LogoutModal({ isOpen, onConfirm, onCancel }: LogoutModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-gray-950 backdrop-blur-sm rounded-2xl border border-gray-800 shadow-[0_0_60px_rgba(0,0,0,0.8)] max-w-md w-full animate-scale-in">
        {/* Icon Header */}
        <div className="flex justify-center pt-8 pb-4">
          <div className="bg-red-500/15 p-5 rounded-full border-2 border-red-500/40">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">
            Confirm Logout
          </h3>
          <p className="text-gray-400 mb-8">
            Are you sure you want to logout from your account?
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3.5 rounded-xl bg-transparent border-2 border-gray-600 hover:border-gray-400 text-white font-semibold transition-all hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all shadow-lg shadow-red-900/50 flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Yes, Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
