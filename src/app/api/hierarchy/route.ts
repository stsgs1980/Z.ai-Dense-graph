import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { buildAgentTree, groupByRoleGroup, computeAgentStats, buildAllConnections } from '@/lib/hierarchy-builder'

export async function GET() {
  try {
    const agents = await db.agent.findMany({
      include: {
        children: { select: { id: true, name: true, roleGroup: true, status: true, parentId: true, twinId: true } },
        twin: { select: { id: true, name: true, roleGroup: true } },
        twinOf: { select: { id: true, name: true, roleGroup: true } },
        tasks: { select: { id: true, title: true, status: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    const { roots } = buildAgentTree(agents)
    const groups = groupByRoleGroup(agents)
    const stats = computeAgentStats(agents)
    const connections = buildAllConnections(agents, groups)

    return NextResponse.json({ roots, groups, stats, agents, connections })
  } catch (error) {
    console.error('Failed to fetch hierarchy:', error)
    return NextResponse.json({ error: 'Failed to fetch hierarchy' }, { status: 500 })
  }
}