'use client'

import type { LayoutRecipe } from '@/features/layout/lib/layout/types'
import { useProjectTheme } from '@/features/layout/lib/layout/project-theme'
import { radius } from '@/features/layout/lib/layout/tokens'
import { GridCodeBlock } from './grid-code-block'
import { colors } from '@/features/layout/lib/layout/tokens'

// ─── Region Classification ──────────────────────────────────

const FEATURED = new Set(['hero','featured','primary','main','center','major','wide','foreground'])
function isFeatured(name: string) {
  if (FEATURED.has(name)) return true
  const n = name.match(/\d+$/)
  if (n && parseInt(n[0]) === 1 && /^(tile|section|step)-/.test(name)) return true
  return false
}

// ─── GridPreview — Spacious Component Browser Style ──────────

interface GridPreviewProps {
  recipe: LayoutRecipe
  compact?: boolean
  showCode?: boolean
  className?: string
}

function extractSlots(template: any, regions: any[]): { slots: string[]; slotIndex: Map<string, number>; rowCount: number } {
  const areaNames = new Set<string>()
  if (template.areas)
    for (const row of template.areas) for (const name of row.split(/\s+/)) if (name && name !== '.') areaNames.add(name)
  const slots = template.areas ? Array.from(areaNames) : regions.map(r => r.name)
  return { slots, slotIndex: new Map(slots.map((n, i) => [n, i + 1])), rowCount: template.areas ? template.areas.length : (template.rows ? template.rows.split(/\s+/).length : 1) }
}

function SlotCell({ name, idx, feat, compact, template, tokens }: { name: string; idx: number; feat: boolean; compact: boolean | undefined; template: any; tokens: any }) {
  return (
    <div key={name} style={{
      gridArea: template.areas ? name : undefined,
      backgroundColor: feat ? tokens.cellFeaturedBg : tokens.cellBg,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 2, padding: compact ? 3 : 8, borderRadius: compact ? 2 : tokens.radius.md, transition: 'all 0.3s',
    }}>
      <span style={{ fontFamily: tokens.fontFamilyMono, fontSize: compact ? 8 : 12, fontWeight: 700, color: tokens.accentPrimary, lineHeight: 1 }}>{idx}</span>
      <span style={{ fontFamily: tokens.fontFamilyMono, fontSize: compact ? 5 : 8, fontWeight: 500, color: feat ? tokens.cellFeaturedText : tokens.cellText, textTransform: 'lowercase' as const, lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{name}</span>
    </div>
  )
}

export function GridPreview({ recipe, compact, showCode, className }: GridPreviewProps) {
  const { tokens } = useProjectTheme()
  const { slots, slotIndex, rowCount } = extractSlots(recipe.gridTemplate, recipe.regions)
  const shouldShowCode = showCode !== false && !compact
  const gridStyle = {
    display: 'grid', gridTemplateColumns: recipe.gridTemplate.columns, gap: compact ? 2 : 3,
    ...(compact ? { height: '100%', gridTemplateRows: `repeat(${rowCount}, 1fr)` } : { minHeight: 240, gridTemplateRows: recipe.gridTemplate.rows || undefined }),
    gridTemplateAreas: recipe.gridTemplate.areas ? recipe.gridTemplate.areas.map(a => `"${a}"`).join(' ') : undefined,
    borderRadius: compact ? radius.lg : radius['2xl'], overflow: 'hidden', transition: 'all 0.3s',
  }
  return (
    <div className={className ?? ''} style={{ width: '100%', height: '100%' }}>
      <div style={gridStyle}>{slots.map(name => <SlotCell key={name} name={name} idx={slotIndex.get(name) ?? 0} feat={isFeatured(name)} compact={compact} template={recipe.gridTemplate} tokens={tokens} />)}</div>
      {shouldShowCode && <GridCodeBlock recipe={recipe} />}
    </div>
  )
}

// ─── Region Fill Helper (backwards compat) ──────────────────

const Z700 = colors.zinc[700], Z800 = colors.zinc[800]
const E900 = colors.emerald[900], A900 = colors.amber[900]

const regionFills: Record<string, string> = {
  header:Z700,footer:Z700,sidebar:Z800,aside:Z800,main:E900,content:E900,
  hero:A900,featured:A900,primary:E900,secondary:Z700,left:Z800,right:Z800,
  center:E900,minor:Z700,major:E900,medium:Z700,wide:E900,narrow:Z800,
  background:Z800,foreground:E900,
}
const numFills = [Z700, Z800, E900, A900]

export function getRegionFill(name: string): string {
  if (regionFills[name]) return regionFills[name]
  const prefix = name.replace(/[-_]\d+$/, '')
  if (regionFills[prefix]) return regionFills[prefix]
  const numMatch = name.match(/\d+/)
  if (numMatch && /^(tile|section|step|card|feature|col)-/.test(name)) {
    return numFills[(parseInt(numMatch[0]) - 1) % numFills.length]
  }
  if (name.includes('top-')) return Z700
  if (name.includes('mid-')) return E900
  if (name.includes('bottom-')) return Z800
  return Z700
}
