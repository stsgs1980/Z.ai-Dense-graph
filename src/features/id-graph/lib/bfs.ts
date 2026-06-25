/**
 * lib/bfs.ts — BFS shortest-path search over ID-graph
 *
 * Used by /api/id-graph/search?from=...&to=...
 * Returns the shortest undirected path between two IDs.
 */

import type { BfsPath } from './types'

interface Edge {
  sourceId: string
  targetId: string
}

export function bfsShortestPath(
  edges: Edge[],
  fromId: string,
  toId: string
): BfsPath {
  if (fromId === toId) {
    return { path: [fromId], found: true, hops: 0 }
  }

  // Build undirected adjacency
  const adj = new Map<string, Set<string>>()
  for (const e of edges) {
    if (!adj.has(e.sourceId)) adj.set(e.sourceId, new Set())
    if (!adj.has(e.targetId)) adj.set(e.targetId, new Set())
    adj.get(e.sourceId)!.add(e.targetId)
    adj.get(e.targetId)!.add(e.sourceId)
  }

  if (!adj.has(fromId) || !adj.has(toId)) {
    return { path: [], found: false, hops: 0 }
  }

  // BFS
  const queue: Array<{ id: string; path: string[] }> = [
    { id: fromId, path: [fromId] },
  ]
  const visited = new Set<string>([fromId])

  while (queue.length > 0) {
    const { id, path } = queue.shift()!
    const neighbors = adj.get(id) || new Set<string>()

    for (const next of neighbors) {
      if (visited.has(next)) continue
      visited.add(next)

      const newPath = [...path, next]
      if (next === toId) {
        return { path: newPath, found: true, hops: newPath.length - 1 }
      }

      queue.push({ id: next, path: newPath })
    }
  }

  return { path: [], found: false, hops: 0 }
}
