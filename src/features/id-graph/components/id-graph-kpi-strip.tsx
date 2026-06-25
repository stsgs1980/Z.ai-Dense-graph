'use client'

/**
 * id-graph-kpi-strip.tsx — top KPI strip with summary stats
 */

import type { IdGraphSnapshotDTO } from '../lib/types'

interface Props {
  snapshot: IdGraphSnapshotDTO | null
  topHubs: Array<{ id: string; inDeg: number }>
  isolated: string[]
}

export function IdGraphKpiStrip({ snapshot, topHubs, isolated }: Props) {
  const counts = snapshot?.counts || {}
  const edges = snapshot?.edges || {}

  return (
    <div className="h-11 bg-slate-950 border-b border-slate-800 flex items-center px-4 gap-6 text-xs">
      <Stat label="IDs" value={String(counts.total ?? 60)} color="cyan" />
      <Stat label="Edges" value={String(edges.total ?? 113)} color="cyan" />
      <Divider />
      <Stat label="STD" value={String(counts.STD ?? 19)} color="cyan" />
      <Stat label="RULE" value={String(counts.RULE ?? 17)} color="purple" />
      <Stat label="PROC" value={String(counts.PROC ?? 4)} color="pink" />
      <Stat label="TOOL" value={String(counts.TOOL ?? 6)} color="amber" />
      <Stat label="ZAI" value={String(counts.ZAI ?? 24)} color="emerald" />
      <Divider />
      <Stat
        label="Top hub"
        value={topHubs[0] ? `${topHubs[0].id} (${topHubs[0].inDeg})` : '—'}
        color="cyan"
      />
      <Stat
        label="Isolated"
        value={isolated.length > 0 ? isolated.join(', ') : 'none'}
        color={isolated.length > 0 ? 'amber' : 'green'}
      />
      <div className="ml-auto text-[10px] text-slate-500 font-mono">
        {snapshot
          ? `${snapshot.platformTag} · standards@${snapshot.standardsSha.slice(0, 7)} · guard@${snapshot.guardSha.slice(0, 7)} · skills@${snapshot.skillsSha.slice(0, 7)}`
          : 'no snapshot'}
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color: 'cyan' | 'purple' | 'pink' | 'amber' | 'emerald' | 'green'
}) {
  const colors = {
    cyan: 'text-cyan-400',
    purple: 'text-purple-400',
    pink: 'text-pink-400',
    amber: 'text-amber-400',
    emerald: 'text-emerald-400',
    green: 'text-emerald-400',
  }
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-slate-500">{label}:</span>
      <span className={`font-mono font-medium ${colors[color]}`}>{value}</span>
    </div>
  )
}

function Divider() {
  return <span className="text-slate-700">|</span>
}
