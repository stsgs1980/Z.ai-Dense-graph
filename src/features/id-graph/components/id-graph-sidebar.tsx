'use client'

/**
 * id-graph-sidebar.tsx — expandable tree of IDs by repo
 */

import { useMemo, useState } from 'react'
import type { IdNodeDTO, IdCategory, IdRepo } from '../lib/types'

interface Props {
  nodes: IdNodeDTO[]
  selectedId: string | null
  onSelect: (id: string) => void
}

const REPO_LABELS: Record<IdRepo, string> = {
  standards: 'standards/ (19 STD)',
  guard: 'guard/ (17 RULE + 4 PROC + 6 TOOL)',
  'zai-skills': 'zai-skills/ (25 ZAI)',
}

const CATEGORY_COLORS: Record<string, string> = {
  STD: '#06B6D4',
  RULE: '#A855F7',
  PROC: '#EC4899',
  TOOL: '#F59E0B',
  ZAI: '#10B981',
}

export function IdGraphSidebar({ nodes, selectedId, onSelect }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    standards: true,
    guard: false,
    'zai-skills': false,
  })
  const [filter, setFilter] = useState('')

  const grouped = useMemo(() => {
    const g: Record<string, IdNodeDTO[]> = {}
    nodes.forEach((n) => {
      if (!g[n.repo]) g[n.repo] = []
      g[n.repo].push(n)
    })
    // Sort by ID within each group
    for (const k of Object.keys(g)) {
      g[k].sort((a, b) => a.id.localeCompare(b.id))
    }
    return g
  }, [nodes])

  const filtered = useMemo(() => {
    if (!filter) return grouped
    const f = filter.toLowerCase()
    const result: Record<string, IdNodeDTO[]> = {}
    for (const [repo, items] of Object.entries(grouped)) {
      result[repo] = items.filter(
        (n) =>
          n.id.toLowerCase().includes(f) ||
          n.title.toLowerCase().includes(f)
      )
    }
    return result
  }, [grouped, filter])

  return (
    <div className="w-60 bg-slate-950 border-r border-slate-800 flex flex-col h-full">
      <div className="p-3 border-b border-slate-800">
        <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Brain Center
        </h2>
        <p className="text-[10px] text-slate-500 mt-1">
          61 IDs / 114 edges / 3 modules
        </p>
      </div>

      <div className="p-2 border-b border-slate-800">
        <input
          type="text"
          placeholder="Filter IDs..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {Object.entries(filtered).map(([repo, items]) => {
          if (items.length === 0) return null
          const isExp = expanded[repo] ?? false
          return (
            <div key={repo} className="border-b border-slate-900">
              <button
                onClick={() => setExpanded({ ...expanded, [repo]: !isExp })}
                className="w-full text-left px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-900 flex items-center justify-between"
              >
                <span>{REPO_LABELS[repo as IdRepo] || repo}</span>
                <span className="text-slate-500">{items.length}</span>
              </button>
              {isExp && (
                <ul className="pb-1">
                  {items.map((n) => {
                    const isSel = n.id === selectedId
                    return (
                      <li key={n.id}>
                        <button
                          onClick={() => onSelect(n.id)}
                          className={`w-full text-left px-3 py-1 text-[11px] flex items-center gap-2 hover:bg-slate-900 ${
                            isSel ? 'bg-cyan-950 text-cyan-300' : 'text-slate-400'
                          }`}
                          style={{ borderLeft: isSel ? '2px solid #06B6D4' : '2px solid transparent' }}
                        >
                          <span
                            className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: CATEGORY_COLORS[n.category] || '#475569' }}
                          />
                          <span className="font-mono truncate">{n.id}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export type { IdCategory }
