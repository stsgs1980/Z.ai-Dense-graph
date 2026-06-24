// Data accessor — anti-monolith Rule 3 (no data fetching in components)
import type { LayoutRecipe } from '@/features/layout/lib/layout/types'
import recipesData from '@/shared/config/recipes.json'

export const recipes = recipesData as LayoutRecipe[]
