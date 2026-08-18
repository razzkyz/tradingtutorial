export default function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800/50 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-gray-400 text-sm">
              © 2024 Trading Tutorials. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <a 
              href="#" 
              className="text-gray-400 hover:text-cyan-400 text-sm transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              Terms of Service
            </a>
            <a 
              href="#" 
              className="text-gray-400 hover:text-cyan-400 text-sm transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              Privacy Policy
            </a>
            <a 
              href="#" 
              className="text-gray-400 hover:text-cyan-400 text-sm transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
