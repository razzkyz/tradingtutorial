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
      save_image: false,
      backgroundColor: '#000000',
      gridColor: '#1F2937',
      allow_symbol_change: true,
      studies: ['MASimple@tv-basicstudies', 'RSI@tv-basicstudies'],
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
      ],
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
        
        {/* User Profile Card */}
        <div className="bg-gradient-to-br from-gray-900 to-teal-900 backdrop-blur-sm rounded-3xl border border-teal-700/40 shadow-2xl p-6 mb-6">
          <div className="flex items-end justify-between gap-3">
            {/* User Info - Left */}
            <div className="flex flex-col items-start">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center overflow-hidden shadow-xl mb-3">
                {loading ? (
                  <div className="w-full h-full bg-text-muted/20 animate-pulse"></div>
                ) : profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl sm:text-3xl">👤</span>
                )}
              </div>
              <div>
                <p className="text-gray-400 text-xs sm:text-sm mb-1">Name :</p>
                {loading ? (
                  <div className="h-6 sm:h-7 w-24 sm:w-32 bg-gray-700/50 rounded animate-pulse"></div>
                ) : (
                  <p className="text-white text-base sm:text-xl font-bold leading-tight">
                    {profile?.full_name || 'User'}
                  </p>
                )}
              </div>
            </div>

            {/* Balance Badge - Right - Now showing all currencies */}
            <div className="bg-gradient-to-br from-teal-700 to-cyan-600 px-4 py-4 sm:px-5 sm:py-6 rounded-xl sm:rounded-2xl shadow-xl flex-shrink-0">
              <div className="flex items-start gap-2 sm:gap-3">
                <Wallet className="w-8 h-8 sm:w-9 sm:h-9 text-white" strokeWidth={2.5} />
                <div>
                  <p className="text-white text-[10px] sm:text-xs font-semibold uppercase tracking-wide leading-none mb-2">Total Balance</p>
                  {loading ? (
                    <div className="h-5 sm:h-6 w-20 sm:w-24 bg-white/20 rounded animate-pulse"></div>
                  ) : (
                    <div className="space-y-1">
                      {Object.entries(totalsByCurrency).map(([currency, total]) => (
                        <p key={currency} className="text-white text-sm sm:text-base font-bold leading-none">
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

        {/* Balance 1, 2 (Left) & Trading Status (Right) */}
        <div className="grid grid-cols-[1fr,auto] sm:grid-cols-[auto,auto,1fr] gap-4 mb-4 sm:justify-start">
          {/* Left Column - Balance 1 & 2 Stacked */}
          <div className="space-y-4">
            {/* Balance 1 */}
            <div>
              <label className="text-gray-300 text-sm font-medium mb-2 block">Balance 1</label>
              <div className="bg-transparent border-2 border-teal-700/60 rounded-2xl px-4 py-3.5 sm:min-w-[200px]">
                {loading ? (
                  <div className="h-6 w-20 bg-gray-700/50 rounded animate-pulse"></div>
                ) : (
                  <div className="space-y-1">
                    {groupedBalances['balance_1'] ? (
                      Object.entries(groupedBalances['balance_1']).map(([currency, amount]) => (
                        <p key={currency} className="text-white text-base font-bold">
                          {currency} {amount.toFixed(2)}
                        </p>
                      ))
                    ) : (
                      <p className="text-white text-base font-bold">No balance</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Balance 2 */}
            <div>
              <label className="text-gray-300 text-sm font-medium mb-2 block">Balance 2</label>
              <div className="bg-transparent border-2 border-teal-700/60 rounded-2xl px-4 py-3.5 sm:min-w-[200px]">
                {loading ? (
                  <div className="h-6 w-20 bg-gray-700/50 rounded animate-pulse"></div>
                ) : (
                  <div className="space-y-1">
                    {groupedBalances['balance_2'] ? (
                      Object.entries(groupedBalances['balance_2']).map(([currency, amount]) => (
                        <p key={currency} className="text-white text-base font-bold">
                          {currency} {amount.toFixed(2)}
                        </p>
                      ))
                    ) : (
                      <p className="text-white text-base font-bold">No balance</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Trading Status (compact on desktop, full height on mobile) */}
          <div className={`border-2 rounded-2xl px-4 py-6 flex flex-col items-center justify-center min-w-[140px] sm:min-w-[160px] self-stretch ${
            isActive 
              ? 'border-emerald-500 bg-emerald-500/10' 
              : 'border-teal-700/80 bg-transparent'
          }`}>
            {loading ? (
              <>
                <div className="h-5 w-20 bg-gray-700/50 rounded animate-pulse mb-3"></div>
                <div className="h-6 w-24 bg-gray-700/50 rounded animate-pulse"></div>
              </>
            ) : (
              <>
                <p className={`text-base font-semibold mb-2 ${
                  isActive ? 'text-emerald-400' : 'text-white'
                }`}>
                  {isActive ? 'Active' : 'Inactive'}
                </p>
                <p className={`text-lg font-bold uppercase leading-tight text-center ${
                  isActive ? 'text-emerald-400' : 'text-white'
                }`}>
                  TRADING
                </p>
              </>
            )}
          </div>
        </div>

        {/* Balance 3 & 4 - Grid Layout */}
        <div className="grid grid-cols-2 sm:grid-cols-[auto,auto] gap-4 mb-6 sm:justify-start">
          {/* Balance 3 */}
          <div>
            <label className="text-gray-300 text-sm font-medium mb-2 block">Balance 3</label>
            <div className="bg-transparent border-2 border-teal-700/60 rounded-2xl px-4 py-3.5 sm:min-w-[200px]">
              {loading ? (
                <div className="h-6 w-20 bg-gray-700/50 rounded animate-pulse"></div>
              ) : (
                <div className="space-y-1">
                  {groupedBalances['balance_3'] ? (
                    Object.entries(groupedBalances['balance_3']).map(([currency, amount]) => (
                      <p key={currency} className="text-white text-base font-bold">
                        {currency} {amount.toFixed(2)}
                      </p>
                    ))
                  ) : (
                    <p className="text-white text-base font-bold">No balance</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Balance 4 */}
          <div>
            <label className="text-gray-300 text-sm font-medium mb-2 block">Balance 4</label>
            <div className="bg-transparent border-2 border-teal-700/60 rounded-2xl px-4 py-3.5 sm:min-w-[200px]">
              {loading ? (
                <div className="h-6 w-20 bg-gray-700/50 rounded animate-pulse"></div>
              ) : (
                <div className="space-y-1">
                  {groupedBalances['balance_4'] ? (
                    Object.entries(groupedBalances['balance_4']).map(([currency, amount]) => (
                      <p key={currency} className="text-white text-base font-bold">
                        {currency} {amount.toFixed(2)}
                      </p>
                    ))
                  ) : (
                    <p className="text-white text-base font-bold">No balance</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TradingView Chart - Full Width */}
        <div className="bg-black rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-4 py-3 border-b border-gray-700">
            <h2 className="text-white text-base sm:text-lg font-bold">Market Chart - BTC/USDT</h2>
          </div>
          <div className="h-[400px] sm:h-[500px] md:h-[600px] bg-black">
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
