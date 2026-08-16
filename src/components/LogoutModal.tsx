import { AlertTriangle } from 'lucide-react'

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
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative card-premium max-w-md w-full animate-scale-in">
        {/* Icon Header */}
        <div className="flex justify-center pt-8 pb-4">
          <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 p-4 rounded-full border-2 border-red-500/30">
            <AlertTriangle className="w-12 h-12 text-red-400" />
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-6 text-center">
          <h3 className="text-2xl font-bold text-text-primary mb-3">
            Confirm Logout
          </h3>
          <p className="text-text-secondary mb-6">
            Are you sure you want to logout from your account?
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3 rounded-xl bg-dark-teal/40 hover:bg-dark-teal/60 text-text-primary font-medium border border-text-muted/20 hover:border-cyan/30 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-red-500/50 transition-all"
            >
              Yes, Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
