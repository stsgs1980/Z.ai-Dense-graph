'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import DashboardPanel from './dashboard-panel'
import AgentHierarchy from '@/features/hierarchy/components/agent-hierarchy-v2'
import WorkflowPipeline from '@/features/workflows/components/workflow-pipeline'

const IdGraphView = dynamic(
  () => import('@/features/id-graph/components/id-graph-view').then((m) => m.IdGraphView),
  { ssr: false, loading: () => <div className="h-screen bg-slate-950" /> }
)

type View = 'dashboard' | 'hierarchy' | 'workflows' | 'id-graph'

export default function Home() {
  const [activeView, setActiveView] = useState<View>('dashboard')

  if (activeView === 'hierarchy') return <AgentHierarchy onBack={() => setActiveView('dashboard')} />
  if (activeView === 'workflows') return <WorkflowPipeline onBack={() => setActiveView('dashboard')} onOpenHierarchy={() => setActiveView('hierarchy')} fullPage />
  if (activeView === 'id-graph') return <IdGraphView onBack={() => setActiveView('dashboard')} />

  return (
    <DashboardPanel
      onOpenHierarchy={() => setActiveView('hierarchy')}
      onOpenWorkflows={() => setActiveView('workflows')}
      onOpenIdGraph={() => setActiveView('id-graph')}
    />
  )
}
