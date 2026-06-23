import { NextRequest, NextResponse } from 'next/server'
import {
  loadWorkflow,
  resolveAgentsForSteps,
  createExecutionRecords,
  finalizeExecution,
  buildStepUserPrompt,
  WorkflowError,
  type AgentRecord,
} from '@/lib/workflow-execution'
import { buildAgentSystemPrompt, callLLM, parseLLMOutput } from './helpers'
import { runLLMPipeline } from '@/lib/workflow-pipeline'

async function callStepLLM(
  step: { action: string; name: string },
  previousOutput: Record<string, unknown>,
  history: unknown[],
  agent: AgentRecord,
): Promise<Record<string, unknown>> {
  const systemPrompt = buildAgentSystemPrompt(agent)
  const userPrompt = buildStepUserPrompt(step.action, step.name, previousOutput, history)
  const raw = await callLLM(systemPrompt, userPrompt)
  return parseLLMOutput(raw, previousOutput)
}

export async function POST(req: NextRequest) {
  try {
    const { workflowId, input } = await req.json()
    if (!workflowId) return NextResponse.json({ error: 'workflowId is required' }, { status: 400 })

    const workflow = await loadWorkflow(workflowId)
    const { resolved, agentMap } = await resolveAgentsForSteps(workflow.steps)
    const { execution, stepExecs } = await createExecutionRecords(workflowId, input, resolved)

    const { taskContext, previousOutput, finalStatus, finalError } = await runLLMPipeline(
      resolved, stepExecs, agentMap, input, callStepLLM,
    )

    const fullExecution = await finalizeExecution(execution.id, taskContext, previousOutput, finalStatus, finalError)
    return NextResponse.json({ execution: fullExecution }, { status: 201 })
  } catch (error) {
    if (error instanceof WorkflowError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[/api/workflows/execute-llm POST]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}