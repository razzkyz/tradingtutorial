import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Home, User, Globe, Briefcase, Wallet, LogOut, TrendingUp, Menu, X, Users, UserPlus, ArrowDownToLine } from 'lucide-react'
import LogoutModal from './LogoutModal'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', user.id)
            .single() as any

          setIsAdmin(profile?.role === 'admin')
        } catch (error) {
          console.error('Error checking admin:', error)
          setIsAdmin(false)
        }
      } else {
        setIsAdmin(false)
      }
    }

    checkAdmin()
  }, [user?.id]) // Only depend on user.id

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
    setIsMenuOpen(false) // Close sidebar when opening modal
  }

  const handleLogoutConfirm = async () => {
    try {
      // Sign out from Supabase - this invalidates the session globally
      // All devices using this session will be logged out
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Logout error:', error)
      }
      
      // Close modal
      setShowLogoutModal(false)
      
      // Navigate to login - the auth state change will be detected by useAuth
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Logout failed:', error)
      setShowLogoutModal(false)
      navigate('/login', { replace: true })
    }
  }

  const handleLogoutCancel = () => {
    setShowLogoutModal(false)
  }

  const menuItems = isAdmin
    ? [
        { label: 'Admin Dashboard', path: '/admin/dashboard', icon: Home },
        { label: 'Manage Customers', path: '/admin/customers', icon: Users },
        { label: 'Add Customer', path: '/admin/add-customer', icon: UserPlus },
        { label: 'Withdrawals', path: '/admin/withdrawals', icon: ArrowDownToLine },
      ]
    : [
        { label: 'Dashboard', path: '/dashboard', icon: Home },
        { label: 'My Profile', path: '/profile', icon: User },
        { label: 'Market Global', path: '/market-global', icon: Globe },
        { label: 'Trading Access', path: '/trading-access', icon: Briefcase },
        { label: 'Withdrawal', path: '/withdrawal', icon: Wallet },
      ]

  const isActive = (path: string) => location.pathname === path

  return (
    <>
      <header className="bg-gradient-to-r from-black via-gray-900 to-black backdrop-blur-xl border-b-2 border-emerald-500/20 shadow-[0_4px_30px_rgba(16,185,129,0.2)] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 sm:h-22">
            {/* Logo - Single Image (banner.jpeg contains logo + text) */}
            <Link to={isAdmin ? "/admin/dashboard" : "/dashboard"} className="flex items-center hover:scale-105 transition-transform duration-300">
              <img 
                src="/images/fixs.png" 
                alt="Strategic Crypto Investment" 
                className="h-16 sm:h-18 md:h-20 lg:h-21 w-auto object-contain"
                loading="eager"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  const fallback = document.getElementById('logo-fallback')
                  if (fallback) {
                    fallback.style.display = 'flex'
                  }
                }}
              />
              {/* Fallback: Icon + Text (if header.png not found) */}
              <div className="hidden items-center gap-3" id="logo-fallback" style={{ display: 'none' }}>
                <div className="bg-gradient-to-br from-emerald-600 to-green-600 p-2.5 rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.6)]">
                  <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="flex flex-col leading-tight">
                  <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white tracking-wide">
                    Strategic <span className="uppercase">CRYPTO</span>
                  </div>
                  <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-emerald-400 tracking-wide uppercase -mt-1" style={{ color: '#10b981' }}>INVESTMENT</div>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center space-x-2 ${
                      isActive(item.path)
                        ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-105'
                        : 'text-gray-300 hover:text-white hover:bg-emerald-900/20 border border-transparent hover:border-emerald-500/30 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
              <button
                onClick={handleLogoutClick}
                className="ml-2 px-4 py-2 rounded-lg text-sm font-semibold text-red-300 hover:text-white hover:bg-red-900/30 border border-transparent hover:border-red-500/40 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all duration-300 flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </nav>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-emerald-900/20 border border-transparent hover:border-emerald-500/30 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all duration-300"
              aria-label="Menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-emerald-400" />
              ) : (
                <Menu className="w-6 h-6 text-emerald-400" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar - Navbar tetap visible */}
      <div
        className={`lg:hidden fixed top-20 right-0 bottom-0 w-72 bg-gradient-to-b from-black via-gray-900 to-black backdrop-blur-xl border-l-2 border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.3)] z-40 transform transition-transform duration-300 ease-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full overflow-y-auto custom-scrollbar">
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                      : 'text-gray-300 hover:text-white hover:bg-emerald-900/20 border border-transparent hover:border-emerald-500/30'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              )
            })}

            <div className="pt-4 mt-4 border-t border-emerald-500/20">
              <button
                onClick={handleLogoutClick}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-300 hover:text-white bg-red-900/20 hover:bg-red-900/30 transition-all duration-300 border border-red-700/40 hover:border-red-500/50 font-semibold hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Overlay - hanya blur konten, navbar tetap clear */}
      {isMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
          style={{ top: '80px' }} // Start below navbar
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
    </>
  )
}
