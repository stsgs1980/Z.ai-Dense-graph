/**
 * Workflow Simulator
 * Simulates step execution for workflow runs with realistic patterns.
 */

export interface SimulationStep {
  action: string
  name: string
  roleGroup: string | null
  config: string
}

export interface SimulationAgent {
  name: string
  role: string
  formula: string
}

// ─── Per-action handlers ─────────────────────────────────────

function simulateProcess(input: any, agent: SimulationAgent | undefined, config: any, step: SimulationStep): any {
  return {
    ...input,
    _processedBy: agent?.name || 'system',
    _processingResult: 'success',
    _timestamp: new Date().toISOString(),
    [step.name.toLowerCase().replace(/\s+/g, '_')]: { status: 'processed', agent: agent?.name, formula: agent?.formula },
  }
}

function simulateReview(input: any, agent: SimulationAgent | undefined): any {
  const approved = Math.random() > 0.2
  return {
    ...input,
    _reviewResult: approved ? 'approved' : 'reject',
    _reviewReason: approved ? 'Meets quality standards' : 'Quality threshold not met',
    _reviewedBy: agent?.name || 'system',
    _feedback: approved ? undefined : 'Needs improvement in accuracy and completeness',
    _timestamp: new Date().toISOString(),
  }
}

function simulateTransform(input: any, agent: SimulationAgent | undefined, config: any): any {
  return {
    ...input, _transformedBy: agent?.name || 'system',
    _transformType: config.transformType || 'format',
    _transformResult: 'transformed', _timestamp: new Date().toISOString(),
  }
}

function simulateDelegate(input: any, agent: SimulationAgent | undefined, config: any, step: SimulationStep): any {
  return {
    ...input, _delegatedBy: agent?.name || 'system',
    _delegatedTo: config.targetGroup || step.roleGroup,
    _delegationReason: config.reason || 'Specialized processing required',
    _timestamp: new Date().toISOString(),
  }
}

function simulateBroadcast(input: any, agent: SimulationAgent | undefined, context: any): any {
  return {
    ...input, _broadcastBy: agent?.name || 'system',
    _broadcastTargets: context._history?.length || 0,
    _broadcastResult: 'delivered', _timestamp: new Date().toISOString(),
  }
}

function simulateDecision(input: any, agent: SimulationAgent | undefined, config: any): any {
  const condition = config.condition || 'default'
  const branch = condition === 'quality_check' ? (Math.random() > 0.3 ? 'pass' : 'fail') : 'default'
  return {
    ...input, _decisionBy: agent?.name || 'system', _decisionBranch: branch,
    _decisionReason: `Condition "${condition}" evaluated to "${branch}"`,
    _timestamp: new Date().toISOString(),
  }
}

type ActionHandler = (input: any, agent: SimulationAgent | undefined, config: any, step: SimulationStep, context: any) => any

const ACTION_HANDLERS: Record<string, ActionHandler> = {
  process: simulateProcess,
  review: (input, agent) => simulateReview(input, agent),
  transform: (input, agent, config) => simulateTransform(input, agent, config),
  delegate: (input, agent, config, step) => simulateDelegate(input, agent, config, step),
  broadcast: (input, agent, _config, _step, context) => simulateBroadcast(input, agent, context),
  decision: (input, agent, config) => simulateDecision(input, agent, config),
}

// ─── Main entry point ───────────────────────────────────────

export function simulateStepExecution(
  step: SimulationStep, input: any, agent: SimulationAgent | undefined, context: any,
): any {
  const config = typeof step.config === 'string' ? JSON.parse(step.config) : step.config
  const handler = ACTION_HANDLERS[step.action]
  if (handler) return handler(input, agent, config, step, context)
  return {
    ...input, _processedBy: agent?.name || 'system',
    _timestamp: new Date().toISOString(),
  }
}