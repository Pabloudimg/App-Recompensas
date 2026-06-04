import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import { ensureFamilyForUser, loadFamilyData, saveFamilyData, signInWithGoogle, signOut, subscribeToAuth } from './cloudStore'

const STORAGE_KEY = 'missoes-da-semana-v1'
const THEME_KEY = 'missoes-da-semana-theme'
const SAVE_DELAY_MS = 900

const defaultData = {
  children: [
    { id: 'malu', name: 'Malu', age: 9, birthDate: '', avatar: '🦄', photo: '', theme: 'purple' },
    { id: 'miguel', name: 'Miguel', age: 6, birthDate: '', avatar: '🚀', photo: '', theme: 'blue' }
  ],
  activities: [
    { id: 'escola', title: 'Preparação para escola', points: 1, active: true, icon: '🎒', order: 1, assignedChildIds: ['malu', 'miguel'] },
    { id: 'cinto', title: 'Andar no carro de cinto', points: 1, active: true, icon: '🚗', order: 2, assignedChildIds: ['malu', 'miguel'] },
    { id: 'refeicoes', title: 'Fazer as refeições do dia', points: 1, active: true, icon: '🍽️', order: 3, assignedChildIds: ['malu', 'miguel'] },
    { id: 'dentes', title: 'Escovar os dentes', points: 1, active: true, icon: '🪥', order: 4, assignedChildIds: ['malu', 'miguel'] },
    { id: 'respeito', title: 'Resolver conflitos sem bater/brigar', points: 2, active: true, icon: '🤝', order: 5, assignedChildIds: ['malu', 'miguel'] }
  ],
  rewards: [
    { id: 'filme', title: 'Escolher o filme da família', cost: 15, icon: '🎬' },
    { id: 'sobremesa', title: 'Escolher uma sobremesa', cost: 20, icon: '🍨' },
    { id: 'parque', title: 'Passeio no parque', cost: 25, icon: '🌳' },
    { id: 'pizza', title: 'Noite da pizza', cost: 30, icon: '🍕' }
  ],
  records: {},
  notes: {},
  rewardRedemptions: {},
  transfers: {}
}

const themeOptions = [
  ['purple', 'Roxo'], ['blue', 'Azul'], ['green', 'Verde'], ['amber', 'Âmbar'], ['rose', 'Rosa'],
  ['orange', 'Laranja'], ['teal', 'Turquesa'], ['cyan', 'Ciano'], ['indigo', 'Índigo'], ['slate', 'Grafite']
]

function App() {
  const [data, setData] = useState(() => readLocalData())
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()))
  const [activeTab, setActiveTab] = useState('today')
  const [selectedChildId, setSelectedChildId] = useState(() => readLocalData().children[0]?.id ?? defaultData.children[0].id)
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem(THEME_KEY) || 'light')
  const [showSplash, setShowSplash] = useState(true)
  const [user, setUser] = useState(null)
  const [family, setFamily] = useState(null)
  const [cloudLoading, setCloudLoading] = useState(true)
  const [cloudReady, setCloudReady] = useState(false)
  const [cloudSaving, setCloudSaving] = useState(false)
  const [cloudError, setCloudError] = useState('')
  const saveTimerRef = useRef(null)
  const didInitialCloudLoadRef = useRef(false)

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode
    localStorage.setItem(THEME_KEY, themeMode)
  }, [themeMode])

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 1050)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (currentUser) => {
      setUser(currentUser)
      setCloudError('')
      didInitialCloudLoadRef.current = false

      if (!currentUser) {
        setFamily(null)
        setCloudReady(false)
        setCloudLoading(false)
        return
      }

      try {
        setCloudLoading(true)
        const userFamily = await ensureFamilyForUser(currentUser)
        setFamily(userFamily)
        const cloudData = normalizeData(await loadFamilyData(userFamily.id))
        const hasCloudContent = cloudData.children.length > 0 || cloudData.activities.length > 0 || cloudData.rewards.length > 0
        const localData = readLocalData()
        const nextData = hasCloudContent ? cloudData : normalizeData(localData)
        setData(nextData)
        setSelectedChildId((currentId) => nextData.children.some((child) => child.id === currentId) ? currentId : nextData.children[0]?.id)

        if (!hasCloudContent) await saveFamilyData(userFamily.id, nextData)
        didInitialCloudLoadRef.current = true
        setCloudReady(true)
      } catch (error) {
        console.error(error)
        setCloudError('Não foi possível carregar os dados da nuvem. Verifique as regras do Firestore e a conexão.')
        setCloudReady(false)
      } finally {
        setCloudLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  useEffect(() => {
    if (!user || !family?.id || !cloudReady || !didInitialCloudLoadRef.current) return
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current)
    saveTimerRef.current = window.setTimeout(async () => {
      try {
        setCloudSaving(true)
        await saveFamilyData(family.id, normalizeData(data))
        setCloudError('')
      } catch (error) {
        console.error(error)
        setCloudError('Não foi possível salvar na nuvem agora. Os dados seguem salvos neste navegador.')
      } finally {
        setCloudSaving(false)
      }
    }, SAVE_DELAY_MS)

    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current)
    }
  }, [data, user, family, cloudReady])

  const orderedActivities = useMemo(() => sortActivities(data.activities), [data.activities])
  const selectedChild = data.children.find((child) => child.id === selectedChildId) ?? data.children[0]
  const activeActivities = useMemo(
    () => orderedActivities.filter((activity) => activity.active && isActivityAssignedToChild(activity, selectedChild?.id)),
    [orderedActivities, selectedChild?.id]
  )

  const weeklySummaries = data.children.map((child) => {
    const childActivities = orderedActivities.filter((activity) => activity.active && isActivityAssignedToChild(activity, child.id))
    return calculateWeekSummary({ child, activities: childActivities, records: data.records, selectedDate })
  })

  function updateRecord(childId, activityId, status) {
    setData((current) => {
      const day = current.records[selectedDate] ?? {}
      const childRecords = day[childId] ?? {}
      const nextChildRecords = { ...childRecords }

      if (status === 'pending') delete nextChildRecords[activityId]
      else nextChildRecords[activityId] = status

      return { ...current, records: { ...current.records, [selectedDate]: { ...day, [childId]: nextChildRecords } } }
    })
  }

  function updateNote(childId, note) {
    setData((current) => {
      const day = current.notes[selectedDate] ?? {}
      return { ...current, notes: { ...current.notes, [selectedDate]: { ...day, [childId]: note } } }
    })
  }

  async function updateChildPhoto(childId, file) {
    if (!file) return
    try {
      const compressedPhoto = await resizeImageFile(file)
      setData((current) => ({ ...current, children: current.children.map((child) => child.id === childId ? { ...child, photo: compressedPhoto } : child) }))
    } catch {
      alert('Não consegui usar esta imagem. Tente uma foto menor ou em formato JPG/PNG.')
    }
  }

  function removeChildPhoto(childId) {
    setData((current) => ({ ...current, children: current.children.map((child) => child.id === childId ? { ...child, photo: getRandomPlaceholderPhoto(child.name) } : child) }))
  }

  function updateChildProfile(childId, patch) {
    setData((current) => ({ ...current, children: current.children.map((child) => child.id === childId ? { ...child, ...patch } : child) }))
  }

  function addChildProfile(child) {
    const name = String(child.name ?? '').trim()
    if (!name) return
    const id = createId(name)
    const newChild = {
      id,
      name,
      birthDate: child.birthDate || '',
      age: calculateAge(child.birthDate, 0),
      avatar: getRandomChildEmoji(),
      photo: getRandomPlaceholderPhoto(name),
      theme: child.theme || 'blue'
    }
    setData((current) => ({
      ...current,
      children: [...current.children, newChild],
      activities: current.activities.map((activity) => ({
        ...activity,
        assignedChildIds: activity.assignedChildIds?.length ? activity.assignedChildIds : current.children.map((item) => item.id)
      }))
    }))
    setSelectedChildId(id)
  }

  function removeChildProfile(childId) {
    if (data.children.length <= 1) {
      alert('É necessário manter pelo menos uma criança cadastrada.')
      return
    }
    const confirmation = window.confirm('Remover esta criança do cadastro? O histórico antigo ficará salvo, mas não será exibido.')
    if (!confirmation) return
    const nextSelected = data.children.find((child) => child.id !== childId)?.id
    setData((current) => ({
      ...current,
      children: current.children.filter((child) => child.id !== childId),
      activities: current.activities.map((activity) => ({ ...activity, assignedChildIds: (activity.assignedChildIds ?? []).filter((id) => id !== childId) }))
    }))
    if (selectedChildId === childId && nextSelected) setSelectedChildId(nextSelected)
  }

  function addActivity(activity) {
    setData((current) => {
      const maxOrder = Math.max(0, ...current.activities.map((item, index) => Number(item.order ?? index + 1)))
      return {
        ...current,
        activities: [
          ...current.activities,
          {
            id: createId(activity.title),
            title: activity.title,
            points: clampTwoDigit(activity.points, 1),
            icon: activity.icon || '⭐',
            order: clampTwoDigit(activity.order, maxOrder + 1),
            assignedChildIds: activity.assignedChildIds?.length ? activity.assignedChildIds : current.children.map((child) => child.id),
            active: true
          }
        ]
      }
    })
  }

  function updateActivity(activityId, patch) {
    setData((current) => ({ ...current, activities: current.activities.map((activity) => activity.id === activityId ? { ...activity, ...patch } : activity) }))
  }

  function moveActivity(activityId, direction) {
    setData((current) => {
      const sorted = sortActivities(current.activities)
      const index = sorted.findIndex((activity) => activity.id === activityId)
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (index < 0 || targetIndex < 0 || targetIndex >= sorted.length) return current
      const reordered = [...sorted]
      const [removed] = reordered.splice(index, 1)
      reordered.splice(targetIndex, 0, removed)
      const orderMap = new Map(reordered.map((activity, activityIndex) => [activity.id, activityIndex + 1]))
      return { ...current, activities: current.activities.map((activity) => ({ ...activity, order: orderMap.get(activity.id) ?? activity.order })) }
    })
  }

  function removeActivity(activityId) {
    setData((current) => ({ ...current, activities: current.activities.map((activity) => activity.id === activityId ? { ...activity, active: false } : activity) }))
  }

  function addReward(reward) {
    setData((current) => ({ ...current, rewards: [...current.rewards, { id: createId(reward.title), title: reward.title, cost: clampTwoDigit(reward.cost, 10), icon: reward.icon || '🎁' }] }))
  }

  function updateReward(rewardId, patch) {
    setData((current) => ({ ...current, rewards: current.rewards.map((reward) => reward.id === rewardId ? { ...reward, ...patch } : reward) }))
  }

  function removeReward(rewardId) {
    setData((current) => ({ ...current, rewards: current.rewards.filter((reward) => reward.id !== rewardId) }))
  }

  function togglePrizeRedemption(childId, rewardId, weekKey) {
    setData((current) => {
      const child = current.children.find((item) => item.id === childId)
      const reward = current.rewards.find((item) => item.id === rewardId)
      if (!child || !reward) return current

      const childActivities = sortActivities(current.activities).filter((activity) => activity.active && isActivityAssignedToChild(activity, childId))
      const summary = calculateWeekSummary({ child, activities: childActivities, records: current.records, selectedDate: weekKey })
      const weekRedemptions = current.rewardRedemptions?.[weekKey] ?? {}
      const childRedemptions = weekRedemptions[childId] ?? {}
      const nextChildRedemptions = { ...childRedemptions }
      const transferred = Number(current.transfers?.[weekKey]?.[childId] ?? 0)
      const used = calculateUsedRewards(childRedemptions, current.rewards)
      const nextWeekKey = getNextWeekKey(weekKey)
      const nextTransfer = Number(current.transfers?.[nextWeekKey]?.[childId] ?? 0)
      const available = Math.max(0, summary.points + transferred - used - nextTransfer)
      const cost = clampTwoDigit(reward.cost, 0)

      if (nextChildRedemptions[rewardId]) delete nextChildRedemptions[rewardId]
      else {
        if (cost > available) return current
        nextChildRedemptions[rewardId] = true
      }

      return { ...current, rewardRedemptions: { ...(current.rewardRedemptions ?? {}), [weekKey]: { ...weekRedemptions, [childId]: nextChildRedemptions } } }
    })
  }

  function transferBalanceToNextWeek(childId, weekKey, amount) {
    const nextWeekKey = getNextWeekKey(weekKey)
    const transferAmount = Math.max(0, Math.round(Number(amount) || 0))
    setData((current) => {
      const nextWeekTransfers = current.transfers?.[nextWeekKey] ?? {}
      const alreadyTransferred = Number(nextWeekTransfers[childId] ?? 0) > 0
      const nextChildTransfers = { ...nextWeekTransfers }
      if (alreadyTransferred) delete nextChildTransfers[childId]
      else nextChildTransfers[childId] = transferAmount
      return { ...current, transfers: { ...(current.transfers ?? {}), [nextWeekKey]: nextChildTransfers } }
    })
  }

  function importData(file) {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        if (!parsed.children || !parsed.activities || !parsed.records) throw new Error('Arquivo inválido')
        setData(normalizeData(parsed))
      } catch {
        alert('Não consegui importar este arquivo. Verifique se ele foi exportado pelo app.')
      }
    }
    reader.readAsText(file)
  }

  function resetData() {
    const confirmation = window.confirm('Tem certeza que deseja restaurar os dados iniciais? O histórico será apagado deste navegador e será salvo na nuvem.')
    if (confirmation) setData(defaultData)
  }

  async function forceCloudSave() {
    if (!family?.id) return
    setCloudSaving(true)
    await saveFamilyData(family.id, normalizeData(data))
    setCloudSaving(false)
  }

  if (cloudLoading) return <LoadingScreen />

  if (!user) {
    return (
      <main className="app-shell">
        <section className="hero-card entrance-card login-card">
          <div>
            <p className="eyebrow">App Recompensas</p>
            <h1>Entre para sincronizar</h1>
            <p className="hero-copy">Use sua conta Google para acessar a família, compartilhar os dados entre pai e mãe e salvar tudo no Firebase.</p>
          </div>
          <button className="google-button" onClick={signInWithGoogle}>Entrar com Google</button>
        </section>
      </main>
    )
  }

  return (
    <>
      {showSplash && <SplashScreen />}
      <main className="app-shell">
        <header className="hero-card entrance-card">
          <div>
            <p className="eyebrow">Quadro familiar</p>
            <h1>App Recompensas</h1>
            <p className="hero-copy">Marque pequenas conquistas do dia, acompanhe estrelas e combine prêmios para o fim de semana.</p>
            <div className="cloud-status">
              <span>👤 {user.displayName || user.email}</span>
              <span>🏠 {family?.name || 'Família'}</span>
              <span>{cloudSaving ? '☁️ Salvando...' : cloudReady ? '☁️ Nuvem ativa' : '💾 Local'}</span>
            </div>
            {cloudError && <p className="cloud-error">{cloudError}</p>}
          </div>
          <div className="hero-actions">
            <button className="theme-toggle" onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')} aria-label="Alternar modo claro e escuro">{themeMode === 'dark' ? '☀️ Claro' : '🌙 Escuro'}</button>
            <button className="ghost" onClick={forceCloudSave}>Salvar agora</button>
            <button className="ghost danger" onClick={signOut}>Sair</button>
            <div className="date-card"><span>Data de acompanhamento</span><input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} /></div>
          </div>
        </header>

        <section className="children-grid">
          {data.children.map((child) => {
            const summary = weeklySummaries.find((item) => item.child.id === child.id)
            return (
              <article key={child.id} className={`child-card ${selectedChildId === child.id ? 'is-selected' : ''} theme-${child.theme}`} role="button" tabIndex={0} onClick={() => setSelectedChildId(child.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setSelectedChildId(child.id) }}>
                <span className="avatar static-avatar">{child.photo ? <img src={child.photo} alt={'Foto de ' + child.name} /> : child.avatar}</span>
                <span className="child-name">{child.name}</span>
                <span className="child-age">{getChildAgeLabel(child)}</span>
                <ProgressBar value={summary?.percentage ?? 0} />
                <strong>{summary?.points ?? 0} estrelas nesta semana</strong>
                <small>{summary?.percentage ?? 0}% de conclusão</small>
              </article>
            )
          })}
        </section>

        <nav className="tabbar" aria-label="Navegação principal">
          <button className={activeTab === 'today' ? 'active' : ''} onClick={() => setActiveTab('today')}>Hoje</button>
          <button className={activeTab === 'week' ? 'active' : ''} onClick={() => setActiveTab('week')}>Semana</button>
          <button className={activeTab === 'activities' ? 'active' : ''} onClick={() => setActiveTab('activities')}>Atividades</button>
          <button className={activeTab === 'rewards' ? 'active' : ''} onClick={() => setActiveTab('rewards')}>Prêmios</button>
          <button className={activeTab === 'children' ? 'active' : ''} onClick={() => setActiveTab('children')}>Crianças</button>
          <button className={activeTab === 'data' ? 'active' : ''} onClick={() => setActiveTab('data')}>Dados</button>
        </nav>

        {activeTab === 'today' && <TodayPanel child={selectedChild} activities={activeActivities} selectedDate={selectedDate} records={data.records} notes={data.notes} onUpdateRecord={updateRecord} onUpdateNote={updateNote} />}
        {activeTab === 'week' && <WeekPanel summaries={weeklySummaries.filter((summary) => summary.child.id === selectedChildId)} rewards={data.rewards} selectedDate={selectedDate} rewardRedemptions={data.rewardRedemptions} transfers={data.transfers} onTogglePrize={togglePrizeRedemption} onTransferBalance={transferBalanceToNextWeek} />}
        {activeTab === 'activities' && <ActivitiesPanel activities={orderedActivities} children={data.children} onAddActivity={addActivity} onUpdateActivity={updateActivity} onRemoveActivity={removeActivity} onMoveActivity={moveActivity} />}
        {activeTab === 'rewards' && <RewardsPanel rewards={data.rewards} onAddReward={addReward} onUpdateReward={updateReward} onRemoveReward={removeReward} />}
        {activeTab === 'children' && <ChildrenPanel children={data.children} selectedChildId={selectedChildId} onSelectChild={setSelectedChildId} onAddChild={addChildProfile} onUpdateChild={updateChildProfile} onRemoveChild={removeChildProfile} onPhotoChange={updateChildPhoto} onRemovePhoto={removeChildPhoto} />}
        {activeTab === 'data' && <DataPanel data={data} family={family} onImportData={importData} onResetData={resetData} />}
      </main>
    </>
  )
}

function LoadingScreen() {
  return <main className="app-shell"><section className="hero-card entrance-card"><div><p className="eyebrow">Carregando</p><h1>Conectando à nuvem...</h1><p className="hero-copy">Estamos preparando seus dados do Firebase.</p></div></section></main>
}

function SplashScreen() {
  return <div className="splash-screen" aria-hidden="true"><div className="splash-badge">⭐</div><h2>Preparando missões...</h2><p>Malu & Miguel</p></div>
}

function TodayPanel({ child, activities, selectedDate, records, notes, onUpdateRecord, onUpdateNote }) {
  const [feedback, setFeedback] = useState(null)
  const dayRecords = records[selectedDate]?.[child?.id] ?? {}
  const note = notes[selectedDate]?.[child?.id] ?? ''
  const todaySummary = calculateDaySummary({ activities, dayRecords })

  function handleStatusClick(activityId, currentStatus, nextStatus) {
    const finalStatus = currentStatus === nextStatus ? 'pending' : nextStatus
    onUpdateRecord(child.id, activityId, finalStatus)
    if (finalStatus === 'ok' || finalStatus === 'not-ok') {
      const key = `${activityId}-${Date.now()}`
      setFeedback({ activityId, status: finalStatus, key })
      window.setTimeout(() => setFeedback((current) => current?.key === key ? null : current), 820)
    }
  }

  if (!child) return null

  return (
    <section className="panel entrance-card">
      <div className="panel-header"><div><p className="eyebrow">Marcação diária</p><h2>{child.photo ? <img className="title-photo" src={child.photo} alt="" /> : child.avatar} Missões de {child.name}</h2></div><div className="score-pill"><strong>{todaySummary.points}</strong><span>de {todaySummary.possiblePoints} estrelas</span></div></div>
      <div className="mission-list">
        {activities.map((activity) => {
          const currentStatus = dayRecords[activity.id] ?? 'pending'
          const starCount = Math.max(0, Math.min(99, Number(activity.points) || 0))
          return (
            <article key={activity.id} className={`mission-card status-${currentStatus}`}>
              {feedback?.activityId === activity.id && <span key={feedback.key} className={`mood-pop ${feedback.status}`}>{feedback.status === 'ok' ? '😄' : '😢'}</span>}
              <div className="mission-title"><span>{activity.icon}</span><div><h3 className="mission-heading"><span>{activity.title}</span><sup className="activity-stars">{Array.from({ length: starCount }, (_, starIndex) => <span key={starIndex}>⭐</span>)}</sup></h3></div></div>
              <div className="status-buttons" aria-label={`Status de ${activity.title}`}>
                <button className={currentStatus === 'ok' ? 'ok active' : 'ok'} onClick={() => handleStatusClick(activity.id, currentStatus, 'ok')} aria-label="Joinha para cima"><span>👍</span><small>OK</small></button>
                <button className={currentStatus === 'not-ok' ? 'not-ok active' : 'not-ok'} onClick={() => handleStatusClick(activity.id, currentStatus, 'not-ok')} aria-label="Joinha para baixo"><span>👎</span><small>Não OK</small></button>
                <button className={currentStatus === 'na' ? 'na active' : 'na'} onClick={() => handleStatusClick(activity.id, currentStatus, 'na')} aria-label="Neutro"><span>😐</span><small>N/A</small></button>
              </div>
            </article>
          )
        })}
      </div>
      <label className="note-box">Observações do dia<textarea value={note} onChange={(event) => onUpdateNote(child.id, event.target.value)} placeholder="Ex.: Teve dificuldade no almoço, mas melhorou no jantar." /></label>
    </section>
  )
}

function WeekPanel({ summaries, rewards, selectedDate, rewardRedemptions, transfers, onTogglePrize, onTransferBalance }) {
  const weekDays = getWeekDates(selectedDate)
  const weekKey = weekDays[0]
  const nextWeekKey = getNextWeekKey(weekKey)
  return (
    <section className="panel entrance-card">
      <div className="panel-header"><div><p className="eyebrow">Resumo semanal</p><h2>Semana de {formatFriendlyDate(weekDays[0])} a {formatFriendlyDate(weekDays[6])}</h2></div></div>
      <div className="summary-grid">
        {summaries.map((summary) => {
          const childId = summary.child.id
          const childRedemptions = rewardRedemptions?.[weekKey]?.[childId] ?? {}
          const transferred = Number(transfers?.[weekKey]?.[childId] ?? 0)
          const used = calculateUsedRewards(childRedemptions, rewards)
          const nextTransfer = Number(transfers?.[nextWeekKey]?.[childId] ?? 0)
          const balance = Math.max(0, summary.points + transferred - used)
          const available = Math.max(0, balance - nextTransfer)
          return (
            <article key={childId} className={`summary-card theme-${summary.child.theme}`}>
              <div className="summary-topline"><span className="avatar mini-avatar">{summary.child.photo ? <img src={summary.child.photo} alt="" /> : summary.child.avatar}</span><div><h3>{summary.child.name}</h3><p>{summary.completed} <span className="inline-status-icon">👍</span> de {summary.applicable} marcações aplicáveis</p></div></div>
              <ProgressBar value={summary.percentage} />
              <div className="week-metrics"><p className="summary-points">⭐ <strong className="metric-value good">{summary.points}</strong> estrelas obtidas na semana</p><p className="summary-finance">↔️ <strong className="metric-value good">{transferred}</strong> estrelas transferidas</p><p className="summary-finance">🏆 <strong className="metric-value bad">{used + nextTransfer}</strong> estrelas utilizadas</p><p className="summary-finance balance-line">🧾 <strong className="metric-value good">{available}</strong> estrelas disponíveis</p></div>
              <div className="weekly-prizes"><h4>Prêmios possíveis</h4><div className="prize-claim-grid">
                {rewards.map((reward) => {
                  const isRedeemed = Boolean(childRedemptions[reward.id])
                  const cost = clampTwoDigit(reward.cost, 0)
                  const canRedeem = isRedeemed || cost <= available
                  return <button key={reward.id} className={`prize-claim-card ${isRedeemed ? 'is-redeemed' : ''}`} onClick={() => onTogglePrize(childId, reward.id, weekKey)} disabled={!canRedeem}>{isRedeemed && <span className="redeemed-check" aria-hidden="true">✓</span>}<span className="prize-icon">{reward.icon}</span><strong>{reward.title}</strong><small>{cost} moedas</small><em>{isRedeemed ? 'Resgatado' : canRedeem ? 'Resgatar' : `Faltam ${cost - available}`}</em></button>
                })}
                <button className={`prize-claim-card accumulate-card ${nextTransfer > 0 ? 'is-redeemed' : ''}`} onClick={() => onTransferBalance(childId, weekKey, available)} disabled={available <= 0 && nextTransfer <= 0}>{nextTransfer > 0 && <span className="redeemed-check" aria-hidden="true">✓</span>}<span className="prize-icon">🪙</span><strong>Acumular moedas</strong><small>Transferir saldo</small><em>{nextTransfer > 0 ? `${nextTransfer} para próxima semana` : available > 0 ? `${available} disponíveis` : 'Sem saldo'}</em></button>
              </div></div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function ActivitiesPanel({ activities, children, onAddActivity, onUpdateActivity, onRemoveActivity, onMoveActivity }) {
  const nextOrder = Math.min(99, Math.max(0, ...activities.map((activity, index) => Number(activity.order ?? index + 1))) + 1)
  const allChildIds = children.map((child) => child.id)
  const [form, setForm] = useState({ title: '', points: '1', icon: '⭐', order: String(nextOrder), assignedChildIds: allChildIds })

  useEffect(() => setForm((current) => ({ ...current, assignedChildIds: current.assignedChildIds?.length ? current.assignedChildIds : allChildIds, order: current.title ? current.order : String(nextOrder) })), [children.length, nextOrder])

  function submit(event) {
    event.preventDefault()
    if (!form.title.trim()) return
    onAddActivity(form)
    setForm({ title: '', points: '1', icon: '⭐', order: String(Math.min(99, nextOrder + 1)), assignedChildIds: allChildIds })
  }

  return (
    <section className="panel entrance-card">
      <div className="panel-header"><div><p className="eyebrow">Configuração</p><h2>Atividades</h2><p className="muted-text">Use a posição ou as setas para definir a ordem exibida na visão diária. Selecione também quais crianças recebem cada atividade.</p></div></div>
      <form className="inline-form activities-form" onSubmit={submit}>
        <label className="field small-field"><span>Ícone</span><input value={form.icon} maxLength={2} onChange={(event) => setForm({ ...form, icon: event.target.value })} /></label>
        <label className="field"><span>Descrição</span><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Nova atividade" /></label>
        <label className="field numeric-field"><span>Estrelas</span><input inputMode="numeric" maxLength={2} value={form.points} onChange={(event) => setForm({ ...form, points: sanitizeTwoDigitInput(event.target.value) })} /></label>
        <label className="field numeric-field"><span>Ordem</span><input inputMode="numeric" maxLength={2} value={form.order} onChange={(event) => setForm({ ...form, order: sanitizeTwoDigitInput(event.target.value) })} /></label>
        <ChildMultiSelect children={children} selectedIds={form.assignedChildIds} onChange={(assignedChildIds) => setForm({ ...form, assignedChildIds })} />
        <button type="submit">Adicionar</button>
      </form>
      <div className="settings-list activities-settings">
        {activities.map((activity, index) => (
          <article key={activity.id} className={!activity.active ? 'muted-row' : ''}>
            <div className="order-buttons"><button onClick={() => onMoveActivity(activity.id, 'up')} disabled={index === 0}>↑</button><button onClick={() => onMoveActivity(activity.id, 'down')} disabled={index === activities.length - 1}>↓</button></div>
            <label className="field small-field"><span>Ícone</span><input value={activity.icon} maxLength={2} onChange={(event) => onUpdateActivity(activity.id, { icon: event.target.value })} /></label>
            <label className="field"><span>Descrição</span><input value={activity.title} onChange={(event) => onUpdateActivity(activity.id, { title: event.target.value })} /></label>
            <label className="field numeric-field"><span>Estrelas</span><input inputMode="numeric" maxLength={2} value={String(activity.points ?? 0)} onChange={(event) => onUpdateActivity(activity.id, { points: clampTwoDigit(event.target.value, 0) })} /></label>
            <label className="field numeric-field"><span>Ordem</span><input inputMode="numeric" maxLength={2} value={String(activity.order ?? index + 1)} onChange={(event) => onUpdateActivity(activity.id, { order: clampTwoDigit(event.target.value, 0) })} /></label>
            <ChildMultiSelect children={children} selectedIds={activity.assignedChildIds?.length ? activity.assignedChildIds : allChildIds} onChange={(assignedChildIds) => onUpdateActivity(activity.id, { assignedChildIds })} />
            <label className="toggle-label"><input type="checkbox" checked={activity.active} onChange={(event) => onUpdateActivity(activity.id, { active: event.target.checked })} />Ativa</label>
            <button className="ghost danger" onClick={() => onRemoveActivity(activity.id)}>Remover</button>
          </article>
        ))}
      </div>
    </section>
  )
}

function ChildMultiSelect({ children, selectedIds, onChange }) {
  const selected = selectedIds ?? []
  function toggle(childId) {
    const next = selected.includes(childId) ? selected.filter((id) => id !== childId) : [...selected, childId]
    onChange(next)
  }
  return <div className="field child-multiselect"><span>Crianças</span><div>{children.map((child) => <label key={child.id}><input type="checkbox" checked={selected.includes(child.id)} onChange={() => toggle(child.id)} />{child.photo ? <img src={child.photo} alt="" /> : child.avatar}<strong>{child.name}</strong></label>)}</div></div>
}

function RewardsPanel({ rewards, onAddReward, onUpdateReward, onRemoveReward }) {
  const [form, setForm] = useState({ title: '', cost: '10', icon: '🎁' })
  function submit(event) { event.preventDefault(); if (!form.title.trim()) return; onAddReward(form); setForm({ title: '', cost: '10', icon: '🎁' }) }
  return <section className="panel entrance-card"><div className="panel-header"><div><p className="eyebrow">Configuração</p><h2>Prêmios</h2></div></div><form className="inline-form rewards-form" onSubmit={submit}><label className="field small-field"><span>Ícone</span><input value={form.icon} maxLength={2} onChange={(event) => setForm({ ...form, icon: event.target.value })} /></label><label className="field"><span>Prêmio</span><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Novo prêmio" /></label><label className="field numeric-field"><span>Estrelas</span><input inputMode="numeric" maxLength={2} value={form.cost} onChange={(event) => setForm({ ...form, cost: sanitizeTwoDigitInput(event.target.value) })} /></label><button type="submit">Adicionar</button></form><div className="settings-list rewards-settings">{rewards.map((reward) => <article key={reward.id}><label className="field small-field"><span>Ícone</span><input value={reward.icon} maxLength={2} onChange={(event) => onUpdateReward(reward.id, { icon: event.target.value })} /></label><label className="field"><span>Prêmio</span><input value={reward.title} onChange={(event) => onUpdateReward(reward.id, { title: event.target.value })} /></label><label className="field numeric-field"><span>Estrelas</span><input inputMode="numeric" maxLength={2} value={String(reward.cost ?? 0)} onChange={(event) => onUpdateReward(reward.id, { cost: clampTwoDigit(event.target.value, 0) })} /></label><button className="ghost danger" onClick={() => onRemoveReward(reward.id)}>Remover</button></article>)}</div></section>
}

function ChildrenPanel({ children, selectedChildId, onSelectChild, onAddChild, onUpdateChild, onRemoveChild, onPhotoChange, onRemovePhoto }) {
  const [form, setForm] = useState({ name: '', birthDate: '', theme: 'blue' })
  function submit(event) { event.preventDefault(); if (!form.name.trim()) return; onAddChild(form); setForm({ name: '', birthDate: '', theme: 'blue' }) }
  return <section className="panel entrance-card"><div className="panel-header"><div><p className="eyebrow">Cadastro</p><h2>Crianças</h2><p className="muted-text">Cadastre nome, data de nascimento e foto. A idade é calculada automaticamente.</p></div></div><form className="inline-form children-form" onSubmit={submit}><label className="field"><span>Nome</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Nome da criança" /></label><label className="field"><span>Nascimento</span><input type="date" value={form.birthDate} onChange={(event) => setForm({ ...form, birthDate: event.target.value })} /></label><label className="field"><span>Tema</span><ThemeSelect value={form.theme} onChange={(theme) => setForm({ ...form, theme })} /></label><button type="submit">Adicionar</button></form><div className="settings-list children-settings">{children.map((child) => <article key={child.id} className={'child-admin-card theme-' + child.theme}><div className="child-photo-tools"><span className="avatar child-admin-avatar">{child.photo ? <img src={child.photo} alt={child.name} /> : child.avatar}</span><label className="file-button compact-file">Trocar foto<input type="file" accept="image/png,image/jpeg,image/webp,image/heic,image/heif,image/*" onChange={(event) => { onPhotoChange(child.id, event.target.files?.[0]); event.currentTarget.value = '' }} /></label>{child.photo && <button className="ghost compact-ghost" onClick={() => onRemovePhoto(child.id)}>Remover foto</button>}</div><label className="field"><span>Nome</span><input value={child.name} onChange={(event) => onUpdateChild(child.id, { name: event.target.value })} /></label><label className="field"><span>Nascimento</span><input type="date" value={child.birthDate ?? ''} onChange={(event) => onUpdateChild(child.id, { birthDate: event.target.value })} /></label><label className="field"><span>Tema</span><ThemeSelect value={child.theme ?? 'blue'} onChange={(theme) => onUpdateChild(child.id, { theme })} /></label><div className="child-age-display"><span>Idade</span><strong>{getChildAgeLabel(child)}</strong></div><button className={selectedChildId === child.id ? 'ghost active-selection' : 'ghost'} onClick={() => onSelectChild(child.id)}>{selectedChildId === child.id ? 'Selecionada' : 'Selecionar'}</button><button className="ghost danger" onClick={() => onRemoveChild(child.id)}>Remover</button></article>)}</div></section>
}

function ThemeSelect({ value, onChange }) {
  return <select value={value} onChange={(event) => onChange(event.target.value)}>{themeOptions.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select>
}

function DataPanel({ data, family, onImportData, onResetData }) {
  const payload = JSON.stringify(data, null, 2)
  const exportHref = `data:application/json;charset=utf-8,${encodeURIComponent(payload)}`
  return <section className="panel entrance-card"><div className="panel-header"><div><p className="eyebrow">Backup</p><h2>Dados do app</h2><p className="muted-text">Família atual: {family?.id || 'local'}. Os dados são sincronizados com Firebase e também mantêm backup neste navegador.</p></div></div><div className="data-actions"><a className="primary-link" download="app-recompensas-backup.json" href={exportHref}>Exportar backup</a><label className="file-button">Importar backup<input type="file" accept="application/json" onChange={(event) => event.target.files?.[0] && onImportData(event.target.files[0])} /></label><button className="ghost danger" onClick={onResetData}>Restaurar dados iniciais</button></div></section>
}

function ProgressBar({ value }) { return <div className="progress-track" aria-label={`Progresso ${value}%`}><span style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }} /></div> }

function readLocalData() { try { const stored = localStorage.getItem(STORAGE_KEY); return stored ? normalizeData({ ...defaultData, ...JSON.parse(stored) }) : normalizeData(defaultData) } catch { return normalizeData(defaultData) } }
function normalizeData(data) { const children = (data.children ?? defaultData.children).map((child, index) => ({ birthDate: '', photo: '', theme: index % 2 === 0 ? 'purple' : 'blue', ...child })); return { ...defaultData, ...data, children, activities: (data.activities ?? defaultData.activities).map((activity, index) => ({ ...activity, points: clampTwoDigit(activity.points, 1), order: clampTwoDigit(activity.order, index + 1), assignedChildIds: activity.assignedChildIds?.length ? activity.assignedChildIds : children.map((child) => child.id) })), rewards: (data.rewards ?? defaultData.rewards).map((reward) => ({ ...reward, cost: clampTwoDigit(reward.cost, 10) })), rewardRedemptions: data.rewardRedemptions ?? {}, transfers: data.transfers ?? {}, records: data.records ?? {}, notes: data.notes ?? {} } }
function sortActivities(activities) { return [...activities].sort((a, b) => Number(a.order ?? 999) - Number(b.order ?? 999) || a.title.localeCompare(b.title, 'pt-BR')) }
function isActivityAssignedToChild(activity, childId) { if (!childId) return false; return !activity.assignedChildIds?.length || activity.assignedChildIds.includes(childId) }
function calculateDaySummary({ activities, dayRecords }) { return activities.reduce((summary, activity) => { const status = dayRecords[activity.id]; if (status === 'na') return summary; const possiblePoints = summary.possiblePoints + activity.points; const points = status === 'ok' ? summary.points + activity.points : summary.points; return { points, possiblePoints } }, { points: 0, possiblePoints: 0 }) }
function calculateWeekSummary({ child, activities, records, selectedDate }) { const days = getWeekDates(selectedDate); let points = 0, possiblePoints = 0, completed = 0, applicable = 0; days.forEach((date) => { const childRecords = records[date]?.[child.id] ?? {}; activities.forEach((activity) => { const status = childRecords[activity.id]; if (status === 'na') return; possiblePoints += activity.points; applicable += 1; if (status === 'ok') { points += activity.points; completed += 1 } }) }); const percentage = possiblePoints > 0 ? Math.round((points / possiblePoints) * 100) : 0; return { child, points, possiblePoints, percentage, completed, applicable } }
function calculateUsedRewards(redemptions, rewards) { return rewards.reduce((total, reward) => redemptions?.[reward.id] ? total + clampTwoDigit(reward.cost, 0) : total, 0) }
function getWeekDates(dateString) { const date = parseLocalDate(dateString); const day = date.getDay(); const distanceFromMonday = day === 0 ? -6 : 1 - day; const monday = new Date(date); monday.setDate(date.getDate() + distanceFromMonday); return Array.from({ length: 7 }, (_, index) => { const nextDate = new Date(monday); nextDate.setDate(monday.getDate() + index); return formatDate(nextDate) }) }
function getNextWeekKey(weekKey) { const next = parseLocalDate(weekKey); next.setDate(next.getDate() + 7); return formatDate(next) }
function sanitizeTwoDigitInput(value) { return String(value ?? '').replace(/\D/g, '').slice(0, 2) }
function clampTwoDigit(value, fallback = 0) { const sanitized = sanitizeTwoDigitInput(value); if (sanitized === '') return Math.min(99, Math.max(0, Number(fallback) || 0)); return Math.min(99, Math.max(0, Number(sanitized))) }
function calculateAge(birthDate, fallbackAge = 0) { if (!birthDate) return Number(fallbackAge) || 0; const birth = parseLocalDate(birthDate); if (Number.isNaN(birth.getTime())) return Number(fallbackAge) || 0; const today = new Date(); let age = today.getFullYear() - birth.getFullYear(); const hadBirthdayThisYear = today.getMonth() > birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate()); if (!hadBirthdayThisYear) age -= 1; return Math.max(0, age) }
function getChildAgeLabel(child) { const age = calculateAge(child.birthDate, child.age); return age === 1 ? '1 ano' : String(age) + ' anos' }
function getRandomChildEmoji() { const icons = ['🧒', '👧', '👦', '🌟', '🚀', '🦄', '🐼', '🦊', '🐯', '🐵']; return icons[Math.floor(Math.random() * icons.length)] }
function getRandomPlaceholderPhoto() { const emoji = getRandomChildEmoji(); const bgColors = ['#7c3aed', '#0ea5e9', '#22c55e', '#f59e0b', '#ec4899', '#14b8a6', '#6366f1', '#f97316']; const bg = bgColors[Math.floor(Math.random() * bgColors.length)]; const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="34" fill="' + bg + '"/><circle cx="92" cy="24" r="18" fill="rgba(255,255,255,.22)"/><text x="60" y="74" text-anchor="middle" font-size="52">' + emoji + '</text></svg>'; return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg) }
function resizeImageFile(file) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onerror = reject; reader.onload = () => { const source = String(reader.result); const image = new Image(); image.onload = () => { const maxSize = 520; const ratio = Math.min(1, maxSize / Math.max(image.width, image.height)); const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(image.width * ratio)); canvas.height = Math.max(1, Math.round(image.height * ratio)); const context = canvas.getContext('2d'); if (!context) return reject(new Error('Canvas indisponível')); context.drawImage(image, 0, 0, canvas.width, canvas.height); resolve(canvas.toDataURL('image/jpeg', 0.82)) }; image.onerror = reject; image.src = source }; reader.readAsDataURL(file) }) }
function formatDate(date) { const year = date.getFullYear(); const month = String(date.getMonth() + 1).padStart(2, '0'); const day = String(date.getDate()).padStart(2, '0'); return `${year}-${month}-${day}` }
function parseLocalDate(dateString) { const [year, month, day] = dateString.split('-').map(Number); return new Date(year, month - 1, day) }
function formatFriendlyDate(dateString) { return parseLocalDate(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) }
function createId(value) { return `${String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now().toString(36)}` }

createRoot(document.getElementById('root')).render(<App />)
