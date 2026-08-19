export default function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800/50 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 Strategic CRYPTO Investment 
          </p>
          <button
            type="button"
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 border border-cyan-500/50 rounded-lg text-white text-sm font-mono font-semibold shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-default"
            onClick={(e) => e.preventDefault()}
          >
           Dashboard System ID: 8875124079
          </button>
        </div>
      </div>
    </footer>
  )
}
