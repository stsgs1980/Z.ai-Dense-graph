'use client'

import { Activity } from 'lucide-react'
import { ROLE_GROUPS, ACTIVITY_EVENTS } from '@/shared/config/dashboard-constants'

function TimelineDot({ dotColor, isLast }: { dotColor: string; isLast: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4, flexShrink: 0 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: dotColor, boxShadow: `0 0 6px ${dotColor}44`, flexShrink: 0 }} />
      {!isLast && (
        <span style={{ width: 1, flex: 1, marginTop: 4, minHeight: 16, background: `linear-gradient(to bottom, ${dotColor}60, transparent)` }} />
      )}
    </div>
  )
}

function TimelineEventContent({ event, dotColor }: { event: typeof ACTIVITY_EVENTS[number]; dotColor: string }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 9, fontFamily: 'monospace', color: '#4B5563', flexShrink: 0 }}>{event.time}</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: dotColor }}>{event.agent}</span>
        <span style={{ fontSize: 7, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '1px 5px', borderRadius: 3, background: `${dotColor}12`, color: dotColor, border: `1px solid ${dotColor}20` }}>
          {event.group}
        </span>
      </div>
      <p style={{ fontSize: 10, color: '#94A3B8', marginTop: 3, lineHeight: 1.4 }}>{event.desc}</p>
    </div>
  )
}

function TimelineEvent({ event, isLast }: { event: typeof ACTIVITY_EVENTS[number]; isLast: boolean }) {
  const groupConfig = ROLE_GROUPS.find(g => g.name === event.group)
  const dotColor = groupConfig?.color || '#94a3b8'

  return (
    <div
      key={event.time + event.agent}
      style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 6px', borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.03)', borderRadius: 6, cursor: 'default', transition: 'background 0.15s' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
    >
      <TimelineDot dotColor={dotColor} isLast={isLast} />
      <TimelineEventContent event={event} dotColor={dotColor} />
    </div>
  )
}

export function RecentActivityTimeline({ events }: { events?: typeof ACTIVITY_EVENTS }) {
  const displayEvents = events || ACTIVITY_EVENTS

  return (
    <div
      data-src="src/components/dashboard/activity-timeline.tsx"
      style={{ background: 'rgba(20, 20, 20, 0.7)', border: '1px solid rgba(51, 51, 51, 0.4)', borderRadius: 10, padding: '18px 20px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
        <Activity style={{ width: 13, height: 13, color: '#06B6D4' }} />
        <span style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#64748B' }}>Recent Activity</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
        {displayEvents.map((event, i) => (
          <TimelineEvent key={i} event={event} isLast={i === displayEvents.length - 1} />
        ))}
      </div>
    </div>
  )
}