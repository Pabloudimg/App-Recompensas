import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const STORAGE_KEY = 'missoes-da-semana-v1'

const defaultData = {
  children: [
    {
      id: 'malu',
      name: 'Malu',
      age: 9,
      avatar: '🦄',
      theme: 'purple'
    },
    {
      id: 'miguel',
      name: 'Miguel',
      age: 6,
      avatar: '🚀',
      theme: 'blue'
    }
  ],
  activities: [
    {
      id: 'escola',
      title: 'Preparação para escola',
      points: 1,
      active: true,
      icon: '🎒'
    },
    {
      id: 'cinto',
      title: 'Andar no carro de cinto',
      points: 1,
      active: true,
      icon: '🚗'
    },
    {
      id: 'refeicoes',
      title: 'Fazer as refeições do dia',
      points: 1,
      active: true,
      icon: '🍽️'
    },
    {
      id: 'dentes',
      title: 'Escovar os dentes',
      points: 1,
      active: true,
      icon: '🪥'
    },
    {
      id: 'respeito',
      title: 'Resolver conflitos sem bater/brigar',
      points: 2,
      active: true,
      icon: '🤝'
    }
  ],
  rewards: [
    { id: 'filme', title: 'Escolher o filme da família', cost: 15, icon: '🎬' },
    { id: 'sobremesa', title: 'Escolher uma sobremesa', cost: 20, icon: '🍨' },
    { id: 'parque', title: 'Passeio no parque', cost: 25, icon: '🌳' },
    { id: 'pizza', title: 'Noite da pizza', cost: 30, icon: '🍕' }
  ],
  records: {},
  notes: {}
}

function App() {
  const [data, setData] = usePersistentState(STORAGE_KEY, defaultData)
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()))
  const [activeTab, setActiveTab] = useState('today')
  const [selectedChildId, setSelectedChildId] = useState(defaultData.children[0].id)

  const activeActivities = useMemo(() => data.activities.filter((activity) => activity.active), [data.activities])
  const selectedChild = data.children.find((child) => child.id === selectedChildId) ?? data.children[0]

  function updateRecord(childId, activityId, status) {
    setData((current) => {
      const day = current.records[selectedDate] ?? {}
      const childRecords = day[childId] ?? {}
      return {
        ...current,
        records: {
          ...current.records,
          [selectedDate]: {
            ...day,
            [childId]: {
              ...childRecords,
              [activityId]: status
            }
          }
        }
      }
    })
  }

  function updateNote(childId, note) {
    setData((current) => {
      const day = current.notes[selectedDate] ?? {}
      return {
        ...current,
        notes: {
          ...current.notes,
          [selectedDate]: {
            ...day,
            [childId]: note
          }
        }
      }
    })
  }

  function addActivity(activity) {
    setData((current) => ({
      ...current,
      activities: [
        ...current.activities,
        {
          id: createId(activity.title),
          title: activity.title,
          points: Number(activity.points) || 1,
          icon: activity.icon || '⭐',
          active: true
        }
      ]
    }))
  }

  function updateActivity(activityId, patch) {
    setData((current) => ({
      ...current,
      activities: current.activities.map((activity) =>
        activity.id === activityId ? { ...activity, ...patch } : activity
      )
    }))
  }

  function removeActivity(activityId) {
    setData((current) => ({
      ...current,
      activities: current.activities.map((activity) =>
        activity.id === activityId ? { ...activity, active: false } : activity
      )
    }))
  }

  function addReward(reward) {
    setData((current) => ({
      ...current,
      rewards: [
        ...current.rewards,
        {
          id: createId(reward.title),
          title: reward.title,
          cost: Number(reward.cost) || 10,
          icon: reward.icon || '🎁'
        }
      ]
    }))
  }

  function updateReward(rewardId, patch) {
    setData((current) => ({
      ...current,
      rewards: current.rewards.map((reward) =>
        reward.id === rewardId ? { ...reward, ...patch } : reward
      )
    }))
  }

  function removeReward(rewardId) {
    setData((current) => ({
      ...current,
      rewards: current.rewards.filter((reward) => reward.id !== rewardId)
    }))
  }

  function importData(file) {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        if (!parsed.children || !parsed.activities || !parsed.records) {
          throw new Error('Arquivo inválido')
        }
        setData(parsed)
      } catch (error) {
        alert('Não consegui importar este arquivo. Verifique se ele foi exportado pelo app.')
      }
    }
    reader.readAsText(file)
  }

  function resetData() {
    const confirmation = window.confirm('Tem certeza que deseja restaurar os dados iniciais? O histórico será apagado deste navegador.')
    if (confirmation) setData(defaultData)
  }

  const weeklySummaries = data.children.map((child) =>
    calculateWeekSummary({ child, activities: activeActivities, records: data.records, selectedDate })
  )

  return (
    <main className="app-shell">
      <header className="hero-card">
        <div>
          <p className="eyebrow">Quadro familiar</p>
          <h1>Missões da Semana</h1>
          <p className="hero-copy">
            Marque pequenas conquistas do dia, acompanhe estrelas e combine recompensas para o fim de semana.
          </p>
        </div>
        <div className="date-card">
          <span>Data de acompanhamento</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          />
        </div>
      </header>

      <section className="children-grid">
        {data.children.map((child) => {
          const summary = weeklySummaries.find((item) => item.child.id === child.id)
          return (
            <button
              key={child.id}
              className={`child-card ${selectedChildId === child.id ? 'is-selected' : ''} theme-${child.theme}`}
              onClick={() => setSelectedChildId(child.id)}
            >
              <span className="avatar">{child.avatar}</span>
              <span className="child-name">{child.name}</span>
              <span className="child-age">{child.age} anos</span>
              <ProgressBar value={summary.percentage} />
              <strong>{summary.points} estrelas nesta semana</strong>
              <small>{summary.percentage}% de conclusão</small>
            </button>
          )
        })}
      </section>

      <nav className="tabbar" aria-label="Navegação principal">
        <button className={activeTab === 'today' ? 'active' : ''} onClick={() => setActiveTab('today')}>Hoje</button>
        <button className={activeTab === 'week' ? 'active' : ''} onClick={() => setActiveTab('week')}>Semana</button>
        <button className={activeTab === 'activities' ? 'active' : ''} onClick={() => setActiveTab('activities')}>Atividades</button>
        <button className={activeTab === 'rewards' ? 'active' : ''} onClick={() => setActiveTab('rewards')}>Recompensas</button>
        <button className={activeTab === 'data' ? 'active' : ''} onClick={() => setActiveTab('data')}>Dados</button>
      </nav>

      {activeTab === 'today' && (
        <TodayPanel
          child={selectedChild}
          activities={activeActivities}
          selectedDate={selectedDate}
          records={data.records}
          notes={data.notes}
          onUpdateRecord={updateRecord}
          onUpdateNote={updateNote}
        />
      )}

      {activeTab === 'week' && (
        <WeekPanel summaries={weeklySummaries} rewards={data.rewards} selectedDate={selectedDate} />
      )}

      {activeTab === 'activities' && (
        <ActivitiesPanel
          activities={data.activities}
          onAddActivity={addActivity}
          onUpdateActivity={updateActivity}
          onRemoveActivity={removeActivity}
        />
      )}

      {activeTab === 'rewards' && (
        <RewardsPanel
          rewards={data.rewards}
          onAddReward={addReward}
          onUpdateReward={updateReward}
          onRemoveReward={removeReward}
        />
      )}

      {activeTab === 'data' && (
        <DataPanel data={data} onImportData={importData} onResetData={resetData} />
      )}
    </main>
  )
}

function TodayPanel({ child, activities, selectedDate, records, notes, onUpdateRecord, onUpdateNote }) {
  const dayRecords = records[selectedDate]?.[child.id] ?? {}
  const note = notes[selectedDate]?.[child.id] ?? ''
  const todaySummary = calculateDaySummary({ activities, dayRecords })

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Marcação diária</p>
          <h2>{child.avatar} Missões de {child.name}</h2>
        </div>
        <div className="score-pill">
          <strong>{todaySummary.points}</strong>
          <span>de {todaySummary.possiblePoints} estrelas</span>
        </div>
      </div>

      <div className="mission-list">
        {activities.map((activity) => {
          const currentStatus = dayRecords[activity.id] ?? 'pending'
          return (
            <article key={activity.id} className={`mission-card status-${currentStatus}`}>
              <div className="mission-title">
                <span>{activity.icon}</span>
                <div>
                  <h3>{activity.title}</h3>
                  <p>{activity.points} estrela{activity.points > 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="status-buttons">
                <button className={currentStatus === 'ok' ? 'ok active' : 'ok'} onClick={() => onUpdateRecord(child.id, activity.id, 'ok')}>OK</button>
                <button className={currentStatus === 'not-ok' ? 'not-ok active' : 'not-ok'} onClick={() => onUpdateRecord(child.id, activity.id, 'not-ok')}>Não OK</button>
                <button className={currentStatus === 'na' ? 'na active' : 'na'} onClick={() => onUpdateRecord(child.id, activity.id, 'na')}>N/A</button>
              </div>
            </article>
          )
        })}
      </div>

      <label className="note-box">
        Observações do dia
        <textarea
          value={note}
          onChange={(event) => onUpdateNote(child.id, event.target.value)}
          placeholder="Ex.: Teve dificuldade no almoço, mas melhorou no jantar."
        />
      </label>
    </section>
  )
}

function WeekPanel({ summaries, rewards, selectedDate }) {
  const weekDays = getWeekDates(selectedDate)
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Resumo semanal</p>
          <h2>Semana de {formatFriendlyDate(weekDays[0])} a {formatFriendlyDate(weekDays[6])}</h2>
        </div>
      </div>

      <div className="summary-grid">
        {summaries.map((summary) => (
          <article key={summary.child.id} className={`summary-card theme-${summary.child.theme}`}>
            <div className="summary-topline">
              <span className="avatar">{summary.child.avatar}</span>
              <div>
                <h3>{summary.child.name}</h3>
                <p>{summary.completed} OK de {summary.applicable} marcações aplicáveis</p>
              </div>
            </div>
            <ProgressBar value={summary.percentage} />
            <div className="big-number">{summary.percentage}%</div>
            <p className="summary-points">⭐ {summary.points} estrelas acumuladas</p>
            <p className="reward-tier">{getTierMessage(summary.percentage)}</p>
          </article>
        ))}
      </div>

      <h3 className="section-title">Prêmios possíveis</h3>
      <div className="reward-grid">
        {rewards.map((reward) => (
          <article className="reward-card" key={reward.id}>
            <span>{reward.icon}</span>
            <strong>{reward.title}</strong>
            <small>{reward.cost} estrelas</small>
          </article>
        ))}
      </div>
    </section>
  )
}

function ActivitiesPanel({ activities, onAddActivity, onUpdateActivity, onRemoveActivity }) {
  const [form, setForm] = useState({ title: '', points: 1, icon: '⭐' })

  function submit(event) {
    event.preventDefault()
    if (!form.title.trim()) return
    onAddActivity(form)
    setForm({ title: '', points: 1, icon: '⭐' })
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Configuração</p>
          <h2>Atividades</h2>
        </div>
      </div>

      <form className="inline-form" onSubmit={submit}>
        <input value={form.icon} onChange={(event) => setForm({ ...form, icon: event.target.value })} aria-label="Ícone" />
        <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Nova atividade" />
        <input type="number" min="1" value={form.points} onChange={(event) => setForm({ ...form, points: event.target.value })} aria-label="Pontos" />
        <button type="submit">Adicionar</button>
      </form>

      <div className="settings-list">
        {activities.map((activity) => (
          <article key={activity.id} className={!activity.active ? 'muted-row' : ''}>
            <input value={activity.icon} onChange={(event) => onUpdateActivity(activity.id, { icon: event.target.value })} aria-label="Ícone" />
            <input value={activity.title} onChange={(event) => onUpdateActivity(activity.id, { title: event.target.value })} aria-label="Atividade" />
            <input type="number" min="1" value={activity.points} onChange={(event) => onUpdateActivity(activity.id, { points: Number(event.target.value) })} aria-label="Pontos" />
            <label className="toggle-label">
              <input type="checkbox" checked={activity.active} onChange={(event) => onUpdateActivity(activity.id, { active: event.target.checked })} />
              Ativa
            </label>
            <button className="ghost danger" onClick={() => onRemoveActivity(activity.id)}>Remover</button>
          </article>
        ))}
      </div>
    </section>
  )
}

function RewardsPanel({ rewards, onAddReward, onUpdateReward, onRemoveReward }) {
  const [form, setForm] = useState({ title: '', cost: 10, icon: '🎁' })

  function submit(event) {
    event.preventDefault()
    if (!form.title.trim()) return
    onAddReward(form)
    setForm({ title: '', cost: 10, icon: '🎁' })
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Configuração</p>
          <h2>Recompensas</h2>
        </div>
      </div>

      <form className="inline-form" onSubmit={submit}>
        <input value={form.icon} onChange={(event) => setForm({ ...form, icon: event.target.value })} aria-label="Ícone" />
        <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Nova recompensa" />
        <input type="number" min="1" value={form.cost} onChange={(event) => setForm({ ...form, cost: event.target.value })} aria-label="Custo" />
        <button type="submit">Adicionar</button>
      </form>

      <div className="settings-list">
        {rewards.map((reward) => (
          <article key={reward.id}>
            <input value={reward.icon} onChange={(event) => onUpdateReward(reward.id, { icon: event.target.value })} aria-label="Ícone" />
            <input value={reward.title} onChange={(event) => onUpdateReward(reward.id, { title: event.target.value })} aria-label="Recompensa" />
            <input type="number" min="1" value={reward.cost} onChange={(event) => onUpdateReward(reward.id, { cost: Number(event.target.value) })} aria-label="Custo" />
            <button className="ghost danger" onClick={() => onRemoveReward(reward.id)}>Remover</button>
          </article>
        ))}
      </div>
    </section>
  )
}

function DataPanel({ data, onImportData, onResetData }) {
  const payload = JSON.stringify(data, null, 2)
  const exportHref = `data:application/json;charset=utf-8,${encodeURIComponent(payload)}`

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Backup</p>
          <h2>Dados do app</h2>
          <p className="muted-text">Nesta primeira versão, tudo fica salvo no navegador. Use a exportação para fazer backup ou passar para outro dispositivo.</p>
        </div>
      </div>
      <div className="data-actions">
        <a className="primary-link" download="missoes-da-semana-backup.json" href={exportHref}>Exportar backup</a>
        <label className="file-button">
          Importar backup
          <input type="file" accept="application/json" onChange={(event) => event.target.files?.[0] && onImportData(event.target.files[0])} />
        </label>
        <button className="ghost danger" onClick={onResetData}>Restaurar dados iniciais</button>
      </div>
    </section>
  )
}

function ProgressBar({ value }) {
  return (
    <div className="progress-track" aria-label={`Progresso ${value}%`}>
      <span style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }} />
    </div>
  )
}

function usePersistentState(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? { ...initialValue, ...JSON.parse(stored) } : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state))
  }, [key, state])

  return [state, setState]
}

function calculateDaySummary({ activities, dayRecords }) {
  return activities.reduce(
    (summary, activity) => {
      const status = dayRecords[activity.id]
      if (status === 'na') return summary
      const possiblePoints = summary.possiblePoints + activity.points
      const points = status === 'ok' ? summary.points + activity.points : summary.points
      return { points, possiblePoints }
    },
    { points: 0, possiblePoints: 0 }
  )
}

function calculateWeekSummary({ child, activities, records, selectedDate }) {
  const days = getWeekDates(selectedDate)
  let points = 0
  let possiblePoints = 0
  let completed = 0
  let applicable = 0

  days.forEach((date) => {
    const childRecords = records[date]?.[child.id] ?? {}
    activities.forEach((activity) => {
      const status = childRecords[activity.id]
      if (status === 'na') return
      possiblePoints += activity.points
      applicable += 1
      if (status === 'ok') {
        points += activity.points
        completed += 1
      }
    })
  })

  const percentage = possiblePoints > 0 ? Math.round((points / possiblePoints) * 100) : 0
  return { child, points, possiblePoints, percentage, completed, applicable }
}

function getWeekDates(dateString) {
  const date = parseLocalDate(dateString)
  const day = date.getDay()
  const distanceFromMonday = day === 0 ? -6 : 1 - day
  const monday = new Date(date)
  monday.setDate(date.getDate() + distanceFromMonday)

  return Array.from({ length: 7 }, (_, index) => {
    const nextDate = new Date(monday)
    nextDate.setDate(monday.getDate() + index)
    return formatDate(nextDate)
  })
}

function getTierMessage(percentage) {
  if (percentage >= 90) return '🏆 Prêmio Ouro: semana incrível!'
  if (percentage >= 75) return '🥈 Prêmio Prata: muito bom!'
  if (percentage >= 60) return '🥉 Prêmio Bronze: bom avanço!'
  return '💬 Semana para conversar, ajustar e tentar de novo.'
}

function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseLocalDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatFriendlyDate(dateString) {
  return parseLocalDate(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function createId(value) {
  return `${value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now().toString(36)}`
}

createRoot(document.getElementById('root')).render(<App />)
