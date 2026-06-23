'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export function CollapsibleSection({ title, icon, count, accentColor, children, defaultOpen = true, dataSrc }: {
  title: string
  icon: React.ReactNode
  count?: number
  accentColor: string
  children: React.ReactNode
  defaultOpen?: boolean
  dataSrc?: string
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div style={{ marginBottom: 24 }} data-src={dataSrc}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          color: 'inherit',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 3, height: 16, borderRadius: 2, background: accentColor, flexShrink: 0 }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 8 }}>
            {icon}
            {title}
          </span>
          {count !== undefined && (
            <span style={{
              fontSize: 10,
              padding: '2px 8px',
              borderRadius: 5,
              fontWeight: 600,
              background: `${accentColor}12`,
              color: accentColor,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {count}
            </span>
          )}
        </div>
        <ChevronDown
          size={16}
          style={{ color: accentColor, transition: 'transform 0.3s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>
      <div
        style={{
          overflow: 'hidden',
          transition: 'max-height 0.3s ease, opacity 0.3s ease',
          maxHeight: open ? 5000 : 0,
          opacity: open ? 1 : 0,
        }}
      >
        <div style={{ marginTop: 16 }}>
          {children}
        </div>
      </div>
    </div>
  )
}