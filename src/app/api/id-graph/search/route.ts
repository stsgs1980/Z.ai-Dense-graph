/**
 * GET /api/id-graph/search?from=ID&to=ID
 *
 * BFS shortest-path search between two IDs.
 * Returns the path as an ordered array of IDs.
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/shared/lib/db'
import { bfsShortestPath } from '@/features/id-graph/lib/bfs'

export async function GET(req: NextRequest) {
  const from = req.nextUrl.searchParams.get('from')
  const to = req.nextUrl.searchParams.get('to')

  if (!from || !to) {
    return NextResponse.json(
      { error: 'Missing "from" or "to" query parameter' },
      { status: 400 }
    )
  }

  const edges = await db.idEdge.findMany({
    select: { sourceId: true, targetId: true },
  })

  const result = bfsShortestPath(edges, from, to)

  return NextResponse.json({
    from,
    to,
    ...result,
    edgeCount: edges.length,
  })
}
