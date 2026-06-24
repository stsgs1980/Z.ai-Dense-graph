'use client'

import { Grid3X3 } from 'lucide-react'
import { GROUP_ABBREVIATIONS, GROUP_COLORS } from '@/shared/config/dashboard-constants'
import { HeatmapCell, HeatmapLegend } from './heatmap-parts'

const FALLBACK_DATA: number[][] = [
  [2, 3, 2, 1, 0, 2, 0, 0], [0, 2, 1, 5, 0, 0, 0, 0],
  [0, 0, 2, 3, 0, 0, 0, 0], [0, 0, 0, 3, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 2, 0, 0], [0, 0, 0, 0, 0, 2, 0, 0],
  [0, 1, 0, 2, 1, 0, 2, 0], [0, 0, 0, 1, 2, 0, 0, 2],
]

export function ConnectionHeatmap({ data }: { data?: number[][] }) {
  const heatmapData = data || FALLBACK_DATA
  const maxVal = Math.max(...heatmapData.flat(), 1)

  return (
    <div data-src="src/components/dashboard/connection-heatmap.tsx"
      style={{ background: 'rgba(20, 20, 20, 0.7)', border: '1px solid rgba(51, 51, 51, 0.4)',
        borderRadius: 10, padding: '18px 20px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
        <Grid3X3 style={{ width: 13, height: 13, color: '#06B6D4' }} />
        <span style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#64748B' }}>Connection Heatmap</span>
      </div>
      <div style={{ overflowX: 'auto', flex: 1 }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 420, fontSize: 10 }}>
          <thead>
            <tr>
              <th style={{ width: 56, padding: '4px 4px 6px' }} />
              {GROUP_ABBREVIATIONS.map((abbr, i) => (
                <th key={abbr} style={{ padding: '4px 2px 6px', textAlign: 'center', fontWeight: 700, fontSize: 9, color: GROUP_COLORS[i], letterSpacing: 0.5 }}>{abbr}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {heatmapData.map((row, rowIdx) => (
              <tr key={rowIdx}>
                <td style={{ padding: '2px 6px 2px 4px', textAlign: 'right', fontWeight: 700, fontSize: 9, color: GROUP_COLORS[rowIdx], whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                  {GROUP_ABBREVIATIONS[rowIdx]}
                </td>
                {row.map((count, colIdx) => (
                  <HeatmapCell key={colIdx} count={count} rowIdx={rowIdx} colIdx={colIdx} maxVal={maxVal} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <HeatmapLegend />
    </div>
  )
}