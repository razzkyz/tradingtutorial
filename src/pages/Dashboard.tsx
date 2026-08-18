import { useEffect, useState, useRef, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getBalances, groupBalancesByCurrency, calculateTotalByCurrency } from '../services/balanceService'
import { getProfile } from '../services/profileService'
import { supabase } from '../lib/supabase'
import { Wallet } from 'lucide-react'
import ErrorState from '../components/ErrorState'
import BinanceTrading from '../components/BinanceTrading'

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
  const [hasApiKeys, setHasApiKeys] = useState(false)
  const [showTradePanel, setShowTradePanel] = useState(false)
  
  // Draggable state - use refs for better performance
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [panelPosition, setPanelPosition] = useState({ x: 16, y: 16 })
  const [buttonPosition, setButtonPosition] = useState({ x: 16, y: 16 })
  const isDraggingRef = useRef(false)
  const isDraggingButtonRef = useRef(false)
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const buttonDragOffsetRef = useRef({ x: 0, y: 0 })

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

      const [balancesData, profileData, tradingData, apiKeysData] = await Promise.all([
        getBalances(user.id),
        getProfile(user.id),
        supabase
          .from('trading_access')
          .select('status')
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('user_binance_keys')
          .select('api_key')
          .eq('user_id', user.id)
          .single(),
      ])

      setBalances(balancesData)
      setProfile(profileData)
      
      const tradingResult = tradingData as any
      setTradingStatus(tradingResult.data?.status || 'inactive')

      const apiKeysResult = apiKeysData as any
      setHasApiKeys(!!apiKeysResult.data?.api_key)
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

  // Drag handlers for panel - optimized with useCallback
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDraggingRef.current = true
    dragOffsetRef.current = {
      x: e.clientX - panelPosition.x,
      y: e.clientY - panelPosition.y
    }
  }, [panelPosition])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    isDraggingRef.current = true
    dragOffsetRef.current = {
      x: touch.clientX - panelPosition.x,
      y: touch.clientY - panelPosition.y
    }
  }, [panelPosition])

  // Drag handlers for button - optimized with useCallback
  const handleButtonMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    isDraggingButtonRef.current = true
    buttonDragOffsetRef.current = {
      x: e.clientX - buttonPosition.x,
      y: e.clientY - buttonPosition.y
    }
  }, [buttonPosition])

  const handleButtonTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation()
    const touch = e.touches[0]
    isDraggingButtonRef.current = true
    buttonDragOffsetRef.current = {
      x: touch.clientX - buttonPosition.x,
      y: touch.clientY - buttonPosition.y
    }
  }, [buttonPosition])

  // Add/remove event listeners for dragging - optimized
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      let clientX: number, clientY: number
      
      if (e instanceof MouseEvent) {
        clientX = e.clientX
        clientY = e.clientY
      } else {
        clientX = e.touches[0].clientX
        clientY = e.touches[0].clientY
      }
      
      // Handle panel dragging using refs for better performance
      if (isDraggingRef.current && panelRef.current) {
        const newX = clientX - dragOffsetRef.current.x
        const newY = clientY - dragOffsetRef.current.y
        
        const maxX = window.innerWidth - 220
        const maxY = window.innerHeight - 300
        
        const boundedX = Math.max(0, Math.min(newX, maxX))
        const boundedY = Math.max(0, Math.min(newY, maxY))
        
        // Direct DOM manipulation for smooth performance
        panelRef.current.style.transform = `translate(${boundedX}px, ${boundedY}px)`
      }
      
      // Handle button dragging using refs
      if (isDraggingButtonRef.current && buttonRef.current) {
        const newX = clientX - buttonDragOffsetRef.current.x
        const newY = clientY - buttonDragOffsetRef.current.y
        
        const maxX = window.innerWidth - 100
        const maxY = window.innerHeight - 50
        
        const boundedX = Math.max(0, Math.min(newX, maxX))
        const boundedY = Math.max(0, Math.min(newY, maxY))
        
        // Direct DOM manipulation
        buttonRef.current.style.transform = `translate(${boundedX}px, ${boundedY}px)`
      }
    }

    const handleEnd = () => {
      // Save final positions to state when drag ends
      if (isDraggingRef.current && panelRef.current) {
        const transform = panelRef.current.style.transform
        const match = transform.match(/translate\((\d+)px, (\d+)px\)/)
        if (match) {
          setPanelPosition({ x: parseInt(match[1]), y: parseInt(match[2]) })
        }
      }
      
      if (isDraggingButtonRef.current && buttonRef.current) {
        const transform = buttonRef.current.style.transform
        const match = transform.match(/translate\((\d+)px, (\d+)px\)/)
        if (match) {
          setButtonPosition({ x: parseInt(match[1]), y: parseInt(match[2]) })
        }
      }
      
      isDraggingRef.current = false
      isDraggingButtonRef.current = false
    }

    window.addEventListener('mousemove', handleMove, { passive: true })
    window.addEventListener('mouseup', handleEnd)
    window.addEventListener('touchmove', handleMove, { passive: true })
    window.addEventListener('touchend', handleEnd)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleEnd)
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('touchend', handleEnd)
    }
  }, [])

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-6 bg-black">
      <div className="max-w-7xl mx-auto">
        
        {/* User Profile & Balance Card - Unified with Elegant Glow */}
        <div className="bg-black/95 backdrop-blur-sm rounded-lg border-2 border-cyan-500/50 shadow-[0_0_35px_rgba(6,182,212,0.4)] p-4 sm:p-6 mb-6 hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] hover:border-cyan-400/70 transition-all duration-300">
          <div className="flex items-end justify-between gap-3 sm:gap-6">
            {/* User Info - Left */}
            <div className="flex flex-col items-start gap-2 sm:gap-3">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-cyan-400/40 transition-all duration-300">
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
                    <svg className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="text-left min-w-0">
                <p className="text-cyan-300 text-xs sm:text-sm font-medium mb-1 font-inter">Name :</p>
                {loading ? (
                  <div className="h-5 sm:h-7 w-20 sm:w-32 md:w-40 bg-gray-700/50 rounded animate-pulse"></div>
                ) : (
                  <p className="text-white text-sm sm:text-xl md:text-2xl font-bold leading-tight font-manrope">
                    {profile?.full_name || 'User'}
                  </p>
                )}
              </div>
            </div>

            {/* Balance Badge - Right */}
            <div className="bg-gradient-to-br from-emerald-500/90 to-teal-500/90 backdrop-blur-sm px-8 py-4 sm:px-12 sm:py-5 md:px-16 md:py-6 rounded-xl sm:rounded-2xl flex-shrink-0 border-2 border-emerald-400/40 transition-all duration-300">
              <div className="flex flex-col items-center justify-center gap-2 sm:gap-3">
                <Wallet className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-white flex-shrink-0" strokeWidth={2} />
                <div className="text-center min-w-0 mt-4">
                  <p className="text-white text-xs sm:text-base font-semibold uppercase tracking-wider mb-1">BALANCE</p>
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

        {/* TradingView Chart with Integrated Trading Panel */}
        <div className="bg-black/95 backdrop-blur-sm rounded-lg border-2 border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_45px_rgba(6,182,212,0.5)] hover:border-cyan-400/60 transition-all duration-300 overflow-hidden mb-6">
          {/* Title Bar with Running Text */}
          <div className="bg-gradient-to-r from-emerald-900/40 via-green-900/40 to-emerald-900/40 backdrop-blur-sm border-b border-emerald-500/30 py-3 sm:py-4 overflow-hidden">
            <div className="whitespace-nowrap animate-marquee">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-light inline-block italic font-roboto">
                <span className="text-white">Trade Smarter.</span>
                <span className="text-emerald-400 ml-2 mr-12">Move Faster.</span>
                <span className="text-white">Trade Smarter.</span>
                <span className="text-emerald-400 ml-2 mr-12">Move Faster.</span>
                <span className="text-white">Trade Smarter.</span>
                <span className="text-emerald-400 ml-2 mr-12">Move Faster.</span>
                <span className="text-white">Trade Smarter.</span>
                <span className="text-emerald-400 ml-2 mr-12">Move Faster.</span>
              </h2>
            </div>
          </div>
          
          {/* Chart Container with Trading Panel Overlay */}
          <div className="relative h-[500px] sm:h-[600px] md:h-[700px] bg-black">
            {/* TradingView Chart */}
            <div 
              id="tradingview_chart_dashboard" 
              ref={chartContainerRef} 
              className="w-full h-full"
            />
            
            {/* Toggle Trade Panel Button - Draggable */}
            {hasApiKeys && (
              <button
                ref={buttonRef}
                className="absolute z-20 bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg shadow-[0_0_20px_rgba(234,179,8,0.6)] transition-colors text-sm sm:text-base select-none touch-none"
                style={{ 
                  left: 0,
                  top: 0,
                  transform: `translate(${buttonPosition.x}px, ${buttonPosition.y}px)`,
                  cursor: 'grab',
                  willChange: 'transform'
                }}
                onMouseDown={handleButtonMouseDown}
                onTouchStart={handleButtonTouchStart}
                onClick={() => {
                  if (!isDraggingButtonRef.current) {
                    setShowTradePanel(!showTradePanel)
                  }
                }}
                title={showTradePanel ? 'Hide Trading Panel' : 'Show Trading Panel'}
              >
                Trade
              </button>
            )}

            {/* Quick Trade Panel Overlay - Draggable */}
            {hasApiKeys && showTradePanel && (
              <div 
                ref={panelRef}
                className="absolute z-10 w-[180px] sm:w-[220px] touch-none"
                style={{ 
                  left: 0,
                  top: 0,
                  transform: `translate(${panelPosition.x}px, ${panelPosition.y}px)`,
                  willChange: 'transform'
                }}
              >
                <div className="bg-gradient-to-br from-gray-900/98 to-gray-800/98 backdrop-blur-xl border border-yellow-500/40 shadow-[0_0_40px_rgba(234,179,8,0.3)] rounded-lg overflow-hidden">
                  {/* Panel Header with Close Button - Draggable Handle */}
                  <div 
                    className="bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 px-3 py-2 border-b border-yellow-500/30 flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                  >
                    <h3 className="text-yellow-400 font-bold text-sm">Trade</h3>
                    <button
                      onClick={() => setShowTradePanel(false)}
                      className="text-gray-400 hover:text-white transition-colors"
                      title="Close"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Panel Content - Compact */}
                  <div className="p-3">
                    <BinanceTrading symbol="BTCUSDT" compact={true} />
                  </div>
                </div>
              </div>
            )}

            {/* No API Keys Warning - Only show if panel is toggled */}
            {!hasApiKeys && (
              <div className="absolute top-4 left-4 z-10 w-full max-w-[calc(100%-2rem)] sm:w-auto">
                <div className="bg-gradient-to-br from-red-900/95 to-gray-900/95 backdrop-blur-xl border border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.6)] rounded-lg p-3 sm:p-4 max-w-xs">
                  <h3 className="text-white font-bold text-sm mb-1.5">🔒 Trading Disabled</h3>
                  <p className="text-red-200 text-xs mb-2">
                    Setup API keys to enable live trading.
                  </p>
                  <a
                    href="/settings"
                    className="block w-full text-center bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-3 rounded text-xs transition-all"
                  >
                    Go to Settings →
                  </a>
                </div>
              </div>
            )}
          </div>
          
          {/* Info Footer */}
          <div className="bg-gradient-to-r from-gray-900/95 to-teal-900/40 backdrop-blur-sm px-4 py-3 border-t border-cyan-500/30 flex items-center justify-between flex-wrap gap-3">
            <p className="text-cyan-300 text-xs font-medium">
              📈 TradingView chart with integrated Binance trading
            </p>
            <div className="flex items-center gap-2">
              {hasApiKeys && (
                <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  Live Trading Enabled
                </span>
              )}
              <a
                href="https://www.tradingview.com/chart/?symbol=BINANCE:BTCUSDT"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-all hover:scale-105 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              >
                <span>Full Chart</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
