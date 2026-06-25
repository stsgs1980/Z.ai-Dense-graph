'use client'

/**
 * id-graph-detail.tsx — right-side detail panel for selected ID
 *
 * Shows:
 *   - ID metadata (category, repo, version, level, status)
 *   - Owning standard
 *   - In/out edges (clickable)
 *   - BFS path search form
 */

import { useEffect, useState } from 'react'
import type { IdNodeDTO } from '../lib/types'

interface DetailData {
  node: {
    id: string
    title: string
    category: string
    repo: string
    version: string
    status: string
    level: string | null
    filePath: string | null
    owningStandard: string | null
    description: string
  }
  neighbors: {
    out: Array<{
      id: string
      title: string
      category: string
      repo: string
      edgeType: string
      direction: 'out'
    }>
    in: Array<{
      id: string
      title: string
      category: string
      repo: string
      edgeType: string
      direction: 'in'
    }>
    totalOut: number
    totalIn: number
  }
}

interface Props {
  selectedId: string | null
  allNodes: IdNodeDTO[]
  onSelect: (id: string) => void
  onPathFound: (path: string[]) => void
}

export function IdGraphDetailPanel({
  selectedId,
  allNodes,
  onSelect,
  onPathFound,
}: Props) {
  const [detail, setDetail] = useState<DetailData | null>(null)
  const [loading, setLoading] = useState(false)
  const [targetId, setTargetId] = useState('')
  const [pathResult, setPathResult] = useState<{
    path: string[]
    found: boolean
    hops: number
  } | null>(null)

  useEffect(() => {
    if (!selectedId) {
      setDetail(null)
      setPathResult(null)
      return
    }

    setLoading(true)
    fetch(`/api/id-graph/${encodeURIComponent(selectedId)}`)
      .then((r) => r.json())
      .then((d: DetailData) => {
        setDetail(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [selectedId])

  async function searchPath() {
    if (!selectedId || !targetId) return
    const r = await fetch(
      `/api/id-graph/search?from=${encodeURIComponent(selectedId)}&to=${encodeURIComponent(targetId)}`
    )
    const data = await r.json()
    setPathResult(data)
    if (data.found) {
      onPathFound(data.path)
    }
  }

  if (!selectedId) {
    return (
      <div className="w-80 bg-slate-950 border-l border-slate-800 p-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          ID Detail
        </h3>
        <p className="text-xs text-slate-600">
          Select an ID from the canvas or sidebar to see details.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="w-80 bg-slate-950 border-l border-slate-800 p-4">
        <p className="text-xs text-slate-500">Loading {selectedId}...</p>
      </div>
    )
  }

  if (!detail) return null

  const { node, neighbors } = detail

  return (
    <div className="w-80 bg-slate-950 border-l border-slate-800 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-mono text-cyan-400 break-all">{node.id}</h3>
          <button
            onClick={() => onSelect('')}
            className="text-slate-500 hover:text-slate-300 text-xs"
          >
            ✕
          </button>
        </div>
        <p className="text-sm text-slate-200 mt-1">{node.title}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Tag label={`cat: ${node.category}`} color="cyan" />
          <Tag label={`repo: ${node.repo}`} color="purple" />
          <Tag label={`v${node.version}`} color="slate" />
          {node.level && <Tag label={`level: ${node.level}`} color="red" />}
          <Tag label={node.status} color={node.status === 'ACTIVE' ? 'green' : 'amber'} />
        </div>
        {node.owningStandard && (
          <p className="text-[10px] text-slate-500 mt-2">
            Owning standard: <span className="font-mono">{node.owningStandard}</span>
          </p>
        )}
        {node.filePath && (
          <p className="text-[10px] text-slate-500 mt-1 font-mono truncate">
            📄 {node.filePath}
          </p>
        )}
      </div>

      {/* BFS search */}
      <div className="p-4 border-b border-slate-800">
        <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          BFS Path Search
        </h4>
        <div className="flex gap-1">
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">Select target...</option>
            {allNodes
              .filter((n) => n.id !== selectedId)
              .map((n) => (
                <option key={n.id} value={n.id}>
                  {n.id} — {n.title}
                </option>
              ))}
          </select>
          <button
            onClick={searchPath}
            disabled={!targetId}
            className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-xs px-3 py-1 rounded font-medium"
          >
            Go
          </button>
        </div>
        {pathResult && (
          <div className="mt-2 text-xs">
            {pathResult.found ? (
              <div>
                <p className="text-green-400">
                  Found: {pathResult.hops} hops, {pathResult.path.length} nodes
                </p>
                <ol className="mt-1 space-y-0.5">
                  {pathResult.path.map((id, i) => (
                    <li key={i} className="text-slate-300 font-mono text-[10px]">
                      <span className="text-slate-500">{i + 1}.</span>{' '}
                      <button
                        onClick={() => onSelect(id)}
                        className="text-cyan-400 hover:underline"
                      >
                        {id}
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
            ) : (
              <p className="text-red-400">No path found between these IDs.</p>
            )}
          </div>
        )}
      </div>

      {/* Edges */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 border-b border-slate-800">
          <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Out-edges ({neighbors.totalOut})
          </h4>
          {neighbors.out.length === 0 ? (
            <p className="text-[11px] text-slate-600">None</p>
          ) : (
            <ul className="space-y-1">
              {neighbors.out.map((nb, i) => (
                <li key={i}>
                  <button
                    onClick={() => onSelect(nb.id)}
                    className="w-full text-left hover:bg-slate-900 rounded px-1 py-0.5"
                  >
                    <div className="text-[11px] font-mono text-cyan-400">{nb.id}</div>
                    <div className="text-[10px] text-slate-500 truncate">{nb.title}</div>
                    <div className="text-[9px] text-slate-600">
                      [{nb.edgeType}] {nb.category} / {nb.repo}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4">
          <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            In-edges ({neighbors.totalIn})
          </h4>
          {neighbors.in.length === 0 ? (
            <p className="text-[11px] text-slate-600">None</p>
          ) : (
            <ul className="space-y-1">
              {neighbors.in.map((nb, i) => (
                <li key={i}>
                  <button
                    onClick={() => onSelect(nb.id)}
                    className="w-full text-left hover:bg-slate-900 rounded px-1 py-0.5"
                  >
                    <div className="text-[11px] font-mono text-cyan-400">{nb.id}</div>
                    <div className="text-[10px] text-slate-500 truncate">{nb.title}</div>
                    <div className="text-[9px] text-slate-600">
                      [{nb.edgeType}] {nb.category} / {nb.repo}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function Tag({
  label,
  color,
}: {
  label: string
  color: 'cyan' | 'purple' | 'slate' | 'red' | 'green' | 'amber'
}) {
  const colors = {
    cyan: 'bg-cyan-950 text-cyan-400 border-cyan-800',
    purple: 'bg-purple-950 text-purple-400 border-purple-800',
    slate: 'bg-slate-800 text-slate-400 border-slate-700',
    red: 'bg-red-950 text-red-400 border-red-800',
    green: 'bg-emerald-950 text-emerald-400 border-emerald-800',
    amber: 'bg-amber-950 text-amber-400 border-amber-800',
  }
  return (
    <span
      className={`inline-block px-1.5 py-0.5 rounded text-[10px] border ${colors[color]}`}
    >
      {label}
    </span>
  )
}
