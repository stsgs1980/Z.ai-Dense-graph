'use client'

/**
 * id-graph-view.tsx — main ID-graph view
 *
 * Combines: KPI strip + sidebar + canvas + detail panel
 * Loads /api/id-graph, manages selection state, exposes layout mode toggle.
 */

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import type { IdGraphData, LayoutMode } from '../lib/types'
import { IdGraphSidebar } from './id-graph-sidebar'
import { IdGraphDetailPanel } from './id-graph-detail'
import { IdGraphKpiStrip } from './id-graph-kpi-strip'

// React Flow needs to be client-side only
const IdGraphCanvas = dynamic(
  () => import('./id-graph-canvas').then((m) => m.IdGraphCanvas),
  { ssr: false, loading: () => <div className="flex-1 bg-slate-900" /> }
)

interface Props {
  onBack?: () => void
}

export function IdGraphView({ onBack }: Props) {
  const [data, setData] = useState<IdGraphData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('flat')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [pathHighlight, setPathHighlight] = useState<string[] | null>(null)

  useEffect(() => {
    fetch('/api/id-graph')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((d: IdGraphData) => {
        setData(d)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="h-screen w-full bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Loading ID-graph...
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="h-screen w-full bg-slate-950 flex items-center justify-center text-red-400 text-sm">
        Failed to load: {error || 'no data'}
      </div>
    )
  }

  return (
    <div className="h-screen w-full flex flex-col bg-slate-950 text-slate-100">
      {/* Top header */}
      <header className="h-14 bg-slate-950 border-b border-slate-800 flex items-center px-4 gap-4 flex-shrink-0">
        {onBack && (
          <button
            onClick={onBack}
            className="text-slate-400 hover:text-slate-200 text-xs"
          >
            ← Back
          </button>
        )}
        <h1 className="text-sm font-semibold text-slate-200">
          Z-ai Brain Center — ID Graph
        </h1>
        <div className="ml-auto flex items-center gap-1">
          <span className="text-[10px] text-slate-500 mr-2">Layout:</span>
          {(['flat', 'clustered', 'radial'] as LayoutMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setLayoutMode(m)}
              className={`px-2 py-1 text-[11px] rounded font-medium ${
                layoutMode === m
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {m === 'flat' ? '⊞ Flat' : m === 'clustered' ? '⌗ Clustered' : '◎ Radial'}
            </button>
          ))}
        </div>
      </header>

      {/* KPI strip */}
      <IdGraphKpiStrip
        snapshot={data.snapshot}
        topHubs={data.snapshot?.topHubs || []}
        isolated={data.snapshot?.isolated || []}
      />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <IdGraphSidebar
          nodes={data.nodes}
          selectedId={selectedId}
          onSelect={(id) => {
            setSelectedId(id || null)
            setPathHighlight(null)
          }}
        />

        <div className="flex-1 bg-slate-900 relative">
          <IdGraphCanvas
            data={data}
            layoutMode={layoutMode}
            selectedId={selectedId}
            onSelect={(id) => {
              setSelectedId(id)
              setPathHighlight(null)
            }}
            pathHighlight={pathHighlight}
          />
        </div>

        <IdGraphDetailPanel
          selectedId={selectedId}
          allNodes={data.nodes}
          onSelect={(id) => {
            setSelectedId(id || null)
          }}
          onPathFound={(path) => setPathHighlight(path)}
        />
      </div>
    </div>
  )
}
