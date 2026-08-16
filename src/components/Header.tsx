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
      <header className="bg-gradient-to-r from-deep-navy to-dark-teal border-b border-text-muted/20 shadow-lg sticky top-0 z-30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo - Support for longer text */}
            <Link to={isAdmin ? "/admin/dashboard" : "/dashboard"} className="flex items-center hover:opacity-80 transition-opacity">
              {/* Custom Logo Image */}
              <img 
                src="/logo.png" 
                alt="Trading Tutorials Logo" 
                className="h-10 sm:h-12 w-auto max-w-[200px] sm:max-w-[280px] md:max-w-[320px] object-contain"
                onError={(e) => {
                  // Fallback to icon + text if image not found
                  e.currentTarget.style.display = 'none'
                  const fallback = document.getElementById('logo-fallback')
                  if (fallback) fallback.classList.remove('hidden')
                }}
              />
              {/* Fallback: Icon + Text (hidden by default) */}
              <div className="hidden items-center space-x-2 sm:space-x-3" id="logo-fallback">
                <div className="bg-button-gradient p-2 rounded-lg shadow-lg">
                  <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <h1 className="text-base sm:text-lg lg:text-xl font-bold text-text-primary">
                  TRADING<span className="text-cyan"> TUTORIALS</span>
                </h1>
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
                        ? 'bg-button-gradient text-white shadow-lg'
                        : 'text-text-secondary hover:text-text-primary hover:bg-dark-teal/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
              <button
                onClick={handleLogoutClick}
                className="ml-2 px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-red-500/20 transition-all flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </nav>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-dark-teal/50 transition-colors"
              aria-label="Menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-text-primary" />
              ) : (
                <Menu className="w-6 h-6 text-text-primary" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar - Navbar tetap visible */}
      <div
        className={`lg:hidden fixed top-16 right-0 bottom-0 w-72 bg-gradient-to-b from-deep-navy via-dark-teal to-deep-navy border-l border-cyan/20 shadow-2xl z-40 transform transition-transform duration-300 ease-out ${
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
                      ? 'bg-button-gradient text-white shadow-lg'
                      : 'text-text-primary hover:bg-card-gradient border border-transparent hover:border-cyan/30'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              )
            })}

            <div className="pt-4 mt-4 border-t border-text-muted/30">
              <button
                onClick={handleLogoutClick}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-text-primary bg-red-500/20 hover:bg-red-500/30 transition-colors border border-red-500/30 font-medium"
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
