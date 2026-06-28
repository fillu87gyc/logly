import type {
  AIChip,
  CatBreakItem,
  CategoryItem,
  DayStripItem,
  Entry,
  SettingItem,
  StatBar,
  SummaryItem,
} from './types'

export const ENTRIES: Entry[] = [
  { time: '07:15', category: 'モーニング', icon: 'wb_sunny', color: '#f59e0b', title: '起床、コーヒー1杯', note: 'よく眠れた。8時間20分。', meta: [{ icon: 'local_cafe', text: 'ドリップ' }] },
  { time: '09:30', category: '仕事', icon: 'laptop_mac', color: '#3b82f6', title: 'デザインレビュー', note: '新機能の方向性を3人で合意。', meta: [{ icon: 'schedule', text: '90分' }, { icon: 'people', text: '3名' }] },
  { time: '12:40', category: '食事', icon: 'restaurant', color: '#f97316', title: '近所の定食屋でアジフライ', meta: [{ icon: 'payments', text: '¥980' }] },
  { time: '16:00', category: '運動', icon: 'fitness_center', color: '#22c55e', title: 'ジムでトレーニング', note: 'スクワット 80kg × 5 × 3。脚が重い。', meta: [{ icon: 'schedule', text: '55分' }, { icon: 'whatshot', text: '420 kcal' }] },
  { time: '19:30', category: '飲み会', icon: 'local_bar', color: '#ef4444', title: '居酒屋〈三六九〉でAさんと', note: '生3杯、ハイボール2杯。日本酒少し。', meta: [{ icon: 'payments', text: '¥4,200' }, { icon: 'place', text: '渋谷' }] },
  { time: '23:50', category: '日記', icon: 'menu_book', color: '#a78bfa', title: '今日のひとこと', note: '人と話すと頭の整理が進む。来週またやる。' },
]

export const TABS = [
  { key: 'home', icon: 'today', label: 'ホーム' },
  { key: 'calendar', icon: 'calendar_month', label: '記録' },
  { key: 'spacer', icon: '', label: '' },
  { key: 'stats', icon: 'insights', label: '統計' },
  { key: 'profile', icon: 'person_outline', label: 'マイ' },
] as const

export const DAYSTRIP: DayStripItem[] = [
  { dow: '日', day: '9' },
  { dow: '月', day: '10' },
  { dow: '火', day: '11' },
  { dow: '水', day: '12' },
  { dow: '木', day: '13' },
  { dow: '金', day: '14', today: true },
  { dow: '土', day: '15', future: true },
]

export const CAL_DOTS: Record<number, string[]> = {
  1: ['#3b82f6', '#f97316'],
  2: ['#22c55e', '#3b82f6', '#f97316'],
  3: ['#3b82f6', '#f97316', '#ef4444'],
  4: ['#22c55e', '#3b82f6'],
  5: ['#3b82f6', '#f97316'],
  6: ['#f97316', '#a78bfa'],
  7: ['#22c55e', '#a78bfa'],
  8: ['#3b82f6', '#f97316'],
  9: ['#22c55e', '#3b82f6', '#f97316'],
  10: ['#3b82f6', '#a78bfa'],
  11: ['#3b82f6', '#f97316', '#22c55e'],
  12: ['#3b82f6', '#ef4444', '#f97316'],
  13: ['#22c55e', '#3b82f6'],
  14: ['#22c55e', '#3b82f6', '#f97316', '#ef4444'],
}

export const LEGEND = [
  { color: '#22c55e', label: '運動' },
  { color: '#f97316', label: '食事' },
  { color: '#ef4444', label: '飲み会' },
  { color: '#3b82f6', label: '仕事' },
  { color: '#a78bfa', label: '日記' },
  { color: '#6366f1', label: '睡眠' },
]

export const STAT_BARS: StatBar[] = [
  { label: '月', total: 5, ex: 1, food: 3, work: 1 },
  { label: '火', total: 6, ex: 1, food: 3, work: 2 },
  { label: '水', total: 4, ex: 0, food: 2, work: 2 },
  { label: '木', total: 7, ex: 1, food: 3, work: 3 },
  { label: '金', total: 8, ex: 1, food: 3, work: 4, today: true },
  { label: '土', total: 0, ex: 0, food: 0, work: 0, future: true },
  { label: '日', total: 0, ex: 0, food: 0, work: 0, future: true },
]

export const CAT_BREAK: CatBreakItem[] = [
  { key: 'work', label: '仕事', icon: 'laptop_mac', color: '#3b82f6', count: 14, pct: 86 },
  { key: 'food', label: '食事', icon: 'restaurant', color: '#f97316', count: 12, pct: 74 },
  { key: 'ex', label: '運動', icon: 'fitness_center', color: '#22c55e', count: 4, pct: 32 },
  { key: 'drink', label: '飲み会', icon: 'local_bar', color: '#ef4444', count: 3, pct: 24 },
  { key: 'diary', label: '日記', icon: 'menu_book', color: '#a78bfa', count: 5, pct: 38 },
]

export const SETTINGS: SettingItem[] = [
  { icon: 'category', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', label: 'カテゴリを編集', sub: '6 件' },
  { icon: 'notifications_none', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'リマインダー', sub: '毎日 22:00' },
  { icon: 'auto_awesome', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', label: 'AI 自動整形', isToggle: true, on: true },
  { icon: 'lock_outline', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', label: 'パスコードロック', isToggle: true, on: false },
  { icon: 'cloud_sync', color: '#a1a1aa', bg: 'rgba(255,255,255,0.06)', label: 'バックアップと同期', sub: '5分前に同期' },
  { icon: 'help_outline', color: '#a1a1aa', bg: 'rgba(255,255,255,0.06)', label: 'ヘルプとフィードバック' },
]

export const SUMMARY: SummaryItem[] = [
  { icon: 'fitness_center', color: '#22c55e', label: '運動', value: '55分' },
  { icon: 'local_bar', color: '#ef4444', label: 'アルコール', value: '6杯' },
  { icon: 'payments', color: '#a1a1aa', label: '支出', value: '¥5,180' },
  { icon: 'bedtime', color: '#6366f1', label: '睡眠', value: '8h 20m' },
]

export const CATEGORIES: CategoryItem[] = [
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

export const AI_CHIPS: AIChip[] = [
  { icon: 'local_bar', color: '#ef4444', label: '飲み会', time: '19:30', detail: '居酒屋〈三六九〉でAさんと · ¥4,200' },
  { icon: 'restaurant', color: '#f97316', label: '食事', time: '19:30', detail: '生3杯・ハイボール2杯・刺身・焼鳥' },
  { icon: 'directions_subway', color: '#a78bfa', label: '移動', time: '23:10', detail: 'タクシーで帰宅 · ¥1,800' },
]

export const STAT_RANGES = [
  { key: 'w', label: '週' },
  { key: 'm', label: '月' },
  { key: 'y', label: '年' },
] as const
