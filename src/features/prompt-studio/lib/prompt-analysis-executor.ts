// ─── Workflow execution helpers for Prompt Studio ──────

import type { ExecutionData } from './prompt-analysis-types'
import { savePromptHistory } from './prompt-history-saver'

async function safeJson<T>(res: Response): Promise<T> {
  const ct = res.headers.get('content-type') || ''
  if (!ct.includes('application/json') && !ct.includes('text/plain')) {
    const text = await res.text()
    throw new Error(`Server returned non-JSON response (HTTP ${res.status}). ${text.slice(0, 200)}`)
  }
  return res.json() as Promise<T>
}

async function loadAgentNames(): Promise<Record<string, string>> {
  try {
    const res = await fetch('/api/agents')
    const agents = await safeJson<Array<{ id: string; name: string }>>(res)
    const map: Record<string, string> = {}
    for (const a of agents) map[a.id] = a.name
    return map
  } catch { return {} }
}

async function createWorkflow(
  intent: string, prompt: string,
  pipelineSteps: Array<{ name: string; action: string; roleGroup: string; formulaName: string }>,
): Promise<any> {
  const createRes = await fetch('/api/workflows', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: `Prompt Studio: ${intent}`,
      description: `Auto-generated from prompt: "${prompt.slice(0, 120)}${prompt.length > 120 ? '...' : ''}"`,
      triggerType: 'manual',
      steps: pipelineSteps.map(step => ({
        name: step.name, action: step.action, roleGroup: step.roleGroup,
        config: { formula: step.formulaName },
      })),
    }),
  })
  const createData = await safeJson<Record<string, any>>(createRes)
  if (!createRes.ok) throw new Error(createData.error || `Failed to create workflow (HTTP ${createRes.status})`)
  if (!createData.workflow?.id) throw new Error('Workflow creation returned no valid data')
  return createData.workflow
}

async function executeWorkflow(workflowId: string, intent: string, prompt: string): Promise<Record<string, any>> {
  const execRes = await fetch('/api/workflows/execute-llm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workflowId, input: { prompt, intent } }),
  })
  const execData = await safeJson<Record<string, any>>(execRes)
  if (!execRes.ok) throw new Error(execData.error || `Failed to execute workflow (HTTP ${execRes.status})`)
  if (!execData.execution) throw new Error('Execution returned no data')
  return execData.execution
}

export function buildStepNameMap(workflow: any): Map<string, string> {
  return new Map((workflow.steps || []).map((s: any) => [s.id, s.name]))
}

export function mapExecutionSteps(exec: any, stepNameMap: Map<string, string>, agents: Record<string, string>): ExecutionData['steps'] {
  const execStepNames: Record<string, string> = exec.stepNames || {}
  return (exec.steps || []).map((s: any) => ({
    id: s.id,
    name: stepNameMap.get(s.stepId) || execStepNames[s.stepId] || 'Step',
    status: s.status,
    agentId: s.agentId,
    agentName: agents[s.agentId] || 'System',
    action: 'process',
    startedAt: s.startedAt, completedAt: s.completedAt,
    inputData: s.inputData, outputData: s.outputData, error: s.error,
  }))
}

export async function executeWorkflowSimulation(
  intent: string, prompt: string,
  pipelineSteps: Array<{ name: string; action: string; roleGroup: string; formulaName: string }>,
  meta?: { confidence: number; formula: string },
): Promise<ExecutionData> {
  const workflow = await createWorkflow(intent, prompt, pipelineSteps)
  const stepNameMap = buildStepNameMap(workflow)
  const exec = await executeWorkflow(workflow.id, intent, prompt)
  const agents = await loadAgentNames()

  const result: ExecutionData = {
    id: exec.id, status: exec.status,
    steps: mapExecutionSteps(exec, stepNameMap, agents),
  }

  savePromptHistory(prompt, intent, meta, result).catch(() => { /* ignore */ })
  return result
}