const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const mainPath = path.join(root, 'src', 'main.jsx')
const cssPath = path.join(root, 'src', 'styles.css')

let main = fs.readFileSync(mainPath, 'utf8')
let css = fs.readFileSync(cssPath, 'utf8')
let changedMain = false
let changedCss = false

const monthBlock = String.raw`
const MONTH_SPACE_POINTS = [
  { day: 1, x: 9, y: 17, tag: 'start' },
  { day: 2, x: 23, y: 13 },
  { day: 3, x: 37, y: 14 },
  { day: 4, x: 52, y: 18 },
  { day: 5, x: 66, y: 24 },
  { day: 6, x: 72, y: 33 },
  { day: 7, x: 61, y: 42 },
  { day: 8, x: 43, y: 39 },
  { day: 9, x: 50, y: 49 },
  { day: 10, x: 15, y: 49 },
  { day: 11, x: 26, y: 56 },
  { day: 12, x: 39, y: 56 },
  { day: 13, x: 9, y: 70 },
  { day: 14, x: 22, y: 68 },
  { day: 15, x: 35, y: 67 },
  { day: 16, x: 49, y: 66 },
  { day: 17, x: 63, y: 65 },
  { day: 18, x: 78, y: 68, tag: 'today' },
  { day: 19, x: 56, y: 77 },
  { day: 20, x: 68, y: 77 },
  { day: 21, x: 80, y: 78 },
  { day: 22, x: 82, y: 88 },
  { day: 23, x: 68, y: 88 },
  { day: 24, x: 52, y: 88 },
  { day: 25, x: 35, y: 87 },
  { day: 26, x: 21, y: 96 },
  { day: 27, x: 36, y: 97 },
  { day: 28, x: 53, y: 97 },
  { day: 29, x: 69, y: 97 },
  { day: 30, x: 86, y: 94, tag: 'finish' },
  { day: 31, x: 50, y: 104 }
]

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
    }, 85)
    return () => window.clearInterval(timer)
  }, [selectedDate, selectedChildIds.join('|'), kids.length])

  const selectedKids = kids.filter((child) => selectedChildIds.includes(child.id))
  const selectedDayNumber = parseLocalDate(selectedDate).getDate()
  const monthTitle = capitalizeFirst(parseLocalDate(selectedDate).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }))

  const monthNodes = monthDays.map((date, index) => {
    const dayNumber = index + 1
    const layout = MONTH_SPACE_POINTS[index] ?? { day: dayNumber, x: 50, y: 50 }
    const childSummaries = selectedKids.map((child) => {
      const childActivities = activities.filter((activity) => activity.active && isActivityAssignedToChild(activity, child.id))
      return {
        child,
        summary: calculateDaySummary({
          activities: childActivities,
          dayRecords: records[date]?.[child.id] ?? {}
        })
      }
    })
    const totalStars = childSummaries.reduce((total, item) => total + item.summary.points, 0)
    const possibleStars = childSummaries.reduce((total, item) => total + item.summary.possiblePoints, 0)
    const redemptionItems = getRewardRedemptionItemsForDate({ date, selectedChildIds, rewardRedemptions, rewards })
    const isFuture = date > selectedDate
    return {
      date,
      index,
      layout,
      dayNumber,
      dayLabel: String(dayNumber).padStart(2, '0'),
      totalStars,
      possibleStars,
      childSummaries,
      redemptionItems,
      isFuture,
      isCurrent: date === selectedDate,
      isCompleted: date < selectedDate
    }
  })

  const monthTotals = monthNodes.filter((node) => !node.isFuture).reduce((totals, node) => {
    totals.points += node.totalStars
    totals.possiblePoints += node.possibleStars
    totals.redemptions += node.redemptionItems.length
    return totals
  }, { points: 0, possiblePoints: 0, redemptions: 0 })

  const progress = monthTotals.possiblePoints > 0 ? Math.round((monthTotals.points / monthTotals.possiblePoints) * 100) : 0

  function toggleChild(childId) {
    setSelectedChildIds((current) => {
      if (!current.includes(childId)) return [...current, childId]
      const next = current.filter((id) => id !== childId)
      return next.length ? next : [childId]
    })
  }

  return (
    <section className="panel entrance-card month-panel month-space-panel">
      <div className="month-space-topbar">
        <div className="month-title-block">
          <p className="eyebrow">Mapa espacial</p>
          <h2>Mes de {monthTitle}</h2>
          <p>Avance pela galaxia acompanhando as conquistas do mes.</p>
        </div>

        <div className="month-total-card">
          <span className="month-total-icon">⭐</span>
          <div>
            <small>Estrelas neste mes</small>
            <strong>{monthTotals.points}</strong>
            <em>Meta: {monthTotals.possiblePoints || 0}</em>
          </div>
          <ProgressBar value={progress} />
        </div>
      </div>

      <div className="month-space-filters" aria-label="Filtrar criancas na trilha mensal">
        <button type="button" className={selectedChildIds.length === allChildIds.length ? 'active' : ''} onClick={() => setSelectedChildIds(allChildIds)}>
          <span className="chip-icon">⭐</span><strong>Todas</strong>
        </button>
        {kids.map((child) => (
          <button type="button" key={child.id} className={selectedChildIds.includes(child.id) ? 'active' : ''} onClick={() => toggleChild(child.id)}>
            {child.photo ? <img src={child.photo} alt="" /> : <span className="chip-icon">{child.avatar}</span>}
            <strong>{child.name}</strong>
          </button>
        ))}
      </div>

      <div className="month-space-status">
        <span>📅 Acompanhamento ate dia <strong>{selectedDayNumber}</strong></span>
        <span>🎁 {monthTotals.redemptions} resgates no mes</span>
      </div>

      <div className="space-map-board" aria-label="Mapa espacial de progresso mensal">
        <div className="space-bg-stars" aria-hidden="true" />
        <span className="space-planet planet-a" aria-hidden="true" />
        <span className="space-planet planet-b" aria-hidden="true" />
        <span className="space-planet planet-c" aria-hidden="true" />
        <span className="space-galaxy" aria-hidden="true" />
        <span className="space-rocket" aria-hidden="true">🚀</span>
        <span className="space-flag start">COMECE AQUI!</span>
        <span className="space-flag finish">CHEGADA!</span>

        <svg className="space-path-layer" viewBox="0 0 100 108" preserveAspectRatio="none" aria-hidden="true">
          {monthNodes.slice(0, -1).map((node, index) => {
            const next = monthNodes[index + 1]
            const midX = (node.layout.x + next.layout.x) / 2
            const midY = (node.layout.y + next.layout.y) / 2 + (index % 2 === 0 ? -5 : 4)
            const completedSegment = next.index <= activeStep && next.date <= selectedDate
            return <path key={node.date} d={'M ' + node.layout.x + ' ' + node.layout.y + ' Q ' + midX + ' ' + midY + ' ' + next.layout.x + ' ' + next.layout.y} className={completedSegment ? 'space-path completed' : 'space-path future'} />
          })}
        </svg>

        {monthNodes.map((node) => {
          const hasRedemption = node.redemptionItems.length > 0
          const visible = !node.isFuture && node.index <= activeStep
          const className = [
            'space-day',
            node.isCompleted && 'completed',
            node.isCurrent && 'current',
            node.isFuture && 'future',
            visible && 'revealed',
            hasRedemption && 'reward-day'
          ].filter(Boolean).join(' ')
          return (
            <button
              type="button"
              key={node.date}
              className={className}
              style={{ left: node.layout.x + '%', top: node.layout.y + '%', animationDelay: (node.index * 55) + 'ms' }}
              title={formatFriendlyDate(node.date) + ' - ' + node.totalStars + ' estrelas'}
            >
              <span className="space-day-number">{node.dayLabel}</span>
              {!node.isFuture && <span className="space-star-badge">{node.totalStars}⭐</span>}
              {hasRedemption && <span className="space-gift" aria-label="Premio resgatado">🎁</span>}
              {node.isFuture && <span className="space-lock">🔒</span>}
              {node.isCurrent && <span className="space-today">HOJE</span>}
            </button>
          )
        })}
      </div>

      <div className="space-legend">
        <span><i className="legend-glow" /> Dias concluidos</span>
        <span>🎁 Premio resgatado</span>
        <span>🔒 Proximos dias</span>
      </div>
    </section>
  )
}
`

function replaceMonthPanel() {
  const fnIndex = main.indexOf('function MonthPanel(')
  const anchorIndex = main.indexOf('function ActivitiesPanel')
  if (fnIndex >= 0 && anchorIndex > fnIndex) {
    const ownConstIndex = main.lastIndexOf('const MONTH_SPACE_POINTS', fnIndex)
    const oldConstIndex = main.lastIndexOf('const MONTH_PATH_LAYOUT', fnIndex)
    const constIndex = Math.max(ownConstIndex, oldConstIndex)
    const start = constIndex >= 0 ? constIndex : fnIndex
    main = main.slice(0, start) + monthBlock + '\n' + main.slice(anchorIndex)
    changedMain = true
    return true
  }
  if (anchorIndex >= 0) {
    main = main.slice(0, anchorIndex) + monthBlock + '\n' + main.slice(anchorIndex)
    changedMain = true
    return true
  }
  return false
}

if (!replaceMonthPanel()) {
  throw new Error('Nao encontrei onde inserir o MonthPanel espacial.')
}

const cssMarker = '/* Space game month map v2 */'
const cssBlock = String.raw`

/* Space game month map v2 */
.month-space-panel {
  position: relative;
  overflow: hidden;
  border-color: rgba(125, 92, 255, .3);
  background:
    radial-gradient(circle at 18% 10%, rgba(99, 102, 241, .46), transparent 28%),
    radial-gradient(circle at 84% 22%, rgba(168, 85, 247, .34), transparent 24%),
    radial-gradient(circle at 28% 82%, rgba(14, 165, 233, .24), transparent 26%),
    linear-gradient(180deg, #07091f 0%, #0b1035 50%, #050719 100%);
  color: #f8fafc;
  box-shadow: 0 32px 92px rgba(4, 8, 32, .52);
}

.month-space-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: .74;
  background-image:
    radial-gradient(circle, rgba(255,255,255,.85) 0 1px, transparent 1.7px),
    radial-gradient(circle, rgba(125,211,252,.72) 0 1px, transparent 1.5px),
    radial-gradient(circle, rgba(250,204,21,.8) 0 1px, transparent 1.4px);
  background-size: 84px 84px, 131px 131px, 173px 173px;
  background-position: 0 0, 23px 47px, 72px 21px;
}

.month-space-panel > * {
  position: relative;
  z-index: 1;
}

.month-space-topbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(190px, 260px);
  gap: 18px;
  align-items: stretch;
  margin-bottom: 18px;
}

.month-title-block h2 {
  color: #fff;
  font-size: clamp(1.8rem, 5vw, 3.2rem);
  text-shadow: 0 0 24px rgba(125, 211, 252, .42);
}

.month-title-block p:not(.eyebrow) {
  margin: 8px 0 0;
  color: rgba(226, 232, 240, .78);
  font-weight: 760;
}

.month-total-card {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
  align-items: center;
  min-width: 0;
  padding: 16px;
  border: 1px solid rgba(148, 163, 255, .26);
  border-radius: 24px;
  background: rgba(16, 23, 62, .74);
  box-shadow: inset 0 0 32px rgba(99, 102, 241, .18), 0 18px 38px rgba(0, 0, 0, .18);
}

.month-total-card .progress-track {
  grid-column: 1 / -1;
  background: rgba(255, 255, 255, .16);
}

.month-total-icon {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  background: rgba(250, 204, 21, .15);
  font-size: 2.2rem;
  filter: drop-shadow(0 0 14px rgba(250, 204, 21, .55));
}

.month-total-card small,
.month-total-card em {
  display: block;
  color: rgba(226, 232, 240, .82);
  font-style: normal;
  font-weight: 850;
}

.month-total-card strong {
  display: block;
  color: #fde047;
  font-size: 2.55rem;
  line-height: .95;
  text-shadow: 0 0 18px rgba(250, 204, 21, .46);
}

.month-space-filters {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 2px 2px 14px;
  scrollbar-width: none;
}

.month-space-filters::-webkit-scrollbar {
  display: none;
}

.month-space-filters button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
  min-height: 48px;
  padding: 0 16px;
  border: 1px solid rgba(148, 163, 255, .26);
  border-radius: 999px;
  background: rgba(30, 41, 96, .76);
  color: #fff;
  font-weight: 950;
  box-shadow: 0 14px 30px rgba(0, 0, 0, .2);
}

.month-space-filters button.active {
  background: linear-gradient(135deg, #6d28d9, #2563eb);
  border-color: rgba(191, 219, 254, .52);
  box-shadow: 0 0 0 3px rgba(96, 165, 250, .16), 0 16px 34px rgba(79, 70, 229, .38);
}

.month-space-filters img,
.month-space-filters .chip-icon {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  overflow: hidden;
  border-radius: 12px;
  object-fit: cover;
  background: rgba(255,255,255,.14);
}

.month-space-status {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 18px;
}

.month-space-status span {
  padding: 10px 14px;
  border: 1px solid rgba(125, 211, 252, .24);
  border-radius: 999px;
  background: rgba(15, 23, 42, .58);
  color: rgba(241, 245, 249, .9);
  font-weight: 920;
}

.month-space-status strong {
  color: #fde047;
}

.space-map-board {
  position: relative;
  min-height: 950px;
  border: 1px solid rgba(148, 163, 255, .18);
  border-radius: 30px;
  overflow: hidden;
  background:
    radial-gradient(circle at 82% 28%, rgba(147, 51, 234, .38), transparent 18%),
    radial-gradient(circle at 23% 86%, rgba(59, 130, 246, .27), transparent 19%),
    radial-gradient(circle at 52% 12%, rgba(168, 85, 247, .2), transparent 12%),
    rgba(2, 6, 23, .34);
  box-shadow: inset 0 0 90px rgba(59, 130, 246, .14), 0 24px 60px rgba(2, 6, 23, .18);
}

.space-bg-stars {
  position: absolute;
  inset: 0;
  opacity: .8;
  background-image:
    radial-gradient(circle, rgba(255,255,255,.8) 0 1px, transparent 1.7px),
    radial-gradient(circle, rgba(186,230,253,.72) 0 1px, transparent 1.6px);
  background-size: 58px 58px, 96px 96px;
  background-position: 5px 9px, 29px 41px;
}

.space-path-layer {
  position: absolute;
  inset: 0;
  z-index: 2;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.space-path {
  fill: none;
  stroke-width: 1.25;
  stroke-linecap: round;
}

.space-path.completed {
  stroke: #67e8f9;
  filter: drop-shadow(0 0 6px rgba(103, 232, 249, .95));
}

.space-path.future {
  stroke: rgba(203, 213, 225, .32);
  stroke-dasharray: 2.3 2.8;
}

.space-day {
  position: absolute;
  z-index: 3;
  transform: translate(-50%, -50%) scale(.92);
  width: 62px;
  height: 62px;
  border: 0;
  border-radius: 999px;
  background: radial-gradient(circle at 35% 25%, #eff6ff, #93c5fd 38%, #2563eb 70%, #1e1b4b);
  color: #0f172a;
  display: grid;
  place-items: center;
  box-shadow: 0 0 0 3px rgba(103,232,249,.24), 0 0 28px rgba(56,189,248,.62);
  opacity: .7;
  transition: transform .25s ease, opacity .25s ease, filter .25s ease;
}

.space-day.revealed {
  opacity: 1;
  animation: spaceNodeReveal .42s ease both;
}

.space-day:hover {
  transform: translate(-50%, -50%) scale(1.08);
}

.space-day.current {
  width: 96px;
  height: 96px;
  z-index: 5;
  background: radial-gradient(circle at 35% 24%, #ffffff, #cffafe 22%, #38bdf8 48%, #2563eb 76%, #172554);
  box-shadow: 0 0 0 8px rgba(103,232,249,.16), 0 0 46px rgba(56,189,248,.98), inset 0 -10px 24px rgba(15,23,42,.24);
}

.space-day.future {
  background: radial-gradient(circle at 35% 25%, rgba(226,232,240,.64), rgba(71,85,105,.78));
  color: rgba(226,232,240,.72);
  box-shadow: none;
  opacity: .48;
  filter: grayscale(.5);
}

.space-day-number {
  font-size: 1.26rem;
  font-weight: 1000;
  line-height: 1;
  letter-spacing: -.04em;
}

.space-day.current .space-day-number {
  font-size: 2.2rem;
  text-shadow: 0 0 12px rgba(255,255,255,.45);
}

.space-star-badge {
  position: absolute;
  bottom: -16px;
  min-width: 42px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(7, 10, 32, .94);
  color: #fde047;
  font-size: .76rem;
  font-weight: 1000;
  box-shadow: 0 8px 18px rgba(0,0,0,.28);
}

.space-gift {
  position: absolute;
  top: -18px;
  right: -7px;
  font-size: 1.42rem;
  filter: drop-shadow(0 0 12px rgba(250, 204, 21, .58));
}

.space-lock {
  position: absolute;
  right: -6px;
  bottom: -8px;
  font-size: .9rem;
  opacity: .9;
}

.space-today {
  position: absolute;
  right: -10px;
  top: 50%;
  transform: translate(100%, -50%);
  padding: 7px 11px;
  border-radius: 999px;
  background: linear-gradient(135deg, #7c3aed, #db2777);
  color: #fff;
  font-size: .68rem;
  font-weight: 1000;
  letter-spacing: .08em;
  box-shadow: 0 10px 24px rgba(124, 58, 237, .42);
}

.space-planet,
.space-galaxy,
.space-rocket,
.space-flag {
  position: absolute;
  z-index: 1;
  pointer-events: none;
}

.space-planet {
  border-radius: 999px;
  filter: drop-shadow(0 0 18px rgba(125,211,252,.22));
}

.planet-a {
  left: 5%;
  top: 9%;
  width: 92px;
  height: 92px;
  background: radial-gradient(circle at 30% 30%, #bbf7d0, #22c55e 45%, #065f46 78%);
}

.planet-a::after {
  content: '';
  position: absolute;
  left: -18px;
  right: -18px;
  top: 40px;
  height: 12px;
  border: 3px solid rgba(186,230,253,.7);
  border-left-color: transparent;
  border-right-color: transparent;
  border-radius: 999px;
  transform: rotate(-18deg);
}

.planet-b {
  right: 7%;
  top: 34%;
  width: 104px;
  height: 104px;
  background: radial-gradient(circle at 30% 30%, #fecaca, #f97316 45%, #7c2d12 82%);
}

.planet-b::after {
  content: '';
  position: absolute;
  left: -18px;
  right: -18px;
  top: 45px;
  height: 13px;
  border: 4px solid rgba(253,186,116,.58);
  border-left-color: transparent;
  border-right-color: transparent;
  border-radius: 999px;
  transform: rotate(-18deg);
}

.planet-c {
  left: 7%;
  bottom: 7%;
  width: 126px;
  height: 126px;
  background: radial-gradient(circle at 30% 30%, #e9d5ff, #8b5cf6 42%, #3b0764 82%);
  opacity: .78;
}

.space-galaxy {
  right: 17%;
  top: 17%;
  width: 128px;
  height: 128px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(216,180,254,.78), rgba(124,58,237,.32) 35%, transparent 62%);
  box-shadow: 0 0 40px rgba(168,85,247,.26);
}

.space-rocket {
  right: 18%;
  top: 58%;
  z-index: 4;
  font-size: 2.8rem;
  transform: rotate(34deg);
  filter: drop-shadow(0 10px 20px rgba(251, 146, 60, .34));
}

.space-flag {
  z-index: 6;
  padding: 7px 10px;
  border-radius: 12px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: #fde047;
  font-size: .68rem;
  font-weight: 1000;
  box-shadow: 0 10px 24px rgba(37,99,235,.36);
}

.space-flag.start {
  left: 11%;
  top: 6%;
  transform: rotate(-6deg);
}

.space-flag.finish {
  right: 4%;
  bottom: 7%;
  transform: rotate(-10deg);
}

.space-legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 14px;
  padding: 12px;
  border: 1px solid rgba(148,163,255,.18);
  border-radius: 20px;
  background: rgba(15,23,42,.48);
  color: rgba(241,245,249,.9);
  font-weight: 900;
}

.space-legend span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.legend-glow {
  width: 34px;
  height: 4px;
  border-radius: 999px;
  background: #67e8f9;
  box-shadow: 0 0 14px rgba(103,232,249,.9);
}

@keyframes spaceNodeReveal {
  0% { opacity: .15; transform: translate(-50%, -50%) scale(.62); }
  70% { transform: translate(-50%, -50%) scale(1.08); }
  100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

@media (max-width: 760px) {
  .month-space-topbar { grid-template-columns: 1fr; }
  .space-map-board { min-height: 760px; border-radius: 24px; }
  .space-day { width: 48px; height: 48px; }
  .space-day.current { width: 76px; height: 76px; }
  .space-day-number { font-size: 1rem; }
  .space-day.current .space-day-number { font-size: 1.7rem; }
  .space-star-badge { bottom: -14px; font-size: .65rem; padding: 3px 6px; }
  .space-today { top: auto; right: 50%; bottom: -34px; transform: translateX(50%); }
  .planet-a { width: 68px; height: 68px; }
  .planet-b { width: 78px; height: 78px; }
  .planet-c { width: 94px; height: 94px; }
  .space-galaxy { width: 92px; height: 92px; }
  .space-rocket { font-size: 2rem; }
}

@media (max-width: 430px) {
  .space-map-board { min-height: 660px; }
  .space-day { width: 42px; height: 42px; }
  .space-day.current { width: 66px; height: 66px; }
  .space-gift { font-size: 1.08rem; top: -14px; }
  .space-flag { font-size: .58rem; }
}
`

if (!css.includes(cssMarker)) {
  css += cssBlock
  changedCss = true
}

if (changedMain) fs.writeFileSync(mainPath, main)
if (changedCss) fs.writeFileSync(cssPath, css)

console.log('apply-month-space-map-manual: ok')
