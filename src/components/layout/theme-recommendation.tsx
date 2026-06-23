'use client'

import { useMemo } from 'react'
import { useLayoutTheme, getAllPresets } from '@/lib/layout/theme'
import { recommendThemes } from '@/lib/layout/recommend-theme'
import { TopRecommendation, OtherRecommendations, ThemeRecsShell } from './theme-recommendation-parts'

export function ThemeRecommendationPanel({ goal, onApply }: { goal: string; onApply?: (presetId: string) => void }) {
  const { tokens, preset, setPreset } = useLayoutTheme()
  const recs = useMemo(() => recommendThemes(goal, undefined, undefined), [goal])
  const topRec = recs[0]
  const allPresets = useMemo(() => {
    const map = new Map<string, { label: string; accent: string; bg: string }>()
    for (const p of getAllPresets()) map.set(p.id, { label: p.label, accent: p.accent, bg: p.bg })
    return map
  }, [])

  if (!topRec) return null
  const isActive = preset === topRec.presetId
  const meta = allPresets.get(topRec.presetId)

  return (
    <ThemeRecsShell tokens={tokens} goal={goal}>
      <TopRecommendation tokens={tokens} preset={preset} setPreset={setPreset} onApply={onApply} rec={topRec} meta={meta} isActive={isActive} />
      <OtherRecommendations tokens={tokens} preset={preset} setPreset={setPreset} recs={recs} />
    </ThemeRecsShell>
  )
}