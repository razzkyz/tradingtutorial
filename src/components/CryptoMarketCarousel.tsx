import { useRef, useState, useEffect } from 'react'
import { ChevronUp } from 'lucide-react'
import CryptoMarketCard from './CryptoMarketCard'
import MarketTable from './MarketTable'

interface CryptoData {
  symbol: string
  name: string
  pair: string
  price: string
  change: number
  iconBg: string
  iconText: string
  iconUrl?: string
}

interface MarketAsset {
  symbol: string
  name: string
  price: string
  changePercent: number
  change: number
  high?: string
  low?: string
  technicalRating?: string
  icon?: string
  iconBg?: string
  iconText?: string
}

interface CryptoMarketCarouselProps {
  title?: string
  cryptos: CryptoData[]
  onCoinClick?: (symbol: string) => void
  onSeeAll?: () => void
  allAssets?: MarketAsset[]
  isExpanded?: boolean
  onToggleExpand?: () => void
}

export default function CryptoMarketCarousel({ 
  title = "Ringkasan Pasar",
  cryptos, 
  onCoinClick,
  allAssets = [],
  isExpanded: externalExpanded,
  onToggleExpand
}: CryptoMarketCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const autoScrollInterval = useRef<ReturnType<typeof setInterval> | null>(null)
  
  // Use external expand state if provided, otherwise use internal
  const isExpanded = externalExpanded !== undefined ? externalExpanded : false
  const toggleExpanded = onToggleExpand || (() => {})

  const checkScrollButtons = () => {
    // kept for scroll event listener but state removed
    const _container = scrollContainerRef.current
    if (!_container) return
  }


  const handleCardClick = (symbol: string) => {
    // Call original onClick handler
    onCoinClick?.(symbol)
    
    // Auto-scroll to next card on desktop
    if (window.innerWidth >= 768) {
      const container = scrollContainerRef.current
      if (!container) return
      
      // Scroll to show next 3-4 cards
      const cardWidth = 220 + 16 // card width + gap
      const scrollAmount = cardWidth * 2
      
      container.scrollTo({
        left: container.scrollLeft + scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  const startAutoScroll = () => {
    if (autoScrollInterval.current || isExpanded) return

    autoScrollInterval.current = setInterval(() => {
      const container = scrollContainerRef.current
      if (!container || isHovered) return

      if (container.scrollLeft >= container.scrollWidth - container.clientWidth - 1) {
        container.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        const scrollAmount = 240
        container.scrollTo({
          left: container.scrollLeft + scrollAmount,
          behavior: 'smooth'
        })
      }
    }, 3000)
  }

  const stopAutoScroll = () => {
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current)
      autoScrollInterval.current = null
    }
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    // Force check on mount and when data changes
    const forceCheck = () => {
      requestAnimationFrame(() => {
        checkScrollButtons()
      })
    }

    // Initial check
    forceCheck()
    
    // Check after a delay (DOM might not be ready)
    const timer = setTimeout(forceCheck, 100)

    container.addEventListener('scroll', checkScrollButtons)
    window.addEventListener('resize', checkScrollButtons)
    
    if (!isExpanded) {
      startAutoScroll()
    }

    return () => {
      clearTimeout(timer)
      container.removeEventListener('scroll', checkScrollButtons)
      window.removeEventListener('resize', checkScrollButtons)
      stopAutoScroll()
    }
  }, [isExpanded, cryptos.length])

  useEffect(() => {
    if (isHovered) {
      stopAutoScroll()
    } else if (!isExpanded) {
      startAutoScroll()
    }

    return () => stopAutoScroll()
  }, [isHovered, isExpanded])

  // Convert cryptos to MarketAsset format for table
  const tableAssets: MarketAsset[] = allAssets.length > 0 
    ? allAssets 
    : cryptos.map(crypto => ({
        symbol: crypto.symbol,
        name: crypto.name,
        price: crypto.price === '--' ? '0' : crypto.price,
        changePercent: crypto.change,
        change: parseFloat(crypto.price === '--' ? '0' : crypto.price) * crypto.change / 100,
        icon: crypto.iconUrl,
        iconBg: crypto.iconBg,
        iconText: crypto.iconText,
        technicalRating: crypto.change > 1 ? 'Pembelian' : crypto.change < -1 ? 'Penjualan' : 'Netral'
      }))

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-3">
          <h3 className="text-white font-bold text-xl">{title}</h3>
        </div>
        
        <div className="flex items-center gap-3">
          {/* See All / Close Button */}
          <button 
            className="text-cyan-400 hover:text-cyan-300 text-sm font-medium flex items-center gap-1 transition-colors whitespace-nowrap"
            onClick={toggleExpanded}
          >
            {isExpanded ? (
              <>
                Tutup
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Lihat Semua
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Carousel or Table */}
      {isExpanded ? (
        /* Full Market Table */
        <div className="bg-black border border-gray-800 rounded-2xl overflow-hidden">
          <MarketTable 
            assets={tableAssets} 
            type={title.includes('Crypto') ? 'crypto' : 'us'} 
          />
        </div>
      ) : (
        /* Carousel Container - Swipe/Drag Only */
        <div 
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-2 cursor-grab active:cursor-grabbing"
          style={{
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(6, 182, 212, 0.5) transparent'
          }}
        >
          {cryptos.map((crypto) => (
            <div
              key={crypto.symbol}
              style={{ scrollSnapAlign: 'start' }}
            >
              <CryptoMarketCard
                {...crypto}
                onClick={() => handleCardClick(crypto.symbol)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
