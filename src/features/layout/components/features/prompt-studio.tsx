'use client'
import { useMemo } from 'react'
import type { LayoutRecipe, LayoutAdviceInput } from '@/features/layout/lib/layout/types'
import { scoreLayout } from '@/features/layout/lib/layout/scoring'
import { scoreLayoutMulti } from '@/features/layout/lib/layout/scoring-multi'
import { useLayoutTheme } from '@/features/layout/lib/layout/theme'
import { spacing } from '@/features/layout/lib/layout/tokens'
import { useAiPrompt } from '@/features/layout/lib/layout/use-ai-prompt'
import {
  PromptStudioHero, PromptInputSection, ExampleChips,
  PipelineSection, BestMatchSection, EmptyStudioState,
} from './prompt-studio-parts'

export function VariantPromptStudio({ recipes }: { recipes: LayoutRecipe[] }) {
  const { tokens } = useLayoutTheme()
  const { prompt, setPrompt, parsed, ai, handleSubmit, toggleAiMode } = useAiPrompt()

  const input: LayoutAdviceInput = parsed
    ? { goal: parsed.goal, contentType: parsed.contentType, itemCount: parsed.itemCount, needsSidebar: parsed.needsSidebar, needsHeader: parsed.needsHeader, needsFooter: parsed.needsFooter }
    : { goal: 'landing', contentType: 'cards', itemCount: 6, needsHeader: true }

  const goalWeights = parsed?.goalWeights ?? { [input.goal]: 1 }
  const isMultiGoal = Object.keys(goalWeights).filter(g => goalWeights[g] > 0).length > 1
  const ranked = useMemo(() => {
    if (isMultiGoal && parsed) return recipes.map(r => scoreLayoutMulti(r, input, goalWeights)).sort((a, b) => b.score - a.score)
    return recipes.map(r => scoreLayout(r, input)).sort((a, b) => b.score - a.score)
  }, [recipes, input, isMultiGoal, parsed, goalWeights])

  const best = ranked[0] ?? null
  const top3 = ranked.filter(r => r.verdict === 'recommended').slice(0, 3)

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
      paddingTop: spacing['3xl'], paddingBottom: spacing['4xl'], paddingInline: spacing.xl,
      background: tokens.bgDeep, color: tokens.textPrimary, transition: 'background 0.3s, color 0.3s',
    }}>
      <PromptStudioHero tokens={tokens} />
      <PromptInputSection tokens={tokens} prompt={prompt} setPrompt={setPrompt} ai={ai} handleSubmit={handleSubmit} toggleAiMode={toggleAiMode} />
      {!ai.submitted && <ExampleChips tokens={tokens} setPrompt={setPrompt} handleSubmit={handleSubmit} />}
      {ai.submitted && parsed && (
        <PipelineSection tokens={tokens} prompt={prompt} parsed={parsed} ranked={ranked} best={best} isMultiGoal={isMultiGoal} goalWeights={goalWeights} ai={ai} input={input} />
      )}
      {ai.submitted && best && <BestMatchSection tokens={tokens} best={best} top3={top3} />}
      {!ai.submitted && <EmptyStudioState tokens={tokens} />}
    </div>
  )
}