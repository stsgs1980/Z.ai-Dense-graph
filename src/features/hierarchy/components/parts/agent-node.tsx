'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { type Agent, ROLE_CONFIG, STATUS_COLORS, FORMULA_COLORS, getAvatarIcon } from './types'
import { AgentNodeGlow } from './agent-node-glow'

function AgentAvatar({ avatar, color }: { avatar: string; color: string }) {
  return React.createElement(getAvatarIcon(avatar), { size: 16, color, strokeWidth: 1.5 })
}

export function AgentNode({
  agent, x, y, isSelected, isHighlighted, isDimmed, isCollapsed,
  skillCount, taskCount = 0, statusTransition = null,
  onClick, onToggleCollapse, onHover, onContextMenu,
}: {
  agent: Agent; x: number; y: number
  isSelected: boolean; isHighlighted: boolean; isDimmed: boolean; isCollapsed: boolean
  skillCount: number; taskCount?: number
  statusTransition: { status: string; timestamp: number } | null
  onClick: () => void; onToggleCollapse: () => void
  onHover: (id: string | null) => void
  onContextMenu: (e: React.MouseEvent, agentId: string) => void
}) {
  const config = ROLE_CONFIG[agent.roleGroup] || ROLE_CONFIG['\u0418\u0441\u043f\u043e\u043b\u043d\u0435\u043d\u0438\u0435']
  const statusColor = STATUS_COLORS[agent.status] || STATUS_COLORS.offline
  const formulaColor = FORMULA_COLORS[agent.formula] || '#888'
  const hasChildren = (agent.children && agent.children.length > 0) || false

  return (
    <g transform={`translate(${x}, ${y})`} className="cursor-pointer"
      onClick={onClick} onContextMenu={(e) => onContextMenu(e, agent.id)}
      onMouseEnter={() => onHover(agent.id)} onMouseLeave={() => onHover(null)}
      style={{ opacity: isDimmed ? 0.2 : isCollapsed ? 0.4 : 1, transition: 'opacity 0.4s ease' }}
    >
      <AgentNodeGlow isHighlighted={isHighlighted} isSelected={isSelected} isActive={agent.status === 'active'} config={config} />
      <NodeOrb config={config} agent={agent} />
      <NodeInfo agent={agent} taskCount={taskCount} />
      <NodeStatus statusTransition={statusTransition} statusColor={statusColor} agent={agent} formulaColor={formulaColor} />
      {hasChildren && <CollapseButton isCollapsed={isCollapsed} config={config} onToggleCollapse={onToggleCollapse} />}
    </g>
  )
}

function NodeOrb({ config, agent }: { config: { color: string; colorRgb: string }; agent: Agent }) {
  return (
    <>
      <motion.circle r={28} fill={`rgba(${config.colorRgb}, 0.12)`} stroke={config.color}
        strokeWidth={0.2} strokeOpacity={0.2}
        animate={{ r: [28, 29, 28] }}
        transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, ease: 'easeInOut' }} />
      <circle r={20} fill={`rgba(${config.colorRgb}, 0.06)`} filter="url(#orbGlow)" />
      <foreignObject x={-10} y={-10} width={20} height={20} style={{ pointerEvents: 'none' }}>
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AgentAvatar avatar={agent.avatar} color={config.color} />
        </div>
      </foreignObject>
    </>
  )
}

function NodeInfo({ agent, taskCount }: { agent: Agent; taskCount: number }) {
  return (
    <>
      <text y={40} textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="600" style={{ pointerEvents: 'none' }}>{agent.name}</text>
      <text y={48} textAnchor="middle" fill="#B0B0B0" fontSize="6" opacity={0.5} style={{ pointerEvents: 'none' }}>{taskCount} tasks</text>
    </>
  )
}

function NodeStatus({ statusTransition, statusColor, agent, formulaColor }: {
  statusTransition: { status: string; timestamp: number } | null
  statusColor: string; agent: Agent; formulaColor: string
}) {
  return (
    <>
      {statusTransition && (
        <>
          <circle r={3} fill="none" stroke={STATUS_COLORS[statusTransition.status] || STATUS_COLORS.offline} strokeWidth={0.8} transform="translate(18, -20)">
            <animate attributeName="r" from="3" to="14" dur="1s" fill="freeze" />
            <animate attributeName="strokeOpacity" from="0.8" to="0" dur="1s" fill="freeze" />
            <animate attributeName="strokeWidth" from="0.8" to="0" dur="1s" fill="freeze" />
          </circle>
          <g transform="translate(18, -32)">
            <text textAnchor="middle" fill={STATUS_COLORS[statusTransition.status] || STATUS_COLORS.offline} fontSize="6" fontWeight="700" style={{ pointerEvents: 'none' }}>
              STATUS: {statusTransition.status.toUpperCase()}
              <animate attributeName="opacity" from="1" to="0" dur="2s" fill="freeze" />
            </text>
          </g>
        </>
      )}
      <g transform="translate(-15, -19)">
        <rect width={30} height={12} rx={3} fill={formulaColor} fillOpacity={0.15} stroke={formulaColor} strokeWidth={0.1} strokeOpacity={0.3} />
        <text x={15} y={9} textAnchor="middle" fill={formulaColor} fontSize="7" fontWeight="700" style={{ pointerEvents: 'none' }}>{agent.formula}</text>
      </g>
      <g transform="translate(18, -20)">
        <motion.circle r={3} fill={statusColor}
          animate={{ opacity: agent.status === 'active' ? [1, 0.4, 1] : agent.status === 'idle' ? [0.7, 0.4, 0.7] : [0.6] }}
          transition={{ duration: agent.status === 'active' ? 2 : agent.status === 'idle' ? 3 : 0, repeat: Infinity, ease: 'easeInOut' }} />
      </g>
    </>
  )
}

function CollapseButton({ isCollapsed, config, onToggleCollapse }: { isCollapsed: boolean; config: { color: string }; onToggleCollapse: () => void }) {
  return (
    <g transform="translate(0, -36)" className="cursor-pointer" onClick={(e) => { e.stopPropagation(); onToggleCollapse() }}>
      <circle r={5} fill="rgba(26, 26, 26, 0.92)" stroke={config.color} strokeWidth={0.2} strokeOpacity={0.3} />
      <foreignObject x={-4} y={-4} width={8} height={8} style={{ pointerEvents: 'none' }}>
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isCollapsed
            ? React.createElement(ChevronRight, { size: 7, color: config.color })
            : React.createElement(ChevronDown, { size: 7, color: config.color })}
        </div>
      </foreignObject>
    </g>
  )
}