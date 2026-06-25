/**
 * GET /api/id-graph/[id]
 *
 * Returns a single ID node + its in/out edges + neighbor node summaries.
 */

import { NextResponse } from 'next/server'
import { db } from '@/shared/lib/db'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const node = await db.idNode.findUnique({
    where: { id },
    include: {
      outEdges: { include: { target: true } },
      inEdges: { include: { source: true } },
    },
  })

  if (!node) {
    return NextResponse.json({ error: 'ID not found', id }, { status: 404 })
  }

  const outNeighbors = node.outEdges.map((e) => ({
    id: e.target.id,
    title: e.target.title,
    category: e.target.category,
    repo: e.target.repo,
    edgeType: e.type,
    direction: 'out' as const,
  }))

  const inNeighbors = node.inEdges.map((e) => ({
    id: e.source.id,
    title: e.source.title,
    category: e.source.category,
    repo: e.source.repo,
    edgeType: e.type,
    direction: 'in' as const,
  }))

  return NextResponse.json({
    node: {
      id: node.id,
      title: node.title,
      category: node.category,
      repo: node.repo,
      version: node.version,
      status: node.status,
      level: node.level,
      filePath: node.filePath,
      owningStandard: node.owningStandard,
      description: node.description,
    },
    neighbors: {
      out: outNeighbors,
      in: inNeighbors,
      totalOut: outNeighbors.length,
      totalIn: inNeighbors.length,
    },
  })
}
