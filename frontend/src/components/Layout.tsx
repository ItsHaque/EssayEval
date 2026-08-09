import { useState } from 'react'

interface LayoutProps {
  left: React.ReactNode
  center: React.ReactNode
  right: React.ReactNode
}

export default function Layout({ left, center, right }: LayoutProps) {
  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f7eae0', color: '#1d4533' }}>
      {/* Top bar */}
      <header style={{ backgroundColor: '#1d4533' }} className="flex items-center justify-between px-4 py-3">
        <span className="font-bold text-lg tracking-wide" style={{ color: '#f7eae0' }}>EssayEval</span>
        <div className="flex gap-2">
          <button
            onClick={() => setLeftOpen(o => !o)}
            className = "text-sm px-3 py-1 rounded font-medium hover:opacity-90" style={{ backgroundColor: '#f9d2ba', color: '#1d4533' }}
          >
            {leftOpen ? '← Hide' : '→ Panel'}
          </button>
          <button
            onClick={() => setRightOpen(o => !o)}
            className = "text-sm px-3 py-1 rounded font-medium hover:opacity-90" style={{ backgroundColor: '#f9d2ba', color: '#1d4533' }}
          >
            {rightOpen ? 'Hide →' : 'Panel ←'}
          </button>
        </div>
      </header>

      {/* Three-panel grid */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: `${leftOpen ? '240px' : '0'} 1fr ${rightOpen ? '360px' : '0'}`,
          transition: 'grid-template-columns 0.2s ease',
        }}
      >
        {/* Left panel */}
        <div className={`overflow-hidden ${leftOpen ? '' : 'invisible'}`} style={{ borderRight: '1px solid #f9d2ba' }}>
          {left}
        </div>

        {/* Centre panel */}
        <div className="overflow-auto p-4">
          {center}
        </div>

        {/* Right panel */}
        <div className={`overflow-hidden ${rightOpen ? '' : 'invisible'}`} style={{ borderLeft: '1px solid #f9d2ba' }}>
          {right}
        </div>
      </div>
    </div>
  )
}