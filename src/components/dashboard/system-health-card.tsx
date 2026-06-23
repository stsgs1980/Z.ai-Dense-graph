'use client'

import { useState, useEffect } from 'react'
import { Activity } from 'lucide-react'

export function SystemHealthCard() {
  const [cpuWidth, setCpuWidth] = useState(0)
  const [memWidth, setMemWidth] = useState(0)
  const [netWidth, setNetWidth] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setCpuWidth(34), 100)
    const t2 = setTimeout(() => setMemWidth(67), 200)
    const t3 = setTimeout(() => setNetWidth(23), 300)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  const bars = [
    { label: 'CPU', value: 34, color: '#06B6D4', width: cpuWidth },
    { label: 'Memory', value: 67, color: '#0891B2', width: memWidth },
    { label: 'Network', value: 23, color: '#0E7490', width: netWidth },
  ]

  const chips = [
    { label: 'Uptime', value: '99.7%', color: '#22D3EE', pulse: true },
    { label: 'Connections', value: '55', color: '#06B6D4' },
    { label: 'Errors', value: '0.3%', color: '#22D3EE' },
  ]

  return (
    <div
      data-src="src/components/dashboard/system-health-card.tsx"
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
        <Activity style={{ width: 13, height: 13, color: '#0891B2' }} />
        <span style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#64748B' }}>
          System Health
        </span>
      </div>

      {/* Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {bars.map((bar) => (
          <div key={bar.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: '#B0B0B0' }}>{bar.label}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: bar.color, fontVariantNumeric: 'tabular-nums' }}>{bar.value}%</span>
            </div>
            <div style={{ width: '100%', height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  borderRadius: 3,
                  width: `${bar.width}%`,
                  background: `linear-gradient(90deg, ${bar.color}66, ${bar.color})`,
                  transition: 'width 1s ease-out',
                  boxShadow: bar.width > 0 ? `0 0 8px ${bar.color}30` : 'none',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(51,51,51,0.3)' }}>
        {chips.map((chip) => (
          <div
            key={chip.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 8px',
              borderRadius: 6,
              background: 'rgba(13,13,13,0.9)',
              border: '1px solid rgba(51,51,51,0.3)',
            }}
          >
            {chip.pulse && (
              <span style={{ position: 'relative', width: 6, height: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ position: 'absolute', width: 6, height: 6, borderRadius: '50%', background: chip.color, animation: 'pulseGlow 2s ease-in-out infinite' }} />
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: chip.color, position: 'relative', zIndex: 1 }} />
              </span>
            )}
            <span style={{ fontSize: 8, color: '#64748B' }}>{chip.label}</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: chip.color, fontVariantNumeric: 'tabular-nums' }}>{chip.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}