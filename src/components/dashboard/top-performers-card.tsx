'use client'

import { useState, useEffect } from 'react'
import { BarChart3 } from 'lucide-react'
import { ROLE_GROUPS, TOP_PERFORMERS } from '@/data/dashboard-constants'

export function TopPerformersCard({ topPerformers: topPerformersProp, roleGroups: roleGroupsProp }: { topPerformersProp?: typeof TOP_PERFORMERS; roleGroupsProp?: typeof ROLE_GROUPS }) {
  const topPerformers = topPerformersProp || TOP_PERFORMERS
  const roleGroupsData = roleGroupsProp || ROLE_GROUPS
  const [barWidths, setBarWidths] = useState<number[]>(topPerformers.map(() => 0))

  useEffect(() => {
    const timers = topPerformers.map((_, i) =>
      setTimeout(() => {
        setBarWidths(prev => { const next = [...prev]; next[i] = topPerformers[i].score; return next })
      }, 100 + i * 80)
    )
    return () => timers.forEach(clearTimeout)
  }, [topPerformers])

  const getGroupColor = (groupName: string): string => {
    const group = roleGroupsData.find(g => g.name === groupName)
    return group?.color || '#94a3b8'
  }

  return (
    <div
      data-src="src/components/dashboard/top-performers-card.tsx"
      style={{
        background: 'rgba(20, 20, 20, 0.7)',
        border: '1px solid rgba(51, 51, 51, 0.4)',
        borderRadius: 10,
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
        <BarChart3 style={{ width: 13, height: 13, color: '#0891B2' }} />
        <span style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#64748B' }}>
          Top Performers
        </span>
      </div>

      {/* Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {topPerformers.map((agent, i) => {
          const barColor = getGroupColor(agent.group)
          const width = barWidths[i]
          return (
            <div key={agent.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Rank */}
              <span style={{
                fontSize: 9,
                fontWeight: 700,
                color: '#4B5563',
                width: 14,
                textAlign: 'right',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {i + 1}
              </span>

              {/* Name */}
              <span style={{
                fontSize: 10,
                fontWeight: 600,
                color: barColor,
                width: 80,
                textAlign: 'right',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}>
                {agent.name}
              </span>

              {/* Bar */}
              <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    borderRadius: 3,
                    width: `${width}%`,
                    background: `linear-gradient(90deg, ${barColor}33, ${barColor}bb)`,
                    transition: 'width 0.7s ease-out',
                    boxShadow: width > 0 ? `0 0 8px ${barColor}20` : 'none',
                  }}
                />
              </div>

              {/* Score */}
              <span style={{
                fontSize: 10,
                fontWeight: 800,
                color: barColor,
                width: 28,
                textAlign: 'right',
                fontVariantNumeric: 'tabular-nums',
                flexShrink: 0,
              }}>
                {width > 0 ? agent.score : ''}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}