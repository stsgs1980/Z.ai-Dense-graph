import { NextRequest, NextResponse } from 'next/server'
import {
  loadWorkflow,
  resolveAgentsForSteps,
  createExecutionRecords,
  finalizeExecution,
  simulateStepExecution,
  WorkflowError,
} from '@/lib/workflow-execution'
import { runSimulatedPipeline } from '@/lib/workflow-pipeline'

export async function POST(req: NextRequest) {
  try {
    const { workflowId, input } = await req.json()
    if (!workflowId) {
      return NextResponse.json({ error: 'workflowId is required' }, { status: 400 })
    }

    const workflow = await loadWorkflow(workflowId)
    const { resolved, agentMap } = await resolveAgentsForSteps(workflow.steps)
    const { execution, stepExecs } = await createExecutionRecords(workflowId, input, resolved)

    const { taskContext, previousOutput } = await runSimulatedPipeline(
      resolved, stepExecs, agentMap, input, simulateStepExecution,
    )

    const fullExecution = await finalizeExecution(execution.id, taskContext, previousOutput, 'completed', null)
    return NextResponse.json({ execution: fullExecution }, { status: 201 })
  } catch (error) {
    if (error instanceof WorkflowError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[/api/workflows/execute POST]', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}