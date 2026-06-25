/**
 * verify-zai-sts-008.ts
 *
 * Focused verification: confirm ZAI-STS-008 (skill-creator) was added
 * to the ID-graph with the correct edge to STD-SKILL-001.
 *
 * Run: bun scripts/verify-zai-sts-008.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('=== ZAI-STS-008 verification ===\n')

  // 1. Node exists
  const node = await prisma.idNode.findUnique({
    where: { id: 'ZAI-STS-008' },
    include: {
      outEdges: { select: { targetId: true, type: true } },
      inEdges: { select: { sourceId: true, type: true } },
    },
  })

  if (!node) {
    console.log('FAIL: ZAI-STS-008 node not found in DB')
    process.exit(1)
  }

  console.log('Node found:')
  console.log(`  id:               ${node.id}`)
  console.log(`  title:            ${node.title}`)
  console.log(`  category:         ${node.category}`)
  console.log(`  repo:             ${node.repo}`)
  console.log(`  filePath:         ${node.filePath}`)
  console.log(`  owningStandard:   ${node.owningStandard}`)
  console.log(`  outDeg:           ${node.outEdges.length}`)
  console.log(`  inDeg:            ${node.inEdges.length}`)

  // 2. Edge to STD-SKILL-001 exists
  const edgeToSkill = node.outEdges.find((e) => e.targetId === 'STD-SKILL-001')
  if (edgeToSkill) {
    console.log(`\nEdge to STD-SKILL-001: FOUND (type=${edgeToSkill.type})`)
  } else {
    console.log('\nFAIL: No edge ZAI-STS-008 → STD-SKILL-001')
    process.exit(1)
  }

  // 3. STD-SKILL-001 inDeg should be 26 (was 25, +1 from new edge)
  const skill001 = await prisma.idNode.findUnique({
    where: { id: 'STD-SKILL-001' },
    include: { inEdges: { select: { sourceId: true } } },
  })
  if (skill001) {
    console.log(`\nSTD-SKILL-001 inDeg: ${skill001.inEdges.length} (expected 26)`)
    if (skill001.inEdges.length === 26) {
      console.log('  PASS: inDeg incremented correctly')
    } else {
      console.log('  WARN: inDeg mismatch')
    }
    // Verify ZAI-STS-008 is in the inEdges
    const hasNewEdge = skill001.inEdges.some((e) => e.sourceId === 'ZAI-STS-008')
    console.log(`  ZAI-STS-008 in inEdges: ${hasNewEdge ? 'YES' : 'NO'}`)
  }

  // 4. Total counts
  const [totalNodes, totalEdges, zaiCount] = await Promise.all([
    prisma.idNode.count(),
    prisma.idEdge.count(),
    prisma.idNode.count({ where: { category: 'ZAI' } }),
  ])
  console.log(`\nTotal counts:`)
  console.log(`  Nodes: ${totalNodes} (expected 61)`)
  console.log(`  Edges: ${totalEdges} (expected 114)`)
  console.log(`  ZAI nodes: ${zaiCount} (expected 25)`)

  const allPass =
    totalNodes === 61 &&
    totalEdges === 114 &&
    zaiCount === 25 &&
    !!edgeToSkill

  console.log(`\n=== Overall: ${allPass ? 'ALL PASS' : 'FAILURES'} ===`)
  await prisma.$disconnect()
  process.exit(allPass ? 0 : 1)
}

main().catch((err) => {
  console.error('Verification FAILED:', err)
  process.exit(2)
})
