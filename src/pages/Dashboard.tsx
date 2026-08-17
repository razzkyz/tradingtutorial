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
  }, [user])

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/tv.js'
    script.async = true
    script.onload = () => initChart()
    document.head.appendChild(script)

    return () => {
      const scriptElement = document.querySelector('script[src="https://s3.tradingview.com/tv.js"]')
      if (scriptElement) {
        document.head.removeChild(scriptElement)
      }
    }
  }, [])

  const initChart = () => {
    if (!chartContainerRef.current || !window.TradingView) return

    chartContainerRef.current.innerHTML = ''

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
      hide_top_toolbar: false,
      hide_legend: false,
      hide_side_toolbar: false,
      save_image: false,
      backgroundColor: '#000000',
      gridColor: '#1F2937',
      allow_symbol_change: true,
      details: true,
      hotlist: true,
      calendar: false,
      studies: ['MASimple@tv-basicstudies'],
      show_popup_button: true,
      popup_width: '1000',
      popup_height: '650',
      enabled_features: [
        'study_templates',
        'side_toolbar_in_fullscreen_mode',
        'header_chart_type',
        'header_compare',
        'timeframes_toolbar',
        'create_volume_indicator_by_default',
        'left_toolbar',
        'control_bar',
        'main_series_scale_menu',
        'drawing_templates',
        'show_chart_property_page',
      ],
      disabled_features: [],
      overrides: {
        'paneProperties.background': '#000000',
        'paneProperties.backgroundType': 'solid',
        'paneProperties.gridProperties.color': '#1F2937',
        'scalesProperties.textColor': '#9CA3AF',
        'mainSeriesProperties.candleStyle.upColor': '#10B981',
        'mainSeriesProperties.candleStyle.downColor': '#EF4444',
        'mainSeriesProperties.candleStyle.borderUpColor': '#10B981',
        'mainSeriesProperties.candleStyle.borderDownColor': '#EF4444',
        'mainSeriesProperties.candleStyle.wickUpColor': '#10B981',
        'mainSeriesProperties.candleStyle.wickDownColor': '#EF4444',
      },
    })
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
    <div className="min-h-[calc(100vh-64px)] px-4 py-6">
      <div className="max-w-7xl mx-auto">
        
        {/* User Profile & Balance Card - Unified */}
        <div className="bg-gradient-to-br from-gray-900 to-teal-900 backdrop-blur-sm rounded-3xl border border-teal-700/40 shadow-2xl p-6 mb-6">
          <div className="flex items-center justify-between gap-6">
            {/* User Info - Left */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center overflow-hidden shadow-xl flex-shrink-0">
                {loading ? (
                  <div className="w-full h-full bg-text-muted/20 animate-pulse"></div>
                ) : profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl sm:text-4xl">👤</span>
                )}
              </div>
              <div>
                <p className="text-gray-400 text-xs sm:text-sm mb-1">Name :</p>
                {loading ? (
                  <div className="h-7 w-32 sm:w-40 bg-gray-700/50 rounded animate-pulse"></div>
                ) : (
                  <p className="text-white text-xl sm:text-2xl font-bold leading-tight">
                    {profile?.full_name || 'User'}
                  </p>
                )}
              </div>
            </div>

            {/* Balance Badge - Right - Single unified display */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 px-6 py-5 sm:px-8 sm:py-6 rounded-2xl shadow-xl flex-shrink-0">
              <div className="flex items-center gap-3">
                <Wallet className="w-12 h-12 sm:w-14 sm:h-14 text-white" strokeWidth={2} />
                <div>
                  <p className="text-white text-xs sm:text-sm font-semibold uppercase tracking-wider mb-2">BALANCE</p>
                  {loading ? (
                    <div className="h-7 w-28 bg-white/20 rounded animate-pulse"></div>
                  ) : (
                    <div>
                      {Object.entries(totalsByCurrency).map(([currency, total]) => (
                        <p key={currency} className="text-white text-xl sm:text-2xl font-bold leading-tight">
                          {currency} {total.toFixed(2)}
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
        <div className="flex flex-row gap-8 sm:gap-12 mb-6">
          {/* Left Column - Balance 1 & 2 Stacked */}
          <div className="flex-1 space-y-3">
            {/* Balance 1 */}
            <div className="bg-transparent border-2 border-teal-700/60 rounded-lg px-4 py-2 h-[70px]">
              <p className="text-gray-300 text-xs sm:text-sm font-medium mb-1">Balance 1</p>
              {loading ? (
                <div className="h-6 w-24 bg-gray-700/50 rounded animate-pulse"></div>
              ) : (
                <div className="space-y-1">
                  {groupedBalances['balance_1'] ? (
                    Object.entries(groupedBalances['balance_1']).map(([currency, amount]) => (
                      <p key={currency} className="text-white text-base sm:text-xl font-bold">
                        {currency} {amount.toFixed(2)}
                      </p>
                    ))
                  ) : (
                    <p className="text-white text-base sm:text-xl font-bold">USDT 0.00</p>
                  )}
                </div>
              )}
            </div>

            {/* Balance 2 */}
            <div className="bg-transparent border-2 border-teal-700/60 rounded-lg px-4 py-2 h-[70px]">
              <p className="text-gray-300 text-xs sm:text-sm font-medium mb-1">Balance 2</p>
              {loading ? (
                <div className="h-6 w-24 bg-gray-700/50 rounded animate-pulse"></div>
              ) : (
                <div className="space-y-1">
                  {groupedBalances['balance_2'] ? (
                    Object.entries(groupedBalances['balance_2']).map(([currency, amount]) => (
                      <p key={currency} className="text-white text-base sm:text-xl font-bold">
                        {currency} {amount.toFixed(2)}
                      </p>
                    ))
                  ) : (
                    <p className="text-white text-base sm:text-xl font-bold">USDT...</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Trading Status (same height as Balance 1 & 2 combined) */}
          <div className={`flex-1 border-2 rounded-lg px-4 flex flex-col items-center justify-center min-h-[155px] ${
            isActive 
              ? 'border-emerald-500 bg-emerald-500/10' 
              : 'border-white bg-transparent'
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

        {/* TradingView Chart - Clean Full Widget */}
        <div className="bg-black rounded-lg border border-gray-700 shadow-2xl overflow-hidden">
          <div className="h-[500px] sm:h-[600px] md:h-[700px] bg-black">
            <div 
              id="tradingview_chart_dashboard" 
              ref={chartContainerRef} 
              className="w-full h-full"
            />
          </div>
        </div>

      </div>
    </div>
  )
}
