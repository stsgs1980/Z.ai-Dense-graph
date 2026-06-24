import React from 'react'
import { motion } from 'framer-motion'
import { Home, ChevronRight, X } from 'lucide-react'
import { ROLE_CONFIG } from './types'

function BreadcrumbItems({ activeFilter, zoom, cfg, onResetView, onClearFilter }: {
  activeFilter: string | null; zoom: number; cfg: typeof ROLE_CONFIG[string] | null
  onResetView: () => void; onClearFilter: () => void
}) {
  const hasZoom = zoom < 0.95 || zoom > 1.05
  return (
    <>
      <button onClick={onResetView} className="flex items-center gap-1 text-[10px] text-[#B0B0B0] hover:text-white transition-colors">
        <Home className="w-3 h-3" /><span>All</span>
      </button>
      {(activeFilter || hasZoom) && <ChevronRight className="w-3 h-3 text-[#555]" />}
      {hasZoom && <span className="text-[10px] text-[#06B6D4] font-medium">{Math.round(zoom * 100)}%</span>}
      {activeFilter && cfg && (
        <>
          {hasZoom && <ChevronRight className="w-3 h-3 text-[#555]" />}
          <span className="text-[10px] font-medium flex items-center gap-1" style={{ color: cfg.color }}>
            {React.createElement(cfg.icon, { size: 10, color: cfg.color })}{cfg.label}
          </span>
          <button onClick={onClearFilter} className="ml-1 text-[#555] hover:text-white transition-colors"><X className="w-3 h-3" /></button>
        </>
      )}
    </>
  )
}

export function BreadcrumbTrail({ activeFilter, onClearFilter, zoom, onResetView }: {
  activeFilter: string | null; onClearFilter: () => void; zoom: number; onResetView: () => void
}) {
  if (!activeFilter && zoom >= 0.95 && zoom <= 1.05) return null
  const cfg = activeFilter ? ROLE_CONFIG[activeFilter] : null

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
      style={{ background: 'rgba(26, 26, 26, 0.92)', backdropFilter: 'blur(16px)', border: '1px solid rgba(51,51,51,0.5)' }}>
      <BreadcrumbItems activeFilter={activeFilter} zoom={zoom} cfg={cfg} onResetView={onResetView} onClearFilter={onClearFilter} />
    </motion.div>
  )
}