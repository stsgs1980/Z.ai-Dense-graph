/**
 * seed-id-graph.ts
 *
 * Populates the IdNode + IdEdge + IdGraphSnapshot tables from
 * data/id-graph-full.json (the canonical 60-ID / 113-edge snapshot
 * extracted from Z-ai-platform submodules).
 *
 * Usage:
 *   npx tsx scripts/seed-id-graph.ts
 *
 * Or via package.json:
 *   npm run seed:id-graph
 */

import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const prisma = new PrismaClient()

interface GraphNode {
  id: string
  repo: string
  file: string
  title: string
  prefix: string
  out_deg: number
  in_deg: number
  total_deg: number
}

interface GraphLink {
  src: string
  tgt: string
  src_repo: string
  tgt_repo: string
  type: string // "related" | "aligned_with"
}

interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
  summary: {
    ids_total: number
    related_edges: number
    aligned_edges: number
    total_edges: number
    prefixes: Record<string, number>
    by_repo: Record<string, number>
  }
}

function categoryFromPrefix(prefix: string): string {
  // STD, RULE, PROC, TOOL, ZAI — all categories
  return prefix
}

function levelFromId(id: string): string | null {
  // RULE-* only — level field comes from registry.json, but we don't have
  // it in id-graph-full.json. Leave null; UI can fill from registry.json
  // via /api/id-graph/[id].
  return null
}

function owningStandardGuess(id: string): string | null {
  if (id.startsWith('STD-META-001')) return null
  if (id.startsWith('STD-')) return 'STD-META-001'
  if (id.startsWith('RULE-') || id.startsWith('PROC-') || id.startsWith('TOOL-')) {
    return 'STD-META-001'
  }
  if (id.startsWith('ZAI-')) return 'STD-SKILL-001'
  return null
}

async function main() {
  const dataPath = resolve(process.cwd(), 'data/id-graph-full.json')
  console.log(`[seed] Loading ${dataPath}`)
  const raw = readFileSync(dataPath, 'utf-8')
  const data: GraphData = JSON.parse(raw)

  console.log(`[seed] Loaded: ${data.nodes.length} nodes, ${data.links.length} edges`)
  console.log(`[seed] Summary: ${JSON.stringify(data.summary)}`)

  // Wipe existing
  console.log('[seed] Wiping IdEdge, IdNode, IdGraphSnapshot...')
  await prisma.idEdge.deleteMany()
  await prisma.idNode.deleteMany()
  await prisma.idGraphSnapshot.deleteMany()

  // Upsert nodes
  console.log('[seed] Upserting nodes...')
  for (const node of data.nodes) {
    await prisma.idNode.upsert({
      where: { id: node.id },
      create: {
        id: node.id,
        title: node.title,
        category: categoryFromPrefix(node.prefix),
        repo: node.repo,
        filePath: node.file,
        level: levelFromId(node.id),
        owningStandard: owningStandardGuess(node.id),
        description: '',
      },
      update: {
        title: node.title,
        category: categoryFromPrefix(node.prefix),
        repo: node.repo,
        filePath: node.file,
      },
    })
  }
  console.log(`[seed] OK: ${data.nodes.length} nodes upserted`)

  // Upsert edges
  console.log('[seed] Upserting edges...')
  let edgeCount = 0
  for (const link of data.links) {
    const type = link.type === 'aligned_with' ? 'Aligned_with' : 'Related'
    try {
      await prisma.idEdge.upsert({
        where: {
          sourceId_targetId_type: {
            sourceId: link.src,
            targetId: link.tgt,
            type,
          },
        },
        create: {
          sourceId: link.src,
          targetId: link.tgt,
          type,
        },
        update: {},
      })
      edgeCount++
    } catch (e) {
      console.warn(`[seed] WARN: failed edge ${link.src} -> ${link.tgt} (${type}): ${e}`)
    }
  }
  console.log(`[seed] OK: ${edgeCount} edges upserted`)

  // Snapshot
  console.log('[seed] Writing snapshot...')
  const platformTag = 'v2.6.0'
  const standardsSha = '1967ca4'
  const guardSha = 'f8745f0'
  const skillsSha = '9797e69'

  // Top hubs by in-degree
  const inDeg: Record<string, number> = {}
  for (const link of data.links) {
    inDeg[link.tgt] = (inDeg[link.tgt] || 0) + 1
  }
  const topHubs = Object.entries(inDeg)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, deg]) => ({ id, inDeg: deg }))

  // Isolated nodes (no edges)
  const allNodeIds = new Set(data.nodes.map((n) => n.id))
  const connectedIds = new Set<string>([
    ...data.links.map((l) => l.src),
    ...data.links.map((l) => l.tgt),
  ])
  const isolated = [...allNodeIds].filter((id) => !connectedIds.has(id))

  await prisma.idGraphSnapshot.create({
    data: {
      platformTag,
      standardsSha,
      guardSha,
      skillsSha,
      countsJson: JSON.stringify({
        ...data.summary.prefixes,
        PROC: 4,
        TOOL: 6,
        total: data.summary.ids_total,
      }),
      edgesJson: JSON.stringify({
        Related: data.summary.related_edges,
        Aligned_with: data.summary.aligned_edges,
        total: data.summary.total_edges,
      }),
      topHubsJson: JSON.stringify(topHubs),
      isolatedJson: JSON.stringify(isolated),
    },
  })

  console.log(`[seed] OK: snapshot written`)
  console.log(`[seed] Top hubs: ${JSON.stringify(topHubs)}`)
  console.log(`[seed] Isolated IDs: ${isolated.length === 0 ? 'none' : isolated.join(', ')}`)
  console.log('[seed] DONE.')
}

main()
  .catch((e) => {
    console.error('[seed] FAIL:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
