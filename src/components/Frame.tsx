import { Link } from '@tanstack/react-router'

export function Frame() {
  return (
    <>
      {/* Top decorative bar */}
      <div className="fixed top-0 left-0 right-0 h-2 bg-pink-200 z-50" />
      
      {/* Right decorative bar */}
      <div className="fixed top-0 bottom-0 right-0 w-2 bg-pink-200 z-50" />
      
      {/* Bottom decorative bar */}
      <div className="fixed bottom-0 left-0 right-0 h-2 bg-pink-200 z-50" />
      
      {/* Left decorative bar */}
      <div className="fixed top-0 left-0 bottom-0 w-2 bg-pink-200 z-50" />
      
      {/* Top-left sky accent */}
      <div className="fixed top-0 left-0 w-40 h-4 bg-sky-200 z-50" />
      
      {/* Top-left yellow notes link */}
      <div className="fixed top-0 left-0 w-20 h-6 bg-yellow-300 z-50 group cursor-pointer flex items-center justify-center transition-transform">
        <Link
          to="/notes"
          className="invisible group-hover:visible text-xs text-yellow-700"
        >
          notes
        </Link>
      </div>
    </>
  )
}
