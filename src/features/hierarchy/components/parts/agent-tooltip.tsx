import type { Agent } from './types'
import { ROLE_CONFIG, STATUS_COLORS } from './types'

function TooltipName({ name }: { name: string }) {
  return <text x={12} y={16} fill="#FFFFFF" fontSize="10" fontWeight="700" style={{ pointerEvents: 'none' }}>{name}</text>
}

function TooltipRole({ role }: { role: string }) {
  return <text x={12} y={28} fill="#999" fontSize="8" style={{ pointerEvents: 'none' }}>{role}</text>
}

function TooltipStatus({ status, statusColor }: { status: string; statusColor: string }) {
  return (
    <>
      <circle cx={120} cy={12} r={4} fill={statusColor} />
      <text x={128} y={15} fill="#B0B0B0" fontSize="7" style={{ pointerEvents: 'none' }}>{status}</text>
    </>
  )
}

function TooltipMeta({ skillCount, formula }: { skillCount: number; formula: string }) {
  return <text x={12} y={42} fill="#B0B0B0" fontSize="7" style={{ pointerEvents: 'none' }}>{skillCount} skills | {formula}</text>
}

export function AgentTooltip({ agent, x, y }: { agent: Agent; x: number; y: number }) {
  const config = ROLE_CONFIG[agent.roleGroup] || ROLE_CONFIG['\u0418\u0441\u043f\u043e\u043b\u043d\u0435\u043d\u0438\u0435']
  const statusColor = STATUS_COLORS[agent.status] || STATUS_COLORS.offline
  const skills = agent.skills ? agent.skills.split(',').filter(Boolean) : []

  return (
    <g transform={`translate(${x - 75}, ${y - 80})`}>
      <rect width={150} height={52} rx={8} fill="rgba(13, 13, 13, 0.95)" stroke={config.color} strokeWidth={0.15} strokeOpacity={0.15} />
      <TooltipName name={agent.name} />
      <TooltipRole role={agent.role} />
      <TooltipStatus status={agent.status} statusColor={statusColor} />
      <TooltipMeta skillCount={skills.length} formula={agent.formula} />
    </g>
  )
}