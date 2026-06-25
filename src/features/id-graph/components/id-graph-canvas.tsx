'use client'

/**
 * id-graph-canvas.tsx — React Flow canvas for ID-graph
 *
 * Features:
 *   - 3 layout modes: Flat (force), Clustered (by repo), Radial (by in-degree)
 *   - Click node -> selects, opens detail panel
 *   - Hover edge -> highlight
 *   - Zoom/pan/drag (React Flow built-in)
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  type Node,
  type Edge,
  type NodeMouseHandler,
  Position,
  useNodesState,
  useEdgesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import Dagre from 'dagre'
import type { IdGraphData, IdNodeDTO, LayoutMode } from '../lib/types'

const REPO_COLORS: Record<string, string> = {
  standards: '#06B6D4', // cyan
  guard: '#A855F7',     // purple
  'zai-skills': '#10B981', // emerald
}

const CATEGORY_SHAPES: Record<string, string> = {
  STD: 'circle',
  RULE: 'diamond',
  PROC: 'square',
  TOOL: 'hexagon',
  ZAI: 'triangle',
}

interface Props {
  data: IdGraphData
  layoutMode: LayoutMode
  selectedId: string | null
  onSelect: (id: string | null) => void
  pathHighlight: string[] | null
}

export function IdGraphCanvas({
  data,
  layoutMode,
  selectedId,
  onSelect,
  pathHighlight,
}: Props) {
  const { nodes: rawNodes, edges: rawEdges } = data

  const positionedNodes = useMemo(() => {
    return computeLayout(rawNodes, rawEdges, layoutMode)
  }, [rawNodes, rawEdges, layoutMode])

  const [nodes, setNodes, onNodesChange] = useNodesState(positionedNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  useEffect(() => {
    setNodes(positionedNodes)
  }, [positionedNodes, setNodes])

  useEffect(() => {
    const newEdges: Edge[] = rawEdges.map((e) => {
      const isInPath =
        pathHighlight &&
        ((pathHighlight.includes(e.sourceId) &&
          pathHighlight.includes(e.targetId)) ||
          (pathHighlight.includes(e.targetId) &&
            pathHighlight.includes(e.sourceId) &&
            areAdjacentInPath(pathHighlight, e.sourceId, e.targetId)))

      const isSelected =
        selectedId && (e.sourceId === selectedId || e.targetId === selectedId)

      return {
        id: e.id,
        source: e.sourceId,
        target: e.targetId,
        type: 'default',
        animated: isSelected || isInPath || false,
        style: {
          stroke: e.type === 'Aligned_with' ? '#F59E0B' : '#475569',
          strokeWidth: isSelected ? 2.5 : isInPath ? 2 : 1,
          opacity: selectedId && !isSelected ? 0.25 : 1,
        },
      }
    })
    setEdges(newEdges)
  }, [rawEdges, selectedId, pathHighlight, setEdges])

  const onNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      onSelect(node.id === selectedId ? null : node.id)
    },
    [onSelect, selectedId]
  )

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={onNodeClick}
      fitView
      minZoom={0.1}
      maxZoom={3}
      proOptions={{ hideAttribution: true }}
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1E293B" />
      <Controls className="!bg-slate-900 !border-slate-700" />
      <MiniMap
        className="!bg-slate-900"
        nodeColor={(n) => (n.data?.color as string) || '#475569'}
        maskColor="rgba(0,0,0,0.7)"
      />
      <Panel position="top-left" className="!bg-slate-900/80 !px-3 !py-2 !rounded !text-xs !text-slate-300 !border !border-slate-700">
        <div className="flex items-center gap-3">
          {Object.entries(REPO_COLORS).map(([repo, color]) => (
            <span key={repo} className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: color }} />
              {repo}
            </span>
          ))}
          <span className="text-slate-500">|</span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-0.5 bg-amber-500" /> Aligned_with
          </span>
        </div>
      </Panel>
    </ReactFlow>
  )
}

// ─── Layouts ───────────────────────────────────────────────────────────────

function computeLayout(
  nodes: IdNodeDTO[],
  edges: { sourceId: string; targetId: string }[],
  mode: LayoutMode
): Node[] {
  if (mode === 'flat') return flatLayout(nodes, edges)
  if (mode === 'clustered') return clusteredLayout(nodes)
  if (mode === 'radial') return radialLayout(nodes)
  return flatLayout(nodes, edges)
}

function flatLayout(
  nodes: IdNodeDTO[],
  edges: { sourceId: string; targetId: string }[]
): Node[] {
  // Use Dagre for deterministic layout
  const g = new Dagre.graphlib.Graph()
  g.setGraph({ rankdir: 'LR', ranksep: 80, nodesep: 30, marginx: 40, marginy: 40 })
  g.setDefaultEdgeLabel(() => ({}))

  nodes.forEach((n) => {
    g.setNode(n.id, { width: 160, height: 40 })
  })
  edges.forEach((e) => {
    if (g.hasNode(e.sourceId) && g.hasNode(e.targetId)) {
      g.setEdge(e.sourceId, e.targetId)
    }
  })

  Dagre.layout(g)

  return nodes.map((n) => {
    const pos = g.node(n.id)
    return {
      id: n.id,
      type: 'default',
      position: { x: pos.x - 80, y: pos.y - 20 },
      data: {
        label: n.id,
        title: n.title,
        category: n.category,
        repo: n.repo,
        color: REPO_COLORS[n.repo] || '#475569',
        shape: CATEGORY_SHAPES[n.category] || 'circle',
      },
      style: {
        background: '#0F172A',
        color: REPO_COLORS[n.repo] || '#E2E8F0',
        border: `2px solid ${REPO_COLORS[n.repo] || '#475569'}`,
        borderRadius: '6px',
        fontSize: '11px',
        fontFamily: 'ui-monospace, monospace',
        padding: '4px 8px',
        width: 160,
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    }
  })
}

function clusteredLayout(nodes: IdNodeDTO[]): Node[] {
  // 3 clusters: standards (left), guard (center), zai-skills (right)
  const clusters: Record<string, { x: number; y: number }> = {
    standards: { x: 0, y: 0 },
    guard: { x: 600, y: 0 },
    'zai-skills': { x: 1200, y: 0 },
  }

  const byRepo: Record<string, IdNodeDTO[]> = {}
  nodes.forEach((n) => {
    if (!byRepo[n.repo]) byRepo[n.repo] = []
    byRepo[n.repo].push(n)
  })

  const result: Node[] = []
  for (const [repo, items] of Object.entries(byRepo)) {
    const center = clusters[repo] || { x: 0, y: 0 }
    // Spiral layout within cluster
    items.forEach((n, i) => {
      const angle = (i / items.length) * 2 * Math.PI
      const radius = 50 + Math.sqrt(i) * 25
      result.push({
        id: n.id,
        type: 'default',
        position: {
          x: center.x + radius * Math.cos(angle) - 80,
          y: center.y + radius * Math.sin(angle) - 20,
        },
        data: {
          label: n.id,
          title: n.title,
          category: n.category,
          repo: n.repo,
          color: REPO_COLORS[n.repo] || '#475569',
          shape: CATEGORY_SHAPES[n.category] || 'circle',
        },
        style: {
          background: '#0F172A',
          color: REPO_COLORS[n.repo] || '#E2E8F0',
          border: `2px solid ${REPO_COLORS[n.repo] || '#475569'}`,
          borderRadius: '6px',
          fontSize: '11px',
          fontFamily: 'ui-monospace, monospace',
          padding: '4px 8px',
          width: 160,
        },
      })
    })
  }
  return result
}

function radialLayout(nodes: IdNodeDTO[]): Node[] {
  // Concentric rings by in-degree. Top hub at center.
  const sorted = [...nodes].sort((a, b) => b.inDeg - a.inDeg)

  const rings: IdNodeDTO[][] = []
  const ringSizes = [1, 4, 8, 12, 16, 19] // ring 0 = top hub
  let idx = 0
  for (const size of ringSizes) {
    const ring: IdNodeDTO[] = []
    for (let i = 0; i < size && idx < sorted.length; i++) {
      ring.push(sorted[idx++])
    }
    if (ring.length > 0) rings.push(ring)
  }

  const result: Node[] = []
  rings.forEach((ring, ringIdx) => {
    const radius = ringIdx * 130
    if (ringIdx === 0) {
      // Center node
      const n = ring[0]
      result.push(makeRadialNode(n, 0, 0))
    } else {
      const angleStep = (2 * Math.PI) / ring.length
      ring.forEach((n, i) => {
        const angle = i * angleStep
        result.push(makeRadialNode(n, radius * Math.cos(angle), radius * Math.sin(angle)))
      })
    }
  })

  return result
}

function makeRadialNode(n: IdNodeDTO, x: number, y: number): Node {
  return {
    id: n.id,
    type: 'default',
    position: { x: x - 80, y: y - 20 },
    data: {
      label: n.id,
      title: n.title,
      category: n.category,
      repo: n.repo,
      color: REPO_COLORS[n.repo] || '#475569',
      shape: CATEGORY_SHAPES[n.category] || 'circle',
    },
    style: {
      background: '#0F172A',
      color: REPO_COLORS[n.repo] || '#E2E8F0',
      border: `2px solid ${REPO_COLORS[n.repo] || '#475569'}`,
      borderRadius: '6px',
      fontSize: '11px',
      fontFamily: 'ui-monospace, monospace',
      padding: '4px 8px',
      width: 160,
    },
  }
}

function areAdjacentInPath(path: string[], a: string, b: string): boolean {
  for (let i = 0; i < path.length - 1; i++) {
    if (
      (path[i] === a && path[i + 1] === b) ||
      (path[i] === b && path[i + 1] === a)
    ) {
      return true
    }
  }
  return false
}
