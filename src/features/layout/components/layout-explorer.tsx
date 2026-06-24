'use client'

import type { LayoutRecipe } from '@/features/layout/lib/layout/types'
import { useExplorerFilters, useExplorerSelection } from '@/features/layout/lib/layout/use-explorer'
import { GridPreview, ScoreGauge, CodeDrawer } from './ui'
import { ExplorerSidebar } from './explorer-sidebar'
import { ExplorerGridView } from './explorer-grid-view'
import { ExplorerListView } from './explorer-list-view'
import { useLayoutTheme } from '@/features/layout/lib/layout/theme'
import { ExplorerTopbar, ContentHeader, getCategoryColor } from './layout-explorer-parts'

export function VariantLayoutExplorer({ recipes }: { recipes: LayoutRecipe[] }) {
  const { tokens } = useLayoutTheme()
  const {
    selectedCategory, setSelectedCategory, activeLayer, setActiveLayer,
    viewTab, setViewTab, viewMode, setViewMode,
  } = useExplorerFilters()
  const {
    selectedRecipe, setSelectedRecipe, parsed, setParsed,
    ranked, filtered, selected, best, catCounts, input,
  } = useExplorerSelection(recipes, selectedCategory)

  const viewProps = { filtered, best, selectedRecipe, setSelectedRecipe, tokens }

  return (
    <div style={{ flex: 1, display: 'flex', background: tokens.bgDeep, color: tokens.textPrimary, overflow: 'hidden', transition: 'background 0.3s, color 0.3s' }}>
      <ExplorerSidebar
        recipeCount={recipes.length}
        selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory}
        activeLayer={activeLayer} onLayerChange={setActiveLayer}
        input={input} onGoalSelect={setParsed} catCounts={catCounts}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <ExplorerTopbar tokens={tokens} viewTab={viewTab} setViewTab={setViewTab} />
        <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
          <ContentHeader tokens={tokens} selectedCategory={selectedCategory} filtered={filtered} ranked={ranked} viewMode={viewMode} setViewMode={setViewMode} />
          {viewMode === 'grid' ? <ExplorerGridView {...viewProps} /> : <ExplorerListView {...viewProps} />}
        </div>
        {selected && <CodeDrawer recipe={selected.recipe} />}
      </div>
    </div>
  )
}

export { getCategoryColor }