import type { Category } from '../domain/entry/values'

/** カテゴリの表示属性。フロント `src/lib/types.ts` の CategoryItem と一致させる。 */
export interface CategoryItem {
  key: Category
  label: string
  icon: string
  color: string
}

/** 固定カテゴリ参照（src/lib/data.ts の CATEGORIES に対応）。 */
export const CATEGORIES: readonly CategoryItem[] = [
  { key: 'work', label: '仕事', icon: 'laptop_mac', color: '#3b82f6' },
  { key: 'food', label: '食事', icon: 'restaurant', color: '#f97316' },
  { key: 'drink', label: '飲み会', icon: 'local_bar', color: '#ef4444' },
  { key: 'ex', label: '運動', icon: 'fitness_center', color: '#22c55e' },
  { key: 'move', label: '移動', icon: 'directions_subway', color: '#a78bfa' },
  { key: 'sleep', label: '睡眠', icon: 'bedtime', color: '#6366f1' },
  { key: 'diary', label: '日記', icon: 'menu_book', color: '#ec4899' },
  { key: 'money', label: '出費', icon: 'payments', color: '#14b8a6' },
  { key: 'other', label: 'その他', icon: 'more_horiz', color: '#a1a1aa' },
]

const BY_KEY = new Map<string, CategoryItem>(CATEGORIES.map((c) => [c.key, c]))

export function categoryDisplay(key: string): CategoryItem {
  return BY_KEY.get(key) ?? BY_KEY.get('other')!
}
