import { useState, useEffect } from 'react'

interface LayoutProps {
  left: React.ReactNode
  center: React.ReactNode
  right: React.ReactNode
}

export default function Layout({ left, center, right }: LayoutProps) {
  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <span className="font-semibold text-lg">EssayEval</span>
        <div className="flex gap-2">
          <button
            onClick={() => setLeftOpen(o => !o)}
            className="text-sm px-2 py-1 rounded border border-gray-300 dark:border-gray-600"
          >
            {leftOpen ? '← Hide' : '→ Panel'}
          </button>
          <button
            onClick={() => setRightOpen(o => !o)}
            className="text-sm px-2 py-1 rounded border border-gray-300 dark:border-gray-600"
          >
            {rightOpen ? 'Hide →' : 'Panel ←'}
          </button>
          <button
            onClick={() => setDark(d => !d)}
            className="text-sm px-2 py-1 rounded border border-gray-300 dark:border-gray-600"
          >
            {dark ? '☀️' : '🌑'}
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
        <div className={`overflow-hidden border-r border-gray-200 dark:border-gray-700 ${leftOpen ? '' : 'invisible'}`}>
          {left}
        </div>

        {/* Centre panel */}
        <div className="overflow-auto p-4">
          {center}
        </div>

        {/* Right panel */}
        <div className={`overflow-hidden border-l border-gray-200 dark:border-gray-700 ${rightOpen ? '' : 'invisible'}`}>
          {right}
        </div>
      </div>
    </div>
  )
}