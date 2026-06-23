/**
 * Stats Computations
 * All DB queries and data transformations for the stats API.
 */

import { db } from '@/lib/db'
import { ROLE_GROUP_CONFIG, ROLE_GROUP_ORDER, STATUS_CONFIG, ALL_KNOWN_FORMULAS } from '@/lib/stats-constants'
import { computeConnectionHeatmap, computeNetworkActivity } from '@/lib/stats-heatmap'

export interface StatsResult {
  quickStats: {
    totalAgents: number
    roleGroups: number
    cognitiveFormulas: number
    edgeTypes: number
    activeAgents: number
    idleAgents: number
    totalTasks: number
    formulasCoverage: number
  }
  statusDistribution: { label: string; status: string; count: number; color: string }[]
  roleGroups: any[]
  agents: any[]
  activityEvents: any[]
  topPerformers: any[]
  connectionHeatmap: number[][]
  networkActivity: number[]
}

function computeQuickStats(agents: any[], tasks: any[]) {
  const uniqueRoleGroups = new Set(agents.map((a) => a.roleGroup))
  const uniqueFormulas = new Set(agents.map((a) => a.formula))
  return {
    totalAgents: agents.length,
    roleGroups: uniqueRoleGroups.size,
    cognitiveFormulas: uniqueFormulas.size,
    edgeTypes: 6,
    activeAgents: agents.filter((a) => a.status === 'active').length,
    idleAgents: agents.filter((a) => a.status === 'idle').length,
    totalTasks: tasks.length,
    formulasCoverage: ALL_KNOWN_FORMULAS.length > 0 ? Math.round((uniqueFormulas.size / ALL_KNOWN_FORMULAS.length) * 100) : 0,
  }
}

function computeStatusDistribution(agents: any[]) {
  const statusCounts: Record<string, number> = {}
  for (const sc of STATUS_CONFIG) statusCounts[sc.status] = 0
  for (const agent of agents) {
    const s = agent.status.toLowerCase()
    if (s in statusCounts) statusCounts[s]++
  }
  return STATUS_CONFIG.map((sc) => ({ label: sc.label, status: sc.status, count: statusCounts[sc.status] || 0, color: sc.color }))
}

function computeGroupStatusSummary(groupAgents: any[]) {
  const counts: Record<string, number> = {}
  for (const agent of groupAgents) {
    const s = agent.status.toLowerCase()
    counts[s] = (counts[s] || 0) + 1
  }
  const summary: { color: string; label: string }[] = []
  for (const sc of STATUS_CONFIG) {
    const count = counts[sc.status]
    if (count && count > 0) summary.push({ color: sc.color, label: `${count} ${sc.status}` })
  }
  return summary
}

function computeRoleGroups(agents: any[]) {
  const agentsByGroup: Record<string, typeof agents> = {}
  for (const agent of agents) {
    if (!agentsByGroup[agent.roleGroup]) agentsByGroup[agent.roleGroup] = []
    agentsByGroup[agent.roleGroup].push(agent)
  }
  return ROLE_GROUP_ORDER.map((groupName) => {
    const config = ROLE_GROUP_CONFIG[groupName]
    const groupAgents = agentsByGroup[groupName] || []
    return {
      name: groupName, label: config.label, color: config.color, colorRgb: config.colorRgb,
      agents: groupAgents.length,
      activeAgents: groupAgents.filter((a) => a.status === 'active').length,
      formulas: [...new Set(groupAgents.map((a) => a.formula))].join(', '),
      description: config.description,
      statusSummary: computeGroupStatusSummary(groupAgents),
    }
  })
}

function formatTimeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${Math.floor(diffHours / 24)}d ago`
}

function computeActivityEvents(tasks: any[]) {
  return tasks.slice(0, 20).map((task) => {
    const agentName = task.agent?.name || 'Unknown'
    const agentGroup = task.agent?.roleGroup || ''
    const statusLabel = task.status
    return { time: formatTimeAgo(task.createdAt), agent: agentName, group: agentGroup, desc: `${task.title} — ${statusLabel}` }
  })
}

function computeTopPerformers(agents: any[], tasks: any[]) {
  const completedTasksByAgent: Record<string, number> = {}
  for (const task of tasks) {
    if (task.status === 'completed' && task.agentId)
      completedTasksByAgent[task.agentId] = (completedTasksByAgent[task.agentId] || 0) + 1
  }
  return agents
    .map((agent) => ({
      name: agent.name, group: agent.roleGroup,
      score: Math.min(80 + (completedTasksByAgent[agent.id] || 0) * 5, 100),
      completedTasks: completedTasksByAgent[agent.id] || 0,
    }))
    .sort((a, b) => b.score - a.score || b.completedTasks - a.completedTasks)
    .slice(0, 10)
}

export async function computeStats(): Promise<StatsResult> {
  const agents = await db.agent.findMany({
    include: { tasks: true, parent: { select: { id: true, name: true, roleGroup: true } }, twin: { select: { id: true, name: true, roleGroup: true } }, children: { select: { id: true, name: true, roleGroup: true } } },
  })
  const tasks = await db.task.findMany({ include: { agent: { select: { id: true, name: true, roleGroup: true } } }, orderBy: { createdAt: 'desc' } })

  const agentsByGroup: Record<string, typeof agents> = {}
  for (const agent of agents) {
    if (!agentsByGroup[agent.roleGroup]) agentsByGroup[agent.roleGroup] = []
    agentsByGroup[agent.roleGroup].push(agent)
  }

  return {
    quickStats: computeQuickStats(agents, tasks),
    statusDistribution: computeStatusDistribution(agents),
    roleGroups: computeRoleGroups(agents),
    agents: agents.map((agent) => ({
      id: agent.id, name: agent.name, role: agent.role, roleGroup: agent.roleGroup,
      status: agent.status, formula: agent.formula, skills: agent.skills,
      description: agent.description, taskCount: agent.tasks.length,
    })),
    activityEvents: computeActivityEvents(tasks),
    topPerformers: computeTopPerformers(agents, tasks),
    connectionHeatmap: computeConnectionHeatmap(agents, agentsByGroup),
    networkActivity: computeNetworkActivity(tasks, tasks.length),
  }
}