'use client'

import { Workflow, ChevronRight } from 'lucide-react'
import { CollapsibleSection } from './collapsible-section'

const STATUS_COLORS: Record<string, string> = {
  active: '#22D3EE', draft: '#64748B', paused: '#EAB308', completed: '#06B6D4', error: '#F43F5E',
}

const STEP_COLOR_MAP: Record<string, string> = {
  process: '#06B6D4', validate: '#22D3EE', delegate: '#0891B2', aggregate: '#0E7490',
  analyze: '#67E8F9', report: '#155E75', alert: '#EAB308', resolve: '#06B6D4',
  verify: '#22D3EE', learn: '#164E63', search: '#0891B2', index: '#0E7490',
  distribute: '#155E75', request: '#67E8F9', route: '#06B6D4', code: '#22D3EE',
  review: '#0891B2', test: '#0E7490', deploy: '#06B6D4', collect: '#67E8F9',
  evaluate: '#0891B2',
}

export function WorkflowStatsSection({ workflowsData, onOpenWorkflows }: { workflowsData: any; onOpenWorkflows?: () => void }) {
  const workflows = workflowsData?.workflows || []
  const totalWorkflows = workflows.length
  const activeWorkflows = workflows.filter((w: any) => w.status === 'active').length
  const totalExecutions = workflows.reduce((sum: number, w: any) => sum + (w.stats?.totalExecutions || 0), 0)
  const workflowsWithExecutions = workflows.filter((w: any) => (w.stats?.totalExecutions || 0) > 0)
  const avgSuccessRate = workflowsWithExecutions.length > 0
    ? Math.round(workflowsWithExecutions.reduce((sum: number, w: any) => sum + (w.stats?.successRate || 0), 0) / workflowsWithExecutions.length)
    : 0

  const summaryCards = [
    { label: 'Total Workflows', value: totalWorkflows, color: '#06B6D4' },
    { label: 'Active', value: activeWorkflows, color: '#22D3EE' },
    { label: 'Total Executions', value: totalExecutions, color: '#0891B2' },
    { label: 'Avg Success Rate', value: avgSuccessRate + '%', color: avgSuccessRate >= 80 ? '#22D3EE' : '#EAB308' },
  ]

  return (
    <CollapsibleSection title="Workflow Pipeline" icon={<Workflow className="w-3.5 h-3.5" style={{ color: '#06B6D4' }} />} count={totalWorkflows} accentColor="#06B6D4" defaultOpen={true} dataSrc="src/components/dashboard/workflow-stats-section.tsx">
      {/* Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
        {summaryCards.map((card) => (
          <div
            key={card.label}
            style={{
              position: 'relative',
              background: 'rgba(13, 13, 13, 0.9)',
              border: '1px solid rgba(51, 51, 51, 0.35)',
              borderRadius: 8,
              padding: '12px 14px',
              overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 2,
              background: card.color,
              opacity: 0.6,
            }} />
            <div style={{ fontSize: 9, color: '#64748B', marginBottom: 4, marginLeft: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {card.label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: card.color, marginLeft: 8, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Workflow list */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        maxHeight: 400,
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(6,182,212,0.35) transparent',
      }}>
        {workflows.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <Workflow style={{ width: 32, height: 32, color: '#4B5563', margin: '0 auto 8px' }} />
            <p style={{ fontSize: 11, color: '#64748B' }}>No workflows found</p>
            <p style={{ fontSize: 9, color: '#4B5563', marginTop: 4 }}>Create workflows from the Workflow Pipeline view</p>
          </div>
        )}

        {workflows.map((wf: any) => {
          const wfStatusColor = STATUS_COLORS[wf.status] || '#64748B'
          const steps = wf.steps || []
          return (
            <div
              key={wf.id}
              style={{
                background: 'rgba(13, 13, 13, 0.7)',
                border: '1px solid rgba(51, 51, 51, 0.35)',
                borderRadius: 8,
                padding: 14,
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${wfStatusColor}44`
                e.currentTarget.style.boxShadow = `0 0 16px ${wfStatusColor}10`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(51,51,51,0.35)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {wf.name}
                    </span>
                    <span style={{
                      fontSize: 7,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      padding: '2px 6px',
                      borderRadius: 3,
                      background: `${wfStatusColor}15`,
                      color: wfStatusColor,
                      border: `1px solid ${wfStatusColor}25`,
                    }}>
                      {wf.status}
                    </span>
                  </div>
                  <p style={{ fontSize: 9, color: '#64748B', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {wf.description}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 8, color: '#64748B' }}>Executions</div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#06B6D4', fontVariantNumeric: 'tabular-nums' }}>
                      {wf.stats?.totalExecutions || 0}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 8, color: '#64748B' }}>Success</div>
                    <div style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: (wf.stats?.successRate || 0) >= 80 ? '#22D3EE' : (wf.stats?.totalExecutions || 0) > 0 ? '#EAB308' : '#64748B',
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {(wf.stats?.totalExecutions || 0) > 0 ? `${wf.stats.successRate}%` : '—'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Steps pipeline */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}>
                {steps.map((step: any, idx: number) => {
                  const actionKey = step.action || 'process'
                  const dotColor = STEP_COLOR_MAP[actionKey] || '#06B6D4'
                  const isLast = idx === steps.length - 1
                  return (
                    <div key={step.id || idx} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 48 }}>
                        <span style={{
                          width: 14,
                          height: 14,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: `${dotColor}18`,
                          border: `1.5px solid ${dotColor}`,
                          boxShadow: `0 0 6px ${dotColor}25`,
                        }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: dotColor }} />
                        </span>
                        <span style={{
                          fontSize: 7,
                          color: '#64748B',
                          marginTop: 4,
                          textAlign: 'center',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          width: 48,
                        }} title={step.name}>
                          {step.name.length > 8 ? step.name.substring(0, 7) + '…' : step.name}
                        </span>
                      </div>
                      {!isLast && (
                        <div style={{
                          width: 16,
                          height: 1,
                          background: `linear-gradient(90deg, ${dotColor}, ${STEP_COLOR_MAP[steps[idx + 1]?.action || 'process'] || '#06B6D4'})`,
                          opacity: 0.35,
                          flexShrink: 0,
                        }} />
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Tags */}
              {wf.tags && wf.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 10 }}>
                  {wf.tags.map((tag: string) => (
                    <span key={tag} style={{
                      fontSize: 7,
                      padding: '2px 6px',
                      borderRadius: 3,
                      background: 'rgba(6,182,212,0.06)',
                      color: '#64748B',
                      border: '1px solid rgba(51,51,51,0.3)',
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* CTA */}
      {onOpenWorkflows && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
          <button
            onClick={onOpenWorkflows}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 18px',
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 600,
              background: 'rgba(6,182,212,0.1)',
              border: '1px solid rgba(6,182,212,0.3)',
              color: '#06B6D4',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 20px rgba(6,182,212,0.15)'
              e.currentTarget.style.borderColor = 'rgba(6,182,212,0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = 'rgba(6,182,212,0.3)'
            }}
          >
            <Workflow style={{ width: 14, height: 14 }} />
            View Workflows
            <ChevronRight style={{ width: 12, height: 12 }} />
          </button>
        </div>
      )}
    </CollapsibleSection>
  )
}