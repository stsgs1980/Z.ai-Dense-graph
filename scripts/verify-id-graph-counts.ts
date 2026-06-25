/**
 * verify-id-graph-counts.ts
 *
 * Quick verification: count rows in IdNode / IdEdge / IdGraphSnapshot / Agent.
 * Used by verification-before-completion skill — fresh evidence before claims.
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const [nodeCount, edgeCount, snapshotCount, agentCount] = await Promise.all([
    prisma.idNode.count(),
    prisma.idEdge.count(),
    prisma.idGraphSnapshot.count(),
    prisma.agent.count(),
  ])

  console.log('=== ID-graph verification ===')
  console.log(`IdNode:           ${nodeCount}`)
  console.log(`IdEdge:           ${edgeCount}`)
  console.log(`IdGraphSnapshot:  ${snapshotCount}`)
  console.log(`Agent (legacy):   ${agentCount}`)

  // Expected per MIGRATION-PLAN.md §7 + ZAI-STS-008 addition (2026-06-25):
  //   60 → 61 nodes (added ZAI-STS-008 / skill-creator)
  //   113 → 114 edges (added ZAI-STS-008 → STD-SKILL-001)
  const expectedNodes = 61
  const expectedEdges = 114

  const nodeOk = nodeCount === expectedNodes
  const edgeOk = edgeCount === expectedEdges

  console.log('\n=== Expectations ===')
  console.log(`Nodes == ${expectedNodes}: ${nodeOk ? 'PASS' : 'FAIL'} (got ${nodeCount})`)
  console.log(`Edges == ${expectedEdges}: ${edgeOk ? 'PASS' : 'FAIL'} (got ${edgeCount})`)

  // Sample first 3 nodes + first 3 edges to prove data is real
  const sampleNodes = await prisma.idNode.findMany({ take: 3, orderBy: { id: 'asc' } })
  console.log('\n=== Sample IdNode (first 3) ===')
  for (const n of sampleNodes) {
    console.log(`  ${n.id} | repo=${n.repo} | prefix=${n.prefix} | title=${n.title?.slice(0, 60)}`)
  }

  const sampleEdges = await prisma.idEdge.findMany({ take: 3, orderBy: { id: 'asc' } })
  console.log('\n=== Sample IdEdge (first 3) ===')
  for (const e of sampleEdges) {
    console.log(`  ${e.sourceId} -> ${e.targetId} | type=${e.type}`)
  }

  await prisma.$disconnect()
  process.exit(nodeOk && edgeOk ? 0 : 1)
}

main().catch((err) => {
  console.error('Verification FAILED:', err)
  process.exit(2)
})
