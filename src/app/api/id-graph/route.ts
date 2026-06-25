/**
 * GET /api/id-graph
 *
 * Returns the full ID-graph: 60 nodes + 113 edges + latest snapshot.
 */

import { NextResponse } from 'next/server'
import { db } from '@/shared/lib/db'
import type { IdGraphData, IdNodeDTO, IdEdgeDTO } from '@/features/id-graph/lib/types'

export async function GET() {
  const [nodes, edges, snapshot] = await Promise.all([
    db.idNode.findMany({
      include: {
        outEdges: { select: { targetId: true } },
        inEdges: { select: { sourceId: true } },
      },
    }),
    db.idEdge.findMany(),
    db.idGraphSnapshot.findFirst({
      orderBy: { capturedAt: 'desc' },
    }),
  ])

  const nodeDTOs: IdNodeDTO[] = nodes.map((n) => ({
    id: n.id,
    title: n.title,
    category: n.category as IdNodeDTO['category'],
    repo: n.repo as IdNodeDTO['repo'],
    version: n.version,
    status: n.status,
    level: n.level,
    filePath: n.filePath,
    owningStandard: n.owningStandard,
    description: n.description,
    outDeg: n.outEdges.length,
    inDeg: n.inEdges.length,
  }))

  const edgeDTOs: IdEdgeDTO[] = edges.map((e) => ({
    id: e.id,
    sourceId: e.sourceId,
    targetId: e.targetId,
    type: e.type as IdEdgeDTO['type'],
  }))

  const data: IdGraphData = {
    nodes: nodeDTOs,
    edges: edgeDTOs,
    snapshot: snapshot
      ? {
          capturedAt: snapshot.capturedAt.toISOString(),
          platformTag: snapshot.platformTag,
          standardsSha: snapshot.standardsSha,
          guardSha: snapshot.guardSha,
          skillsSha: snapshot.skillsSha,
          counts: JSON.parse(snapshot.countsJson),
          edges: JSON.parse(snapshot.edgesJson),
          topHubs: JSON.parse(snapshot.topHubsJson),
          isolated: JSON.parse(snapshot.isolatedJson),
        }
      : null,
  }

  return NextResponse.json(data)
}
