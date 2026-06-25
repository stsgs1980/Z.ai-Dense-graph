/**
 * lib/types.ts — shared types for ID-graph feature
 */

export type IdCategory = 'STD' | 'RULE' | 'PROC' | 'TOOL' | 'ZAI'
export type IdRepo = 'standards' | 'guard' | 'zai-skills'
export type EdgeType = 'Related' | 'Aligned_with'

export interface IdNodeDTO {
  id: string
  title: string
  category: IdCategory
  repo: IdRepo
  version: string
  status: string
  level: string | null
  filePath: string | null
  owningStandard: string | null
  description: string
  inDeg: number
  outDeg: number
}

export interface IdEdgeDTO {
  id: string
  sourceId: string
  targetId: string
  type: EdgeType
}

export interface IdGraphSnapshotDTO {
  capturedAt: string
  platformTag: string
  standardsSha: string
  guardSha: string
  skillsSha: string
  counts: Record<string, number>
  edges: Record<string, number>
  topHubs: Array<{ id: string; inDeg: number }>
  isolated: string[]
}

export interface IdGraphData {
  nodes: IdNodeDTO[]
  edges: IdEdgeDTO[]
  snapshot: IdGraphSnapshotDTO | null
}

export type LayoutMode = 'flat' | 'clustered' | 'radial'

export interface BfsPath {
  path: string[]
  found: boolean
  hops: number
}
