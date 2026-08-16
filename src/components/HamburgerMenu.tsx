import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface HamburgerMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function HamburgerMenu({ isOpen, onClose }: HamburgerMenuProps) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
    onClose()
  }

  if (!isOpen) return null

  const menuItems = [
    { label: 'My Profile', path: '/profile', icon: '👤' },
    { label: 'Market Global', path: '/market-global', icon: '🌍' },
    { label: 'Trading Access', path: '/trading-access', icon: '💼' },
    { label: 'Withdrawal', path: '/withdrawal', icon: '💰' },
  ]

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <div
        id="hamburger-menu"
        className="fixed top-16 right-0 w-80 max-w-[85vw] bg-gradient-to-br from-deep-navy to-dark-teal border-l border-text-muted/20 shadow-2xl z-50 animate-slide-in"
      >
        <nav className="p-6 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className="block px-4 py-3 rounded-lg text-text-primary hover:bg-teal/30 transition-all hover:translate-x-1 border border-transparent hover:border-cyan/30"
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          ))}

          <div className="pt-4 mt-4 border-t border-text-muted/30">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 rounded-lg text-text-primary bg-red-500/20 hover:bg-red-500/30 transition-colors border border-red-500/30"
            >
              <span className="mr-3">🚪</span>
              Logout
            </button>
          </div>
        </nav>
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  )
}
