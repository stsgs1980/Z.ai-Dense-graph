'use client'

import { Workflow } from 'lucide-react'
import { CollapsibleSection } from './collapsible-section'
import { computeWorkflowStats, STATUS_COLORS } from './workflow-stats-utils'
import { WorkflowSummaryCards, WorkflowCTA } from './workflow-summary-cards'
import { WorkflowList } from './workflow-list'

export function WorkflowStatsSection({ workflowsData, onOpenWorkflows }: { workflowsData: any; onOpenWorkflows?: () => void }) {
  const workflows = workflowsData?.workflows || []
  const { totalWorkflows, activeWorkflows, totalExecutions, avgSuccessRate } = computeWorkflowStats(workflows)

  const summaryCards = [
    { label: 'Total Workflows', value: totalWorkflows, color: '#06B6D4' },
    { label: 'Active', value: activeWorkflows, color: '#22D3EE' },
    { label: 'Total Executions', value: totalExecutions, color: '#0891B2' },
    { label: 'Avg Success Rate', value: avgSuccessRate + '%', color: avgSuccessRate >= 80 ? '#22D3EE' : '#EAB308' },
  ]

  return (
    <CollapsibleSection title="Workflow Pipeline" icon={<Workflow className="w-3.5 h-3.5" style={{ color: '#06B6D4' }} />}
      count={totalWorkflows} accentColor="#06B6D4" defaultOpen={true} dataSrc="src/components/dashboard/workflow-stats-section.tsx">
      <WorkflowSummaryCards cards={summaryCards} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 400, overflowY: 'auto',
        scrollbarWidth: 'thin', scrollbarColor: 'rgba(6,182,212,0.35) transparent' }}>
        <WorkflowList workflows={workflows} />
      </div>
      {onOpenWorkflows && <WorkflowCTA onOpenWorkflows={onOpenWorkflows} />}
    </CollapsibleSection>
  )
}