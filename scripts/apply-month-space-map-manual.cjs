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
const MONTH_V4_POINTS = [
  { day: 1, x: 12, y: 16 },
  { day: 2, x: 30, y: 12 },
  { day: 3, x: 48, y: 13 },
  { day: 4, x: 66, y: 18 },
  { day: 5, x: 78, y: 28 },
  { day: 6, x: 74, y: 38 },
  { day: 7, x: 61, y: 44 },
  { day: 8, x: 42, y: 40 },
  { day: 9, x: 52, y: 50 },
  { day: 10, x: 18, y: 51 },
  { day: 11, x: 29, y: 59 },
  { day: 12, x: 44, y: 58 },
  { day: 13, x: 12, y: 72 },
  { day: 14, x: 26, y: 70 },
  { day: 15, x: 40, y: 68 },
  { day: 16, x: 54, y: 67 },
  { day: 17, x: 68, y: 66 },
  { day: 18, x: 80, y: 70 },
  { day: 19, x: 58, y: 78 },
  { day: 20, x: 72, y: 78 },
  { day: 21, x: 84, y: 80 },
  { day: 22, x: 82, y: 90 },
  { day: 23, x: 67, y: 90 },
  { day: 24, x: 51, y: 90 },
  { day: 25, x: 34, y: 88 },
  { day: 26, x: 22, y: 98 },
  { day: 27, x: 38, y: 99 },
  { day: 28, x: 55, y: 99 },
  { day: 29, x: 72, y: 99 },
  { day: 30, x: 88, y: 96 },
  { day: 31, x: 50, y: 106 }
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
    }, 78)
    return () => window.clearInterval(timer)
  }, [selectedDate, selectedChildIds.join('|'), kids.length])

  const selectedKids = kids.filter((child) => selectedChildIds.includes(child.id))
  const selectedDayNumber = parseLocalDate(selectedDate).getDate()

  const monthNodes = monthDays.map((date, index) => {
    const dayNumber = index + 1
    const layout = MONTH_V4_POINTS[index] ?? { day: dayNumber, x: 50, y: 50 }
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
    <section className="panel entrance-card month-panel month-v4-panel">
      <div className="month-v4-shell">
        <div className="month-v4-header">
          <div className="month-v4-date"><span>📅</span> Acompanhamento até dia <strong>{selectedDayNumber}</strong></div>

          <div className="month-v4-summary">
            <span className="month-v4-big-star">⭐</span>
            <div>
              <small>Estrelas neste mês</small>
              <strong>{monthTotals.points}</strong>
              <em>Meta: {monthTotals.possiblePoints || 0}</em>
            </div>
            <ProgressBar value={progress} />
          </div>

          <div className="month-v4-filters" aria-label="Filtrar crianças na trilha mensal">
            <button type="button" className={selectedChildIds.length === allChildIds.length ? 'active' : ''} onClick={() => setSelectedChildIds(allChildIds)}>
              <span>⭐</span><strong>Todas</strong>
            </button>
            {kids.map((child) => (
              <button type="button" key={child.id} className={selectedChildIds.includes(child.id) ? 'active' : ''} onClick={() => toggleChild(child.id)}>
                {child.photo ? <img src={child.photo} alt="" /> : <span>{child.avatar}</span>}
                <strong>{child.name}</strong>
              </button>
            ))}
          </div>
        </div>

        <div className="month-v4-board" aria-label="Mapa espacial de progresso mensal">
          <div className="v4-stars" aria-hidden="true" />
          <div className="v4-nebula v4-nebula-a" aria-hidden="true" />
          <div className="v4-nebula v4-nebula-b" aria-hidden="true" />
          <div className="v4-galaxy" aria-hidden="true" />
          <div className="v4-blackhole" aria-hidden="true" />
          <div className="v4-comet" aria-hidden="true" />
          <div className="v4-satellite" aria-hidden="true"><i /><b /><em /></div>

          <div className="v4-rocket v4-launch" aria-hidden="true"><i /><b /><em /><small /></div>
          <div className="v4-rocket v4-flying" aria-hidden="true"><i /><b /><em /><small /></div>

          <span className="v4-planet v4-green" aria-hidden="true" />
          <span className="v4-planet v4-orange" aria-hidden="true" />
          <span className="v4-planet v4-pink" aria-hidden="true" />
          <span className="v4-planet v4-purple" aria-hidden="true" />

          <span className="v4-asteroid v4-ast-a" aria-hidden="true" />
          <span className="v4-asteroid v4-ast-b" aria-hidden="true" />
          <span className="v4-asteroid v4-ast-c" aria-hidden="true" />
          <span className="v4-asteroid v4-ast-d" aria-hidden="true" />
          <span className="v4-asteroid v4-ast-e" aria-hidden="true" />

          <span className="v4-flag v4-start-flag">DECOLAMOS!</span>
          <span className="v4-flag v4-finish-flag">CHEGAMOS!</span>

          <svg className="v4-path-layer" viewBox="0 0 100 110" preserveAspectRatio="none" aria-hidden="true">
            {monthNodes.slice(0, -1).map((node, index) => {
              const next = monthNodes[index + 1]
              const midX = (node.layout.x + next.layout.x) / 2
              const midY = (node.layout.y + next.layout.y) / 2 + (index % 2 === 0 ? -5.2 : 4.2)
              const completedSegment = next.index <= activeStep && next.date <= selectedDate
              const pathD = 'M ' + node.layout.x + ' ' + node.layout.y + ' Q ' + midX + ' ' + midY + ' ' + next.layout.x + ' ' + next.layout.y
              return (
                <g key={node.date}>
                  <path d={pathD} className={completedSegment ? 'v4-path v4-path-glow done' : 'v4-path v4-path-glow future'} />
                  <path d={pathD} className={completedSegment ? 'v4-path v4-path-core done' : 'v4-path v4-path-core future'} />
                </g>
              )
            })}
          </svg>

          {monthNodes.map((node) => {
            const hasRedemption = node.redemptionItems.length > 0
            const visible = !node.isFuture && node.index <= activeStep
            const className = [
              'v4-day',
              node.isCompleted && 'completed',
              node.isCurrent && 'current',
              node.isFuture && 'future',
              visible && 'revealed',
              hasRedemption && 'reward-day'
            ].filter(Boolean).join(' ')
            return (
              <button type="button" key={node.date} className={className} style={{ left: node.layout.x + '%', top: node.layout.y + '%', animationDelay: (node.index * 48) + 'ms' }} title={formatFriendlyDate(node.date) + ' - ' + node.totalStars + ' estrelas'}>
                <span className="v4-day-shine" />
                <span className="v4-day-number">{node.dayLabel}</span>
                {!node.isFuture && <span className="v4-star-badge">{node.totalStars}⭐</span>}
                {hasRedemption && <span className="v4-gift">🎁</span>}
                {node.isFuture && <span className="v4-lock">🔒</span>}
                {node.isCurrent && <span className="v4-today-flag">HOJE</span>}
              </button>
            )
          })}
        </div>

        <div className="month-v4-legend">
          <span><i /> Dias concluídos</span>
          <span>🎁 Prêmio resgatado</span>
          <span>🔒 Próximos dias</span>
        </div>
      </div>
    </section>
  )
}
`

function replaceMonthPanel() {
  const fnIndex = main.indexOf('function MonthPanel(')
  const anchorIndex = main.indexOf('function ActivitiesPanel')
  if (fnIndex >= 0 && anchorIndex > fnIndex) {
    const oldA = main.lastIndexOf('const MONTH_SPACE_POINTS', fnIndex)
    const oldB = main.lastIndexOf('const MONTH_PATH_LAYOUT', fnIndex)
    const oldC = main.lastIndexOf('const MONTH_V4_POINTS', fnIndex)
    const start = Math.max(oldA, oldB, oldC) >= 0 ? Math.max(oldA, oldB, oldC) : fnIndex
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
  throw new Error('Nao encontrei onde inserir o MonthPanel v4.')
}

const cssMarker = '/* Month space v4 polished game map */'
const cssBlock = String.raw`

/* Month space v4 polished game map */
.month-v4-panel {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 20% 0%, rgba(78, 70, 229, .25), transparent 26%),
    radial-gradient(circle at 85% 25%, rgba(147, 51, 234, .18), transparent 24%),
    linear-gradient(180deg, #071033 0%, #070c24 100%);
  color: #f8fafc;
  border-color: rgba(111, 139, 255, .18);
}

.month-v4-shell {
  max-width: 650px;
  margin: 0 auto;
}

.month-v4-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 230px;
  grid-template-areas:
    "date summary"
    "filters summary";
  gap: 12px 14px;
  align-items: start;
  margin-bottom: 16px;
}

.month-v4-date {
  grid-area: date;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  width: fit-content;
  max-width: 100%;
  padding: 11px 15px;
  border-radius: 17px;
  background: rgba(13, 24, 65, .82);
  border: 1px solid rgba(142, 171, 255, .18);
  color: rgba(241,245,249,.92);
  font-weight: 900;
  box-shadow: 0 14px 28px rgba(2, 6, 23, .22), inset 0 1px 0 rgba(255,255,255,.06);
}
.month-v4-date strong { color: #facc15; }

.month-v4-summary {
  grid-area: summary;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
  align-items: center;
  width: 230px;
  padding: 15px;
  border-radius: 23px;
  background: linear-gradient(180deg, rgba(29, 31, 87, .96), rgba(15, 23, 58, .96));
  border: 1px solid rgba(155, 170, 255, .22);
  box-shadow: 0 18px 38px rgba(2, 6, 23, .32), inset 0 0 30px rgba(99, 102, 241, .16);
}
.month-v4-summary .progress-track { grid-column: 1 / -1; background: rgba(255,255,255,.15); }
.month-v4-big-star {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  background: radial-gradient(circle at 35% 35%, #fff6a4, #f5c542 60%, #d18b16 100%);
  font-size: 2rem;
  filter: drop-shadow(0 0 14px rgba(250,204,21,.38));
}
.month-v4-summary small,
.month-v4-summary em {
  display: block;
  color: rgba(226,232,240,.82);
  font-size: .78rem;
  font-style: normal;
  font-weight: 850;
}
.month-v4-summary strong {
  display: block;
  color: #ffd84b;
  font-size: 2.6rem;
  line-height: .92;
  text-shadow: 0 0 18px rgba(250,204,21,.4);
}

.month-v4-filters {
  grid-area: filters;
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 2px 2px 8px;
  scrollbar-width: none;
}
.month-v4-filters::-webkit-scrollbar { display: none; }
.month-v4-filters button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
  min-height: 46px;
  padding: 0 15px;
  border: 1px solid rgba(143,163,255,.2);
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(35, 45, 110, .96), rgba(20, 26, 72, .96));
  color: #fff;
  font-weight: 950;
  box-shadow: 0 12px 26px rgba(6, 10, 31, .26), inset 0 1px 0 rgba(255,255,255,.08);
}
.month-v4-filters button.active {
  background: linear-gradient(135deg, #6a41ff, #4e8dff);
  border-color: rgba(191,219,254,.42);
  box-shadow: 0 0 0 3px rgba(97, 218, 251, .12), 0 14px 28px rgba(64, 64, 220, .34);
}
.month-v4-filters img,
.month-v4-filters button > span {
  width: 29px;
  height: 29px;
  display: grid;
  place-items: center;
  overflow: hidden;
  border-radius: 11px;
  background: rgba(255,255,255,.12);
  object-fit: cover;
}

.month-v4-board {
  position: relative;
  width: min(100%, 620px);
  aspect-ratio: 9 / 16;
  margin: 0 auto;
  border-radius: 30px;
  overflow: hidden;
  background:
    radial-gradient(circle at 80% 27%, rgba(111, 30, 155, .32), transparent 21%),
    radial-gradient(circle at 17% 87%, rgba(38, 112, 255, .18), transparent 20%),
    linear-gradient(180deg, #081438 0%, #08112d 52%, #070d22 100%);
  border: 1px solid rgba(145, 161, 255, .14);
  box-shadow: inset 0 0 120px rgba(11, 20, 64, .85), 0 22px 52px rgba(2, 6, 23, .22);
}

.v4-stars {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle, rgba(255,255,255,.92) 0 1px, transparent 1.6px),
    radial-gradient(circle, rgba(158,219,255,.9) 0 1px, transparent 1.7px),
    radial-gradient(circle, rgba(255,215,91,.9) 0 1px, transparent 1.5px);
  background-size: 46px 46px, 82px 82px, 116px 116px;
  background-position: 0 0, 21px 35px, 61px 16px;
  opacity: .72;
}

.v4-nebula,
.v4-galaxy,
.v4-blackhole,
.v4-comet,
.v4-satellite,
.v4-rocket,
.v4-planet,
.v4-asteroid,
.v4-flag {
  position: absolute;
  pointer-events: none;
}

.v4-nebula {
  border-radius: 999px;
  filter: blur(5px);
  opacity: .85;
}
.v4-nebula-a {
  right: 8%;
  top: 9%;
  width: 42%;
  height: 24%;
  background: radial-gradient(circle at 48% 46%, rgba(189, 105, 255, .42), rgba(119, 45, 206, .15) 45%, transparent 72%);
}
.v4-nebula-b {
  left: 2%;
  bottom: 6%;
  width: 37%;
  height: 19%;
  background: radial-gradient(circle at 50% 50%, rgba(88, 172, 255, .25), rgba(48, 95, 255, .12) 44%, transparent 74%);
}

.v4-galaxy {
  right: 9%;
  top: 33%;
  width: 22%;
  aspect-ratio: 1;
  border-radius: 999px;
  background:
    radial-gradient(circle at 50% 50%, rgba(255,255,255,.7) 0 2px, transparent 3px),
    radial-gradient(circle at 50% 50%, rgba(218, 150, 255, .72), rgba(124,58,237,.28) 35%, transparent 66%);
  box-shadow: 0 0 30px rgba(168,85,247,.22);
}
.v4-galaxy::before,
.v4-galaxy::after {
  content: '';
  position: absolute;
  left: 13%;
  right: 13%;
  top: 46%;
  height: 8%;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, rgba(235, 206, 255, .72), transparent);
  transform: rotate(-18deg);
}
.v4-galaxy::after { transform: rotate(22deg); opacity: .55; }

.v4-blackhole {
  right: 14%;
  top: 48%;
  width: 18%;
  aspect-ratio: 1;
  border-radius: 999px;
  background:
    radial-gradient(circle, #07040f 0 26%, transparent 28%),
    radial-gradient(circle, rgba(216,180,254,.7), rgba(124,58,237,.23) 42%, transparent 70%);
  box-shadow: 0 0 25px rgba(177,91,255,.24);
  opacity: .72;
}

.v4-comet {
  left: 48%;
  top: 23%;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: radial-gradient(circle at 35% 35%, #fffbe2, #ffd45a 55%, #f39c22 100%);
  box-shadow: 0 0 16px rgba(255, 220, 92, .46);
}
.v4-comet::after {
  content: '';
  position: absolute;
  left: -66px;
  top: 5px;
  width: 74px;
  height: 8px;
  background: linear-gradient(90deg, rgba(255,255,255,0), rgba(160,236,255,.75), rgba(255,210,90,.22));
  transform: rotate(-16deg);
  border-radius: 999px;
  filter: blur(2px);
}

.v4-satellite {
  right: 20%;
  top: 25%;
  width: 54px;
  height: 28px;
  transform: rotate(14deg);
}
.v4-satellite i {
  position: absolute;
  left: 17px;
  top: 7px;
  width: 20px;
  height: 14px;
  border-radius: 5px;
  background: linear-gradient(180deg, #d8e7ff, #90a8d6);
  box-shadow: 0 0 12px rgba(143,181,255,.26);
}
.v4-satellite b,
.v4-satellite em {
  position: absolute;
  top: 4px;
  width: 14px;
  height: 20px;
  border-radius: 4px;
  background: linear-gradient(180deg, #5f91ff, #293d91);
}
.v4-satellite b { left: 0; }
.v4-satellite em { right: 0; }

.v4-rocket {
  width: 52px;
  height: 72px;
  transform-origin: center;
  z-index: 2;
}
.v4-rocket i {
  position: absolute;
  left: 14px;
  top: 0;
  width: 24px;
  height: 48px;
  border-radius: 60% 60% 40% 40%;
  background: linear-gradient(135deg, #ffffff, #8edcff);
  border: 2px solid #1d4c8e;
  box-shadow: inset 5px 0 8px rgba(255,255,255,.5);
}
.v4-rocket i::before {
  content: '';
  position: absolute;
  left: 7px;
  top: 16px;
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #7edcff;
  border: 2px solid #1d4c8e;
}
.v4-rocket b,
.v4-rocket em {
  position: absolute;
  top: 34px;
  width: 16px;
  height: 22px;
  background: linear-gradient(180deg, #ff705d, #d12d2d);
  border-radius: 10px 10px 4px 4px;
}
.v4-rocket b { left: 5px; transform: rotate(-28deg); }
.v4-rocket em { right: 5px; transform: rotate(28deg); }
.v4-rocket small {
  position: absolute;
  left: 18px;
  top: 48px;
  width: 16px;
  height: 24px;
  border-radius: 0 0 999px 999px;
  background: linear-gradient(180deg, #fff2a1, #ff9e2a 55%, transparent);
  filter: blur(.2px);
}
.v4-launch { left: 2%; top: 6%; transform: rotate(-12deg); }
.v4-flying { right: 20%; top: 60%; transform: rotate(30deg) scale(.72); }

.v4-planet {
  z-index: 1;
  border-radius: 999px;
  box-shadow: inset -12px -16px 24px rgba(0,0,0,.25), 0 0 20px rgba(255,255,255,.06);
}
.v4-green {
  left: 4%;
  top: 27%;
  width: 10%;
  aspect-ratio: 1;
  background: radial-gradient(circle at 32% 30%, #d5ffb7, #62d677 50%, #1d7744 100%);
}
.v4-orange {
  left: 6%;
  top: 56%;
  width: 15%;
  aspect-ratio: 1;
  background: radial-gradient(circle at 32% 30%, #ffe2b2, #ff9d38 55%, #a34f16 100%);
}
.v4-orange::after {
  content: '';
  position: absolute;
  left: -18%;
  right: -18%;
  top: 43%;
  height: 12%;
  border: 3px solid rgba(255, 208, 138, .58);
  border-left-color: transparent;
  border-right-color: transparent;
  border-radius: 999px;
  transform: rotate(-18deg);
}
.v4-pink {
  right: 7%;
  top: 52%;
  width: 16%;
  aspect-ratio: 1;
  background: radial-gradient(circle at 32% 30%, #ffd6e0, #d87792 55%, #72314a 100%);
}
.v4-purple {
  left: 3%;
  bottom: 3%;
  width: 19%;
  aspect-ratio: 1;
  background: radial-gradient(circle at 32% 30%, #edd7ff, #9460e2 55%, #4b2468 100%);
}

.v4-asteroid {
  width: 16px;
  height: 16px;
  border-radius: 7px;
  background: radial-gradient(circle at 35% 35%, #7e7a95, #4f5169 60%, #25283c 100%);
  box-shadow: inset -3px -4px 7px rgba(0,0,0,.3);
}
.v4-ast-a { left: 50%; top: 31%; }
.v4-ast-b { left: 44%; top: 42%; width: 14px; height: 14px; }
.v4-ast-c { right: 31%; top: 49%; width: 22px; height: 22px; }
.v4-ast-d { right: 26%; top: 58%; width: 17px; height: 17px; }
.v4-ast-e { left: 58%; top: 72%; width: 18px; height: 18px; }

.v4-flag {
  z-index: 5;
  padding: 7px 10px;
  border-radius: 12px;
  color: #ffe45a;
  background: linear-gradient(135deg, #365dff, #7d45ff);
  font-size: .66rem;
  font-weight: 1000;
  box-shadow: 0 8px 20px rgba(67,82,255,.38);
}
.v4-start-flag { left: 11%; top: 7%; transform: rotate(-8deg); }
.v4-finish-flag { right: 4%; bottom: 7%; transform: rotate(-10deg); }

.v4-path-layer {
  position: absolute;
  inset: 0;
  z-index: 2;
  width: 100%;
  height: 100%;
}
.v4-path {
  fill: none;
  stroke-linecap: round;
}
.v4-path-glow.done {
  stroke: rgba(99,232,255,.42);
  stroke-width: 2.35;
  filter: blur(1.5px);
}
.v4-path-core.done {
  stroke: #93f2ff;
  stroke-width: .92;
  filter: drop-shadow(0 0 4px rgba(103,232,249,.95));
}
.v4-path-glow.future {
  stroke: rgba(226,232,240,.1);
  stroke-width: 1.45;
  stroke-dasharray: .9 3.1;
}
.v4-path-core.future {
  stroke: rgba(203,213,225,.36);
  stroke-width: .62;
  stroke-dasharray: .8 2.8;
}

.v4-day {
  position: absolute;
  z-index: 4;
  transform: translate(-50%, -50%) scale(.94);
  width: 52px;
  height: 52px;
  border: 0;
  border-radius: 999px;
  background: radial-gradient(circle at 35% 30%, #f7fbff, #edf7ff 55%, #d9ecff 100%);
  color: #142033;
  display: grid;
  place-items: center;
  box-shadow: 0 0 0 3px rgba(88,215,255,.26), 0 0 28px rgba(54,187,255,.48);
  opacity: .78;
  transition: transform .25s ease, opacity .25s ease, filter .25s ease;
}
.v4-day-shine {
  position: absolute;
  inset: -7px;
  border-radius: inherit;
  background: radial-gradient(circle, rgba(73,226,255,.16), transparent 68%);
}
.v4-day.revealed {
  opacity: 1;
  animation: v4NodeReveal .42s ease both;
}
.v4-day:hover {
  transform: translate(-50%, -50%) scale(1.08);
}
.v4-day.current {
  width: 88px;
  height: 88px;
  z-index: 6;
  background: radial-gradient(circle at 35% 24%, #ffffff, #d8fcff 22%, #65d3ff 48%, #2f84f7 76%, #18307b);
  color: #fff;
  box-shadow: 0 0 0 8px rgba(103,232,249,.12), 0 0 48px rgba(56,189,248,.95), inset 0 -10px 24px rgba(15,23,42,.22);
}
.v4-day.future {
  background: radial-gradient(circle at 35% 25%, rgba(137,146,173,.85), rgba(78,85,112,.85));
  color: rgba(232,236,247,.76);
  box-shadow: none;
  opacity: .46;
  filter: grayscale(.45);
}
.v4-day-number {
  position: relative;
  z-index: 1;
  font-size: 1.28rem;
  font-weight: 1000;
  line-height: 1;
  letter-spacing: -.04em;
}
.v4-day.current .v4-day-number {
  font-size: 2rem;
}
.v4-star-badge {
  position: absolute;
  bottom: -16px;
  min-width: 38px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(9,13,34,.94);
  color: #fddd57;
  font-size: .74rem;
  font-weight: 1000;
  box-shadow: 0 8px 18px rgba(0,0,0,.28);
}
.v4-gift {
  position: absolute;
  top: -16px;
  right: -7px;
  font-size: 1.25rem;
  filter: drop-shadow(0 0 10px rgba(255,220,90,.4));
}
.v4-lock {
  position: absolute;
  right: -5px;
  bottom: -6px;
  font-size: .88rem;
  opacity: .92;
}
.v4-today-flag {
  position: absolute;
  right: -8px;
  top: 50%;
  transform: translate(100%, -50%);
  padding: 6px 10px;
  border-radius: 999px;
  color: #fff;
  background: linear-gradient(135deg, #7c3aed, #db2777);
  font-size: .68rem;
  font-weight: 1000;
  letter-spacing: .08em;
  box-shadow: 0 10px 24px rgba(124,58,237,.42);
}

.month-v4-legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 14px;
  padding: 12px;
  border-radius: 20px;
  background: rgba(13,20,52,.66);
  border: 1px solid rgba(145,161,255,.14);
  color: rgba(241,245,249,.92);
  font-weight: 900;
}
.month-v4-legend span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.month-v4-legend i {
  width: 34px;
  height: 4px;
  border-radius: 999px;
  background: #68ebff;
  box-shadow: 0 0 14px rgba(103,232,249,.9);
}

@keyframes v4NodeReveal {
  0% { opacity: .15; transform: translate(-50%, -50%) scale(.62); }
  70% { transform: translate(-50%, -50%) scale(1.08); }
  100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

@media (max-width: 760px) {
  .month-v4-header {
    grid-template-columns: 1fr;
    grid-template-areas: "date" "summary" "filters";
  }
  .month-v4-summary {
    width: 100%;
  }
  .month-v4-board {
    width: 100%;
  }
  .v4-day { width: 46px; height: 46px; }
  .v4-day.current { width: 72px; height: 72px; }
  .v4-day-number { font-size: 1rem; }
  .v4-day.current .v4-day-number { font-size: 1.65rem; }
  .v4-star-badge { bottom: -14px; font-size: .64rem; padding: 3px 6px; }
  .v4-today-flag { top: auto; right: 50%; bottom: -34px; transform: translateX(50%); }
  .v4-launch { transform: rotate(-12deg) scale(.82); }
  .v4-flying { transform: rotate(30deg) scale(.58); }
}

@media (max-width: 430px) {
  .v4-day { width: 40px; height: 40px; }
  .v4-day.current { width: 62px; height: 62px; }
  .v4-gift { font-size: 1rem; top: -13px; }
  .v4-flag { font-size: .56rem; padding: 6px 8px; }
}
`

if (!css.includes(cssMarker)) {
  css += cssBlock
  changedCss = true
}

if (changedMain) fs.writeFileSync(mainPath, main)
if (changedCss) fs.writeFileSync(cssPath, css)

console.log('apply-month-space-map-manual v4: ok')
