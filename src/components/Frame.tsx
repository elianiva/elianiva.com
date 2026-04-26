import { Link } from '@tanstack/react-router'

export function Frame() {
  return (
    <>
      {/* Top decorative bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-pink-200 z-50" />
      
      {/* Left decorative bar */}
      <div className="fixed top-0 bottom-0 left-0 w-1 bg-pink-200 z-50" />
      
      {/* Top-left sky accent */}
      <div className="fixed top-0 left-0 w-16 h-1 bg-sky-200 z-50" />
      
      {/* Top-left yellow notes link */}
      <Link
        to="/notes"
        className="fixed top-2 left-2 z-50 text-xs font-mono text-yellow-700 bg-yellow-300 px-2 py-0.5 rounded-sm hover:bg-yellow-400 transition-colors"
      >
        notes
      </Link>
    </>
  )
}
