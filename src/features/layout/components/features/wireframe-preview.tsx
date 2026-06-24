'use client'

import { useState } from 'react'
import type { LayoutRecipe } from '@/features/layout/lib/layout/types'
import { useLayoutTheme } from '@/features/layout/lib/layout/theme'
import { WireframeHeader, ViewportSwitcher, CanvasArea, InfoBar, VIEWPORTS } from './wireframe-parts'

interface WireframePreviewProps { recipe: LayoutRecipe; score?: number; showDetails?: boolean }

export function WireframePreview({ recipe, score, showDetails = true }: WireframePreviewProps) {
  const { tokens } = useLayoutTheme()
  const [viewport, setViewport] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const [expanded, setExpanded] = useState(false)

  const viewportWidth = VIEWPORTS.find(v => v.key === viewport)?.width ?? '100%'
  const templateKey = viewport === 'mobile' ? 'gridTemplateMobile' : viewport === 'tablet' ? 'gridTemplateTablet' : 'gridTemplate'
  const viewRecipe: LayoutRecipe = { ...recipe, gridTemplate: (recipe[templateKey] as LayoutRecipe['gridTemplate']) ?? recipe.gridTemplate }
  const catMeta = (recipe as any).category && (categoryMeta as any)[(recipe as any).category]

  return (
    <div style={{ backgroundColor: tokens.bgBase, border: `1px solid ${tokens.borderSubtle}`, borderRadius: tokens.cornerRadius, overflow: 'hidden', color: tokens.textPrimary, boxShadow: tokens.cardShadow, transition: 'all 0.3s' }}>
      <WireframeHeader tokens={tokens} recipe={recipe} score={score} showDetails={showDetails} catMeta={catMeta} setExpanded={setExpanded} />
      <ViewportSwitcher tokens={tokens} viewport={viewport} setViewport={setViewport} viewportWidth={viewportWidth} />
      <CanvasArea tokens={tokens} viewportWidth={viewportWidth} viewRecipe={viewRecipe} expanded={expanded} />
      {showDetails && <InfoBar tokens={tokens} recipe={recipe} score={score} expanded={expanded} />}
    </div>
  )
}