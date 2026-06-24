'use client'

import React, { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Brain } from 'lucide-react'
import { ROLE_CONFIG, STATUS_COLORS } from './types'
import { AVATAR_ICONS } from './agent-icons'
import type { AgentNodeData } from './types'

function NodeHeader({ config, agent, statusColor }: { config: typeof ROLE_CONFIG[string]; agent: AgentNodeData; statusColor: string }) {
  return (
    <div style={{ height: 16, background: `rgba(${config.colorRgb}, 0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px' }}>
      <span style={{ fontSize: 7, fontWeight: 700, color: config.color, letterSpacing: 0.5, textTransform: 'uppercase' }}>{config.label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 7, color: statusColor, fontWeight: 600 }}>{agent.status.toUpperCase()}</span>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: statusColor, boxShadow: agent.status === 'active' ? `0 0 4px ${statusColor}` : 'none' }} />
      </div>
    </div>
  )
}

function NodeBody({ config, agent }: { config: typeof ROLE_CONFIG[string]; agent: AgentNodeData }) {
  const IconComponent = AVATAR_ICONS[agent.avatar] || Brain
  return (
    <div style={{ padding: '4px 8px 6px', display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 22, height: 22, borderRadius: 4, background: `rgba(${config.colorRgb}, 0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <IconComponent size={12} color={config.color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{agent.name}</div>
        <div style={{ fontSize: 7, color: '#64748B', marginTop: 1 }}>{agent.formula} · {agent.skillCount ?? 0} skills</div>
      </div>
    </div>
  )
}

function AgentNodeComponent({ data, selected }: NodeProps) {
  const agent = data as unknown as AgentNodeData
  const config = ROLE_CONFIG[agent.roleGroup] || ROLE_CONFIG['Execution']
  const statusColor = STATUS_COLORS[agent.status] || STATUS_COLORS.offline

  return (
    <div style={{ width: 160, minHeight: 58, background: `rgba(${config.colorRgb}, 0.06)`, border: `1px solid ${selected ? config.color : `rgba(${config.colorRgb}, 0.2)`}`, borderWidth: selected ? 1.5 : 0.5, borderRadius: 8, opacity: agent.isDimmed ? 0.25 : 1, transition: 'opacity 0.3s, border-color 0.3s', overflow: 'hidden', boxShadow: selected ? `0 0 20px rgba(${config.colorRgb}, 0.15), 0 0 40px rgba(${config.colorRgb}, 0.05)` : agent.isHighlighted ? `0 0 12px rgba(${config.colorRgb}, 0.1)` : 'none', cursor: 'pointer' }}>
      <NodeHeader config={config} agent={agent} statusColor={statusColor} />
      <NodeBody config={config} agent={agent} />
      <Handle type="target" position={Position.Top} style={{ width: 6, height: 6, background: config.color, opacity: 0.5, border: 'none', top: -3 }} />
      <Handle type="source" position={Position.Bottom} style={{ width: 6, height: 6, background: config.color, opacity: 0.5, border: 'none', bottom: -3 }} />
    </div>
  )
}

export const AgentNode = memo(AgentNodeComponent)