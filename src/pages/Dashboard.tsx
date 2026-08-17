import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getBalances, groupBalancesByCurrency, calculateTotalByCurrency } from '../services/balanceService'
import { getProfile } from '../services/profileService'
import { supabase } from '../lib/supabase'
import { Wallet } from 'lucide-react'
import ErrorState from '../components/ErrorState'

interface Balance {
  id: string
  balance_type: string
  currency: string
  amount: number
}

interface Profile {
  full_name: string
  avatar_url: string | null
}

declare global {
  interface Window {
    TradingView: any
  }
}

export default function Dashboard() {
  const { user } = useAuth()
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [balances, setBalances] = useState<Balance[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [tradingStatus, setTradingStatus] = useState('inactive')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return

    loadData()
    
    // Cleanup function to prevent memory leaks
    return () => {
      // Cancel any pending requests if needed
    }
  }, [user?.id]) // Only re-run when user.id changes, not entire user object

  useEffect(() => {
    if (!user) return

    // Lazy load TradingView script only when needed
    const loadTradingViewScript = () => {
      // Check if script already loaded
      if (window.TradingView) {
        initChart()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://s3.tradingview.com/tv.js'
      script.async = true
      script.defer = true
      script.onload = () => {
        if (user) {
          initChart()
        }
      }
      script.onerror = () => {
        console.error('Failed to load TradingView script')
      }
      document.head.appendChild(script)
    }

    // Delay chart loading slightly to prioritize page render
    const timeoutId = setTimeout(loadTradingViewScript, 100)

    return () => {
      clearTimeout(timeoutId)
      // Don't remove script on cleanup to avoid re-downloading
      // const scriptElement = document.querySelector('script[src="https://s3.tradingview.com/tv.js"]')
      // if (scriptElement) {
      //   document.head.removeChild(scriptElement)
      // }
    }
  }, [user?.id]) // Only depend on user.id, not entire user object

  const initChart = () => {
    if (!chartContainerRef.current || !window.TradingView) return
    if (!user) return

    chartContainerRef.current.innerHTML = ''

    try {
      new window.TradingView.widget({
        container_id: 'tradingview_chart_dashboard',
        autosize: true,
        symbol: 'BINANCE:BTCUSDT',
        interval: '5',
        timezone: 'Etc/UTC',
        theme: 'dark',
        style: '1',
        locale: 'en',
        toolbar_bg: '#1F2937',
        enable_publishing: false,
        withdateranges: true,
        range: '12M',
        hide_top_toolbar: false,
        hide_legend: false,
        hide_side_toolbar: false,
        save_image: true,
        backgroundColor: '#000000',
        allow_symbol_change: true,
        details: true,
        hotlist: true,
        calendar: true,
        studies: ['MASimple@tv-basicstudies'],
        show_popup_button: true,
        popup_width: '1000',
        popup_height: '650',
        client_id: 'tradingview_' + user.id,
        user_id: user.id,
        loading_screen: { backgroundColor: '#000000', foregroundColor: '#10B981' },
        enabled_features: [
          'study_templates',
          'side_toolbar_in_fullscreen_mode',
          'header_widget',
          'header_symbol_search',
          'header_resolutions',
          'header_interval_dialog_button',
          'show_interval_dialog_on_key_press',
          'header_chart_type',
          'header_compare',
          'left_toolbar',
          'control_bar',
          'drawing_templates',
          'use_localstorage_for_settings',
          'save_chart_properties_to_local_storage',
          'header_saveload',
          'header_screenshot',
          'header_fullscreen_button',
          'header_indicators',
          'header_settings',
          'header_undo_redo',
          'compare_symbol',
          'display_market_status',
        ],
        disabled_features: [
          'widget_logo',
        ],
        overrides: {
          'paneProperties.background': '#000000',
          'paneProperties.backgroundType': 'solid',
          'scalesProperties.textColor': '#9CA3AF',
          'mainSeriesProperties.candleStyle.upColor': '#10B981',
          'mainSeriesProperties.candleStyle.downColor': '#EF4444',
          'mainSeriesProperties.candleStyle.borderUpColor': '#10B981',
          'mainSeriesProperties.candleStyle.borderDownColor': '#EF4444',
          'mainSeriesProperties.candleStyle.wickUpColor': '#10B981',
          'mainSeriesProperties.candleStyle.wickDownColor': '#EF4444',
        },
      })
    } catch (error) {
      console.error('TradingView widget error:', error)
    }
  }

  const loadData = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError('')

      const [balancesData, profileData, tradingData] = await Promise.all([
        getBalances(user.id),
        getProfile(user.id),
        supabase
          .from('trading_access')
          .select('status')
          .eq('user_id', user.id)
          .single(),
      ])

      setBalances(balancesData)
      setProfile(profileData)
      
      const tradingResult = tradingData as any
      setTradingStatus(tradingResult.data?.status || 'inactive')
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (error) return <ErrorState message={error} />

  const groupedBalances = groupBalancesByCurrency(balances)
  const totalsByCurrency = calculateTotalByCurrency(balances)
  const isActive = tradingStatus === 'active'

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-6 bg-black">
      <div className="max-w-7xl mx-auto">
        
        {/* User Profile & Balance Card - Unified with Elegant Glow */}
        <div className="bg-black/95 backdrop-blur-sm rounded-lg border-2 border-cyan-500/50 shadow-[0_0_35px_rgba(6,182,212,0.4)] p-4 sm:p-6 mb-6 hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] hover:border-cyan-400/70 transition-all duration-300">
          <div className="flex items-start justify-between gap-3 sm:gap-6">
            {/* User Info - Left */}
            <div className="flex flex-col items-start gap-2 sm:gap-3">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-cyan-400/40 transition-all duration-300">
                {loading ? (
                  <div className="w-full h-full bg-cyan-900/50 animate-pulse"></div>
                ) : profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-cyan-600 to-teal-700">
                    <svg className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="text-left min-w-0">
                <p className="text-cyan-300 text-xs sm:text-sm font-medium">Name :</p>
                {loading ? (
                  <div className="h-5 sm:h-7 w-20 sm:w-32 md:w-40 bg-gray-700/50 rounded animate-pulse"></div>
                ) : (
                  <p className="text-white text-sm sm:text-xl md:text-2xl font-bold leading-tight">
                    {profile?.full_name || 'User'}
                  </p>
                )}
              </div>
            </div>

            {/* Balance Badge - Right */}
            <div className="bg-gradient-to-br from-emerald-500/90 to-teal-500/90 backdrop-blur-sm px-3 py-3 sm:px-5 sm:py-5 md:px-6 md:py-6 rounded-xl sm:rounded-2xl flex-shrink-0 border-2 border-emerald-400/40 transition-all duration-300">
              <div className="flex flex-col items-center justify-center gap-2 sm:gap-3">
                <Wallet className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 text-white flex-shrink-0" strokeWidth={2} />
                <div className="text-center min-w-0">
                  <p className="text-white text-xs sm:text-base font-semibold uppercase tracking-wider">BALANCE</p>
                  {loading ? (
                    <div className="h-5 sm:h-7 w-16 sm:w-24 bg-white/20 rounded animate-pulse mx-auto"></div>
                  ) : (
                    <div className="space-y-0.5">
                      {Object.entries(totalsByCurrency).map(([currency, total]) => (
                        <p key={currency} className="text-white text-xs sm:text-base font-bold leading-tight">
                          {currency} {total.toFixed(0)}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Balance 1, Balance 2 & Trading Status - Side by Side */}
        <div className="flex flex-row gap-8 sm:gap-12 mb-6 items-stretch">
          {/* Left Column - Balance 1 & 2 Stacked */}
          <div className="flex-1 space-y-3 flex flex-col">
            {/* Balance 1 - no inner glow */}
            <div className="bg-black/95 backdrop-blur-sm border-2 border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.4)] rounded-lg px-4 py-2 h-[70px] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:border-cyan-400/70 transition-all duration-300">
              <p className="text-cyan-300 text-xs sm:text-sm font-medium mb-1">Balance 1</p>
              {loading ? (
                <div className="h-6 w-24 bg-gray-700/50 rounded animate-pulse"></div>
              ) : (
                <div className="space-y-1">
                  {groupedBalances['balance_1'] ? (
                    Object.entries(groupedBalances['balance_1']).map(([currency, amount]) => (
                      <p key={currency} className="text-white text-base sm:text-xl font-bold">
                        {currency} {amount.toFixed(0)}
                      </p>
                    ))
                  ) : (
                    <p className="text-white text-base sm:text-xl font-bold">USDT 0</p>
                  )}
                </div>
              )}
            </div>

            {/* Balance 2 - no inner glow */}
            <div className="bg-black/95 backdrop-blur-sm border-2 border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.4)] rounded-lg px-4 py-2 h-[70px] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:border-cyan-400/70 transition-all duration-300">
              <p className="text-cyan-300 text-xs sm:text-sm font-medium mb-1">Balance 2</p>
              {loading ? (
                <div className="h-6 w-24 bg-gray-700/50 rounded animate-pulse"></div>
              ) : (
                <div className="space-y-1">
                  {groupedBalances['balance_2'] ? (
                    Object.entries(groupedBalances['balance_2']).map(([currency, amount]) => (
                      <p key={currency} className="text-white text-base sm:text-xl font-bold">
                        {currency} {amount.toFixed(0)}
                      </p>
                    ))
                  ) : (
                    <p className="text-white text-base sm:text-xl font-bold">USDT...</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Trading Status with Elegant Glow */}
          <div className={`flex-1 border-2 rounded-lg px-4 flex flex-col items-center justify-center backdrop-blur-sm transition-all duration-300 ${
            isActive 
              ? 'border-emerald-400/70 bg-black/95 shadow-[0_0_35px_rgba(16,185,129,0.5)] hover:shadow-[0_0_50px_rgba(16,185,129,0.7)]' 
              : 'border-white/70 bg-black/95 shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:shadow-[0_0_35px_rgba(255,255,255,0.4)]'
          }`}>
            {loading ? (
              <>
                <div className="h-6 w-24 bg-gray-700/50 rounded animate-pulse mb-3"></div>
                <div className="h-8 w-32 bg-gray-700/50 rounded animate-pulse"></div>
              </>
            ) : (
              <>
                <p className={`text-base sm:text-xl font-semibold mb-2 ${
                  isActive ? 'text-emerald-400' : 'text-white'
                }`}>
                  {isActive ? 'Active' : 'Inactive'}
                </p>
                <p className={`text-xl sm:text-3xl font-bold uppercase ${
                  isActive ? 'text-emerald-400' : 'text-white'
                }`}>
                  TRADING
                </p>
              </>
            )}
          </div>
        </div>

        {/* TradingView Advanced Chart with Title Inside */}
        <div className="bg-black/95 backdrop-blur-sm rounded-lg border-2 border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_45px_rgba(6,182,212,0.5)] hover:border-cyan-400/60 transition-all duration-300 overflow-hidden">
          {/* Title Bar Inside Chart Container */}
          <div className="bg-gradient-to-r from-emerald-900/40 via-green-900/40 to-emerald-900/40 backdrop-blur-sm border-b border-emerald-500/30 px-4 sm:px-6 py-3 sm:py-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center">
              <span className="text-white">Trade Smarter.</span>
              <span className="text-emerald-400 ml-2">Move Faster.</span>
            </h2>
          </div>
          
          <div className="h-[500px] sm:h-[600px] md:h-[700px] bg-black">
            <div 
              id="tradingview_chart_dashboard" 
              ref={chartContainerRef} 
              className="w-full h-full"
            />
          </div>
          
          {/* Info badge with TradingView link */}
          <div className="bg-gradient-to-r from-gray-900/95 to-teal-900/40 backdrop-blur-sm px-4 py-3 border-t border-cyan-500/30 flex items-center justify-between flex-wrap gap-3">
            <p className="text-cyan-300 text-xs font-medium">
              📈 Interactive TradingView chart with full features
            </p>
            <a
              href="https://www.tradingview.com/chart/?symbol=BINANCE:BTCUSDT"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs sm:text-sm font-medium px-4 py-2 rounded-lg transition-all hover:scale-105 shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)]"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h12v2H6V6zm0 4h12v2H6v-2zm0 4h12v2H6v-2z"/>
              </svg>
              <span>Full TradingView</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
