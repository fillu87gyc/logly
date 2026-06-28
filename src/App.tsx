import { useEffect, useState } from 'react'
import { HomeScreen } from './components/HomeScreen'
import { CalendarScreen } from './components/CalendarScreen'
import { StatsScreen } from './components/StatsScreen'
import { ProfileScreen } from './components/ProfileScreen'
import { TabBar } from './components/TabBar'
import { AddModal } from './components/AddModal'
import { AIModal } from './components/AIModal'
import { DetailModal } from './components/DetailModal'
import { ENTRIES } from './lib/data'
import { api, apiEntryToEntry } from './lib/api'
import type { Entry, Modal, Tab } from './lib/types'

function App() {
  const [tab, setTab] = useState<Tab>('home')
  const [modal, setModal] = useState<Modal>(null)
  const [selectedEntry, setSelectedEntry] = useState(0)
  // エントリは API から取得。失敗時はモック（ENTRIES）にフォールバックして UI を保つ。
  const [entries, setEntries] = useState<Entry[]>(ENTRIES)

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    api
      .listEntriesByDay(today)
      .then((rows) => {
        if (rows.length > 0) setEntries(rows.map(apiEntryToEntry))
      })
      .catch(() => {
        /* バックエンド未接続時はモックのまま */
      })
  }, [])

  const openAdd = () => setModal('add')
  const openAI = () => setModal('ai')
  const openDetail = (i: number) => {
    setSelectedEntry(i)
    setModal('detail')
  }
  const closeModal = () => setModal(null)

  return (
    <div
      style={{
        position: 'relative',
        height: '100svh',
        background: 'radial-gradient(at 0% 0%, #f7ecd9 0%, transparent 50%), radial-gradient(at 100% 100%, #f0e3cb 0%, transparent 50%), #f3e9d4',
        color: 'var(--ink)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      {/* subtle paper grain */}
      <div
        style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', opacity: 0.35,
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(120,80,30,0.08) 1px, transparent 1px)',
          backgroundSize: '3px 3px', mixBlendMode: 'multiply',
        }}
      />

      {tab === 'home' && <HomeScreen entries={entries} onOpenAI={openAI} onOpenDetail={openDetail} />}
      {tab === 'calendar' && <CalendarScreen />}
      {tab === 'stats' && <StatsScreen />}
      {tab === 'profile' && <ProfileScreen />}

      {/* modal scrim */}
      {modal && (
        <div
          onClick={closeModal}
          style={{ position: 'fixed', inset: 0, background: 'rgba(28,25,23,0.35)', backdropFilter: 'blur(4px)', zIndex: 80, animation: 'll-scrim 200ms ease both' }}
        />
      )}

      {modal === 'add' && <AddModal onClose={closeModal} onOpenAI={openAI} />}
      {modal === 'ai' && <AIModal onClose={closeModal} />}
      {modal === 'detail' && <DetailModal entry={entries[selectedEntry]} onClose={closeModal} />}

      <TabBar tab={tab} onTab={setTab} onOpenAdd={openAdd} />
    </div>
  )
}

export default App
