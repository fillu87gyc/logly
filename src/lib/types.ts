export interface MetaItem {
  icon: string
  text: string
}

export interface Entry {
  time: string
  category: string
  icon: string
  color: string
  title: string
  note?: string
  meta?: MetaItem[]
}

export interface DayStripItem {
  dow: string
  day: string
  today?: boolean
  future?: boolean
}

export interface SummaryItem {
  icon: string
  color: string
  label: string
  value: string
}

export interface CategoryItem {
  key: string
  label: string
  icon: string
  color: string
}

export interface SettingItem {
  icon: string
  color: string
  bg: string
  label: string
  sub?: string
  isToggle?: boolean
  on?: boolean
}

export interface CatBreakItem {
  key: string
  label: string
  icon: string
  color: string
  count: number
  pct: number
}

export interface StatBar {
  label: string
  total: number
  ex: number
  food: number
  work: number
  today?: boolean
  future?: boolean
}

export interface AIChip {
  icon: string
  color: string
  label: string
  time: string
  detail: string
}

export type Tab = 'home' | 'calendar' | 'stats' | 'profile'
export type Modal = 'add' | 'ai' | 'detail' | null
