import { useCallback, useEffect, useState } from 'react'
import { HomeScreen } from './components/HomeScreen'
import { CalendarScreen } from './components/CalendarScreen'
import { StatsScreen } from './components/StatsScreen'
import { ProfileScreen } from './components/ProfileScreen'
import { TabBar } from './components/TabBar'
import { AddModal } from './components/AddModal'
import { AIModal } from './components/AIModal'
import { DetailModal } from './components/DetailModal'
import { ENTRIES } from './lib/data'
import { api, apiEntryToEntry, localDateParts, type ApiEntry, type EntryInput } from './lib/api'
import type { Modal, Tab } from './lib/types'

function App() {
  const [tab, setTab] = useState<Tab>('home')
  const [modal, setModal] = useState<Modal>(null)
  const [selectedEntry, setSelectedEntry] = useState(0)
  // API 接続時は apiEntries（id 付き）を保持。未接続(null)のときはモックを表示する。
  const [apiEntries, setApiEntries] = useState<ApiEntry[] | null>(null)

  const reload = useCallback(async () => {
    const today = localDateParts().date
    try {
      setApiEntries(await api.listEntriesByDay(today))
    } catch {
      setApiEntries(null) // バックエンド未接続時はモックにフォールバック
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  // 表示用リスト：API 接続時は実データ、未接続時はモック。
  const entries = apiEntries ? apiEntries.map(apiEntryToEntry) : ENTRIES
  const selectedApi = apiEntries?.[selectedEntry]

  const openAdd = () => setModal('add')
  const openAI = () => setModal('ai')
  const openDetail = (i: number) => {
    setSelectedEntry(i)
    setModal('detail')
  }
  const closeModal = () => setModal(null)

  const handleCreate = async (input: EntryInput) => {
    await api.createEntry(input)
    await reload()
    closeModal()
  }
  const handleUpdate = async (id: string, input: EntryInput) => {
    await api.updateEntry(id, input)
    await reload()
    closeModal()
  }
  const handleDelete = async (id: string) => {
    await api.deleteEntry(id)
    await reload()
    closeModal()
  }

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

      {modal === 'add' && <AddModal onClose={closeModal} onOpenAI={openAI} onCreate={handleCreate} />}
      {modal === 'ai' && <AIModal onClose={closeModal} />}
      {modal === 'detail' && entries[selectedEntry] && (
        <DetailModal
          entry={entries[selectedEntry]}
          apiEntry={selectedApi}
          onClose={closeModal}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}

      <TabBar tab={tab} onTab={setTab} onOpenAdd={openAdd} />
    </div>
  )
}

export default App
