import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { formatStepExecution, computeExecutionStats } from '@/lib/agent-helpers'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: agentId } = await params

    const agent = await db.agent.findUnique({ where: { id: agentId } })
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    const stepExecutions = await db.stepExecution.findMany({
      where: { agentId },
      include: {
        step: { select: { id: true, name: true, action: true, order: true, workflowId: true } },
        messages: {
          select: { id: true, type: true, content: true, timestamp: true, fromAgentId: true, toAgentId: true },
          orderBy: { timestamp: 'desc' },
        },
      },
      orderBy: { startedAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({
      agentId,
      agentName: agent.name,
      stats: computeExecutionStats(stepExecutions),
      recentExecutions: stepExecutions.map(formatStepExecution),
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[/api/agents/[id]/executions GET]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}