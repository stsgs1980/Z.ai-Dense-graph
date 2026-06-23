'use client'

import { Network } from 'lucide-react'
import { FORMULA_TAXONOMY, ROLE_GROUPS, GROUP_ABBREVIATIONS, GROUP_COLORS, FORMULA_AGENT_MAP } from '@/data/dashboard-constants'

export function FormulaAgentMappingGrid() {
  return (
    <div
      data-src="src/components/dashboard/formula-agent-mapping.tsx"
      style={{
        background: 'rgba(20, 20, 20, 0.7)',
        border: '1px solid rgba(51, 51, 51, 0.4)',
        borderRadius: 10,
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
        <Network style={{ width: 13, height: 13, color: '#06B6D4' }} />
        <span style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#64748B' }}>
          Formula-to-Agent Mapping
        </span>
      </div>

      {/* Grid */}
      <div style={{ overflowX: 'auto', flex: 1, minHeight: 0 }}>
        <div style={{ minWidth: 480 }}>
          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(8, 1fr)', gap: 0, marginBottom: 4 }}>
            <div />
            {GROUP_ABBREVIATIONS.map((abbr, i) => (
              <div key={abbr} style={{ textAlign: 'center', padding: '4px 0' }}>
                <span style={{ fontSize: 8, fontWeight: 700, color: GROUP_COLORS[i] }}>{abbr}</span>
              </div>
            ))}
          </div>

          {/* Rows */}
          {FORMULA_AGENT_MAP.map((row) => {
            const formulaInfo = FORMULA_TAXONOMY.flatMap(c => c.formulas).find(f => f.name === row.formula)
            const formulaColor = formulaInfo?.color || '#94a3b8'
            return (
              <div
                key={row.formula}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px repeat(8, 1fr)',
                  gap: 0,
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', padding: '4px 8px 4px 0' }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: formulaColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.formula}
                  </span>
                </div>
                {Array.from({ length: 8 }, (_, colIdx) => {
                  const isMapped = row.groups.includes(colIdx)
                  return (
                    <div key={colIdx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 0' }}>
                      {isMapped && (
                        <span style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: GROUP_COLORS[colIdx],
                          boxShadow: `0 0 6px ${GROUP_COLORS[colIdx]}44`,
                        }} />
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(51,51,51,0.3)' }}>
        {GROUP_ABBREVIATIONS.map((abbr, i) => (
          <div key={abbr} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: GROUP_COLORS[i] }} />
            <span style={{ fontSize: 8, color: '#64748B' }}>{abbr} = {ROLE_GROUPS[i].name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}