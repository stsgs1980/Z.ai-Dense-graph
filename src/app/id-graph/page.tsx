'use client'

import dynamic from 'next/dynamic'

const IdGraphView = dynamic(
  () => import('@/features/id-graph/components/id-graph-view').then((m) => m.IdGraphView),
  { ssr: false, loading: () => <div className="h-screen bg-slate-950" /> }
)

export default function IdGraphPage() {
  return <IdGraphView />
}
