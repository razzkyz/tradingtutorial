import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Home, User, Globe, Briefcase, Wallet, LogOut, TrendingUp, Menu, X, Users, UserPlus, Settings } from 'lucide-react'
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
  }, [user])

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
    setIsMenuOpen(false) // Close sidebar when opening modal
  }

  const handleLogoutConfirm = async () => {
    await supabase.auth.signOut()
    setShowLogoutModal(false)
    navigate('/login')
  }

  const handleLogoutCancel = () => {
    setShowLogoutModal(false)
  }

  const menuItems = isAdmin
    ? [
        { label: 'Admin Dashboard', path: '/admin/dashboard', icon: Home },
        { label: 'Manage Customers', path: '/admin/customers', icon: Users },
        { label: 'Add Customer', path: '/admin/add-customer', icon: UserPlus },
        { label: 'Settings', path: '/admin/settings', icon: Settings },
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
      <header className="bg-gradient-to-r from-teal-900 to-teal-800 border-b border-teal-700/50 shadow-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo - Icon + Text "TRADING TUTORIALS" (Horizontal) */}
            <Link to={isAdmin ? "/admin/dashboard" : "/dashboard"} className="flex items-center gap-2 sm:gap-3 hover:opacity-90 transition-opacity">
              {/* Logo Icon (Bullish Market) */}
              <img 
                src="/images/logo.png" 
                alt="Trading Tutorials" 
                className="h-10 sm:h-12 md:h-14 w-auto object-contain"
                onError={(e) => {
                  // Fallback to icon + text if image not found
                  e.currentTarget.style.display = 'none'
                  const fallback = document.getElementById('logo-fallback')
                  if (fallback) {
                    fallback.style.display = 'flex'
                  }
                }}
              />
              {/* Text "TRADING TUTORIALS" - Show on all screen sizes */}
              <div className="flex flex-col leading-tight">
                <span className="text-sm sm:text-lg md:text-xl font-bold text-white tracking-wider uppercase">Trading</span>
                <span className="text-sm sm:text-lg md:text-xl font-bold text-white tracking-wider uppercase -mt-0.5 sm:-mt-1">Tutorials</span>
              </div>
              {/* Fallback: Icon + Text (hidden by default) */}
              <div className="hidden items-center gap-3" id="logo-fallback" style={{ display: 'none' }}>
                <div className="bg-gradient-to-br from-teal-600 to-cyan-600 p-2 rounded-full shadow-lg">
                  <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-xl font-bold text-white tracking-wider uppercase">Trading</span>
                  <span className="text-xl font-bold text-white tracking-wider uppercase -mt-1">Tutorials</span>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                      isActive(item.path)
                        ? 'bg-teal-700 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-teal-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
              <button
                onClick={handleLogoutClick}
                className="ml-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-red-900/40 transition-all flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </nav>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-teal-800/50 transition-colors"
              aria-label="Menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar - Navbar tetap visible */}
      <div
        className={`lg:hidden fixed top-16 right-0 bottom-0 w-72 bg-gradient-to-b from-gray-900 via-teal-950 to-gray-900 border-l border-teal-800/40 shadow-2xl z-40 transform transition-transform duration-300 ease-out ${
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
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-800/60 border border-transparent hover:border-teal-700/50'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              )
            })}

            <div className="pt-4 mt-4 border-t border-teal-800/40">
              <button
                onClick={handleLogoutClick}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-300 bg-red-900/20 hover:bg-red-900/30 transition-colors border border-red-700/40 font-medium"
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
          style={{ top: '64px' }} // Start below navbar
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
