const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const mainPath = path.join(root, 'src', 'main.jsx')
const cssPath = path.join(root, 'src', 'styles.css')

let main = fs.readFileSync(mainPath, 'utf8')
let css = fs.readFileSync(cssPath, 'utf8')
let changedMain = false
let changedCss = false

function replaceMain(search, replacement, label) {
  if (!main.includes(search)) {
    throw new Error('Não encontrei o trecho esperado em src/main.jsx: ' + label)
  }
  main = main.replace(search, replacement)
  changedMain = true
}

if (main.includes('nextChildRedemptions[rewardId] = true')) {
  main = main.replace('nextChildRedemptions[rewardId] = true', 'nextChildRedemptions[rewardId] = selectedDate')
  changedMain = true
}

if (!main.includes('function MonthPanel(')) {
  replaceMain(
    "          <button className={activeTab === 'week' ? 'active' : ''} onClick={() => setActiveTab('week')}>Semana</button>\n          <button className={activeTab === 'activities' ? 'active' : ''} onClick={() => setActiveTab('activities')}>Atividades</button>",
    "          <button className={activeTab === 'week' ? 'active' : ''} onClick={() => setActiveTab('week')}>Semana</button>\n          <button className={activeTab === 'month' ? 'active' : ''} onClick={() => setActiveTab('month')}>Mês</button>\n          <button className={activeTab === 'activities' ? 'active' : ''} onClick={() => setActiveTab('activities')}>Atividades</button>",
    'botão da aba Mês'
  )

  replaceMain(
    "        {activeTab === 'week' && <WeekPanel summaries={weeklySummaries.filter((summary) => summary.child.id === selectedChildId)} rewards={data.rewards} selectedDate={selectedDate} rewardRedemptions={data.rewardRedemptions} transfers={data.transfers} onTogglePrize={togglePrizeRedemption} onTransferBalance={transferBalanceToNextWeek} />}\n        {activeTab === 'activities' && <ActivitiesPanel activities={orderedActivities} children={data.children} onAddActivity={addActivity} onUpdateActivity={updateActivity} onRemoveActivity={removeActivity} onMoveActivity={moveActivity} />}",
    "        {activeTab === 'week' && <WeekPanel summaries={weeklySummaries.filter((summary) => summary.child.id === selectedChildId)} rewards={data.rewards} selectedDate={selectedDate} rewardRedemptions={data.rewardRedemptions} transfers={data.transfers} onTogglePrize={togglePrizeRedemption} onTransferBalance={transferBalanceToNextWeek} />}\n        {activeTab === 'month' && <MonthPanel kids={data.children} selectedChildId={selectedChildId} activities={orderedActivities} selectedDate={selectedDate} records={data.records} rewards={data.rewards} rewardRedemptions={data.rewardRedemptions} />}\n        {activeTab === 'activities' && <ActivitiesPanel activities={orderedActivities} children={data.children} onAddActivity={addActivity} onUpdateActivity={updateActivity} onRemoveActivity={removeActivity} onMoveActivity={moveActivity} />}",
    'renderização da aba Mês'
  )

  const monthPanel = String.raw`
function MonthPanel({ kids, selectedChildId, activities, selectedDate, records, rewards, rewardRedemptions }) {
  const monthDays = getMonthDates(selectedDate)
  const allChildIds = kids.map((child) => child.id)
  const [selectedChildIds, setSelectedChildIds] = useState(() => selectedChildId ? [selectedChildId] : allChildIds)
  const [activeStep, setActiveStep] = useState(-1)

  useEffect(() => {
    setSelectedChildIds((current) => {
      const validIds = current.filter((id) => allChildIds.includes(id))
      if (validIds.length) return validIds
      return selectedChildId && allChildIds.includes(selectedChildId) ? [selectedChildId] : allChildIds
    })
  }, [kids.length, selectedChildId])

  useEffect(() => {
    setActiveStep(-1)
    const targetIndex = Math.max(0, monthDays.findIndex((date) => date === selectedDate))
    let step = -1
    const timer = window.setInterval(() => {
      step += 1
      setActiveStep(step)
      if (step >= targetIndex) window.clearInterval(timer)
    }, 90)
    return () => window.clearInterval(timer)
  }, [selectedDate, selectedChildIds.join('|'), kids.length])

  const selectedKids = kids.filter((child) => selectedChildIds.includes(child.id))
  const monthTitle = capitalizeFirst(parseLocalDate(selectedDate).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }))
  const monthTotals = monthDays.filter((date) => date <= selectedDate).reduce((totals, date) => {
    selectedKids.forEach((child) => {
      const childActivities = activities.filter((activity) => activity.active && isActivityAssignedToChild(activity, child.id))
      const summary = calculateDaySummary({ activities: childActivities, dayRecords: records[date]?.[child.id] ?? {} })
      totals.points += summary.points
      totals.possiblePoints += summary.possiblePoints
    })
    totals.redemptions += getRewardRedemptionItemsForDate({ date, selectedChildIds, rewardRedemptions, rewards }).length
    return totals
  }, { points: 0, possiblePoints: 0, redemptions: 0 })

  function toggleChild(childId) {
    setSelectedChildIds((current) => {
      if (!current.includes(childId)) return [...current, childId]
      const next = current.filter((id) => id !== childId)
      return next.length ? next : [childId]
    })
  }

  return (
    <section className="panel entrance-card month-panel">
      <div className="panel-header">
        <div><p className="eyebrow">Trilha mensal</p><h2>Mês de {monthTitle}</h2><p className="muted-text">Acompanhe cada dia como um passo da trilha. Os passos após a data de acompanhamento ficam desativados.</p></div>
        <div className="score-pill"><strong>{monthTotals.points}</strong><span>estrelas até {formatFriendlyDate(selectedDate)}</span></div>
      </div>

      <div className="month-selector" aria-label="Filtrar crianças na trilha mensal">
        <button className={selectedChildIds.length === allChildIds.length ? 'active' : ''} onClick={() => setSelectedChildIds(allChildIds)}>Todas</button>
        {kids.map((child) => (
          <button key={child.id} className={selectedChildIds.includes(child.id) ? 'active' : ''} onClick={() => toggleChild(child.id)}>{child.photo ? <img src={child.photo} alt="" /> : child.avatar}<span>{child.name}</span></button>
        ))}
      </div>

      <div className="month-trail" aria-label="Trilha de progresso do mês">
        {monthDays.map((date, index) => {
          const dayDate = parseLocalDate(date)
          const dayNumber = String(dayDate.getDate()).padStart(2, '0')
          const isFuture = date > selectedDate
          const childSummaries = selectedKids.map((child) => {
            const childActivities = activities.filter((activity) => activity.active && isActivityAssignedToChild(activity, child.id))
            return { child, summary: calculateDaySummary({ activities: childActivities, dayRecords: records[date]?.[child.id] ?? {} }) }
          })
          const dayPoints = childSummaries.reduce((total, item) => total + item.summary.points, 0)
          const redemptionItems = getRewardRedemptionItemsForDate({ date, selectedChildIds, rewardRedemptions, rewards })
          const stepClassName = [
            'month-step',
            isFuture && 'is-future',
            !isFuture && index <= activeStep && 'is-visited',
            !isFuture && index === activeStep && 'is-active-step',
            date === selectedDate && 'is-selected-day',
            redemptionItems.length > 0 && 'has-redemption'
          ].filter(Boolean).join(' ')

          return (
            <article key={date} className={stepClassName}>
              <div className="month-step-node"><span>{dayNumber}</span></div>
              <div className="month-step-card">
                <div className="month-step-header"><strong>{formatFriendlyDate(date)}</strong><span>{isFuture ? 'Em breve' : dayPoints + ' ⭐'}</span></div>
                <div className="month-kid-results">
                  {childSummaries.map(({ child, summary }) => (
                    <span key={child.id} className={'month-child-result theme-' + (child.theme ?? 'blue')}>
                      <span className="month-child-avatar">{child.photo ? <img src={child.photo} alt="" /> : child.avatar}</span>
                      <span>{child.name}</span>
                      <strong>{isFuture ? '—' : summary.points + ' ⭐'}</strong>
                    </span>
                  ))}
                </div>
                {redemptionItems.length > 0 && !isFuture && <div className="month-redemption-badge"><span>🎁</span><strong>{redemptionItems.length === 1 ? '1 prêmio resgatado' : redemptionItems.length + ' prêmios resgatados'}</strong><small>{redemptionItems.slice(0, 3).map((item) => item.icon || '🏆').join(' ')}</small></div>}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
`

  replaceMain(
    'function ActivitiesPanel({ activities, children, onAddActivity, onUpdateActivity, onRemoveActivity, onMoveActivity }) {',
    monthPanel + '\nfunction ActivitiesPanel({ activities, children, onAddActivity, onUpdateActivity, onRemoveActivity, onMoveActivity }) {',
    'componente MonthPanel'
  )

  const helperBlock = String.raw`
function getMonthDates(dateString) { const date = parseLocalDate(dateString); const first = new Date(date.getFullYear(), date.getMonth(), 1); const last = new Date(date.getFullYear(), date.getMonth() + 1, 0); return Array.from({ length: last.getDate() }, (_, index) => { const nextDate = new Date(first); nextDate.setDate(index + 1); return formatDate(nextDate) }) }
function getRewardRedemptionItemsForDate({ date, selectedChildIds, rewardRedemptions, rewards }) { const selectedSet = new Set(selectedChildIds); const items = []; Object.entries(rewardRedemptions ?? {}).forEach(([weekKey, weekRedemptions]) => { Object.entries(weekRedemptions ?? {}).forEach(([childId, childRedemptions]) => { if (!selectedSet.has(childId)) return; Object.entries(childRedemptions ?? {}).forEach(([rewardId, redemptionValue]) => { const redemptionDate = typeof redemptionValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(redemptionValue) ? redemptionValue : weekKey; if (redemptionDate !== date) return; const reward = rewards.find((item) => item.id === rewardId); items.push(reward ?? { id: rewardId, title: 'Prêmio resgatado', icon: '🏆' }) }) }) }); return items }
function capitalizeFirst(value) { const text = String(value ?? ''); return text ? text.charAt(0).toUpperCase() + text.slice(1) : text }
`

  replaceMain(
    'function calculateUsedRewards(redemptions, rewards) { return rewards.reduce((total, reward) => redemptions?.[reward.id] ? total + clampTwoDigit(reward.cost, 0) : total, 0) }\nfunction getWeekDates(dateString) {',
    'function calculateUsedRewards(redemptions, rewards) { return rewards.reduce((total, reward) => redemptions?.[reward.id] ? total + clampTwoDigit(reward.cost, 0) : total, 0) }\n' + helperBlock + 'function getWeekDates(dateString) {',
    'helpers da aba Mês'
  )
}

const monthCssMarker = '/* Month progress trail */'
if (!css.includes(monthCssMarker)) {
  css += String.raw`

/* Month progress trail */
.month-panel .panel-header { align-items: center; }
.month-selector { display: flex; flex-wrap: wrap; gap: 10px; margin: -4px 0 22px; }
.month-selector button { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 14px; border: 1px solid rgba(124, 58, 237, .14); border-radius: 999px; background: color-mix(in srgb, var(--card) 78%, transparent); color: var(--ink); font-weight: 900; box-shadow: 0 12px 26px rgba(15, 23, 42, .06); }
.month-selector button.active { background: #111827; color: #fff; transform: translateY(-1px); }
:root[data-theme="dark"] .month-selector button.active { background: #f8fafc; color: #111827; }
.month-selector img { width: 26px; height: 26px; border-radius: 10px; object-fit: cover; }
.month-trail { position: relative; display: grid; gap: 14px; }
.month-step { position: relative; display: grid; grid-template-columns: 56px minmax(0, 1fr); gap: 12px; opacity: .62; transform: translateY(10px); transition: opacity .28s ease, transform .28s ease, filter .28s ease; }
.month-step::before { content: ''; position: absolute; left: 27px; top: 52px; bottom: -18px; width: 3px; border-radius: 999px; background: linear-gradient(180deg, rgba(124, 58, 237, .32), rgba(14, 165, 233, .2)); }
.month-step:last-child::before { display: none; }
.month-step.is-visited { opacity: 1; transform: translateY(0); }
.month-step.is-future { opacity: .36; filter: grayscale(.35); }
.month-step-node { position: relative; z-index: 1; width: 56px; height: 56px; display: grid; place-items: center; border: 2px solid transparent; border-radius: 20px; background: color-mix(in srgb, var(--card) 88%, transparent); color: var(--ink); font-weight: 950; box-shadow: 0 16px 34px rgba(15, 23, 42, .12); }
.month-step.is-visited .month-step-node { background: #111827; color: #fff; animation: monthNodePop .32s ease; }
:root[data-theme="dark"] .month-step.is-visited .month-step-node { background: #f8fafc; color: #111827; }
.month-step.is-selected-day .month-step-node { border-color: var(--amber); box-shadow: 0 18px 42px rgba(245, 158, 11, .22); }
.month-step-card { padding: 16px; border: 1px solid var(--line); border-radius: 24px; background: color-mix(in srgb, var(--card) 86%, transparent); box-shadow: 0 18px 44px rgba(15, 23, 42, .08); }
.month-step.is-active-step .month-step-card { animation: monthStepGlow .48s ease; }
.month-step-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.month-step-header strong { font-size: 1.05rem; }
.month-step-header span { padding: 6px 10px; border-radius: 999px; background: rgba(124, 58, 237, .1); color: color-mix(in srgb, var(--purple) 78%, var(--ink)); font-weight: 950; }
.month-kid-results { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.month-child-result { display: inline-flex; align-items: center; gap: 7px; padding: 7px 9px; border: 1px solid rgba(255, 255, 255, .62); border-radius: 999px; font-size: .84rem; font-weight: 850; box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .28); }
.month-child-result strong { color: color-mix(in srgb, var(--purple) 78%, var(--ink)); }
.month-child-avatar { width: 24px; height: 24px; display: inline-grid; place-items: center; overflow: hidden; border-radius: 9px; background: rgba(255,255,255,.6); }
.month-child-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
.month-redemption-badge { display: flex; align-items: center; gap: 8px; width: fit-content; margin-top: 12px; padding: 8px 10px; border-radius: 999px; background: rgba(245, 158, 11, .14); color: color-mix(in srgb, var(--amber) 70%, var(--ink)); font-weight: 950; }
.month-redemption-badge small { color: inherit; opacity: .86; }
@keyframes monthNodePop { 0% { transform: scale(.72); } 70% { transform: scale(1.08); } 100% { transform: scale(1); } }
@keyframes monthStepGlow { 0% { box-shadow: 0 0 0 rgba(124, 58, 237, 0); } 50% { box-shadow: 0 0 0 6px var(--ring), 0 18px 44px rgba(15, 23, 42, .12); } 100% { box-shadow: 0 18px 44px rgba(15, 23, 42, .08); } }
@media (max-width: 640px) {
  .month-step { grid-template-columns: 46px minmax(0, 1fr); gap: 10px; }
  .month-step::before { left: 22px; top: 46px; }
  .month-step-node { width: 46px; height: 46px; border-radius: 16px; }
  .month-step-card { padding: 14px; border-radius: 20px; }
  .month-step-header { align-items: flex-start; flex-direction: column; }
}
`
  changedCss = true
}

if (changedMain) fs.writeFileSync(mainPath, main)
if (changedCss) fs.writeFileSync(cssPath, css)

console.log('apply-month-progress: ok')
