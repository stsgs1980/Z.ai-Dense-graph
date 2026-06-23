import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { aggregateAgentStats } from '@/lib/agent-helpers'

export async function GET() {
  try {
    const stepExecutions = await db.stepExecution.findMany({
      select: {
        id: true, agentId: true, status: true, outputData: true,
        startedAt: true, completedAt: true,
      },
      orderBy: { startedAt: 'desc' },
    })

    return NextResponse.json({ agentStats: aggregateAgentStats(stepExecutions) })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[/api/agents/execution-stats GET]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}