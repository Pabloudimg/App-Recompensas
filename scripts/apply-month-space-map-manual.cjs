const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const mainPath = path.join(root, 'src', 'main.jsx')
const cssPath = path.join(root, 'src', 'styles.css')
const publicDir = path.join(root, 'public', 'month-space')

fs.mkdirSync(publicDir, { recursive: true })

const assets = {
  'rocket-main.svg': String.raw`<svg xmlns="http://www.w3.org/2000/svg" width="140" height="180" viewBox="0 0 140 180" fill="none"><defs><linearGradient id="rb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d8f7ff"/><stop offset="1" stop-color="#7fd4ff"/></linearGradient><linearGradient id="rr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff6448"/><stop offset="1" stop-color="#c62828"/></linearGradient><linearGradient id="rf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe182"/><stop offset="1" stop-color="#ff8c1a"/></linearGradient><filter id="glow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g filter="url(#glow)"><path d="M70 10C88 28 102 58 102 92V116H38V92C38 58 52 28 70 10Z" fill="url(#rb)" stroke="#194a8d" stroke-width="4"/><path d="M70 20C83 35 92 58 92 88V105H48V88C48 58 57 35 70 20Z" fill="#ffffff" fill-opacity="0.75"/><circle cx="70" cy="63" r="16" fill="#7fd4ff" stroke="#194a8d" stroke-width="4"/><circle cx="70" cy="63" r="8" fill="#dff7ff"/><path d="M38 96L20 116L38 128V96Z" fill="url(#rr)" stroke="#8a1b1b" stroke-width="4"/><path d="M102 96L120 116L102 128V96Z" fill="url(#rr)" stroke="#8a1b1b" stroke-width="4"/><path d="M50 118H90V140C90 153 81 164 70 170C59 164 50 153 50 140V118Z" fill="url(#rr)" stroke="#8a1b1b" stroke-width="4"/><path d="M56 140C56 154 64 166 70 172C76 166 84 154 84 140C84 140 73 145 70 145C67 145 56 140 56 140Z" fill="url(#rf)"/><path d="M70 0L76 12H64L70 0Z" fill="#ffe082"/></g></svg>`,
  'rocket-mini.svg': String.raw`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="150" viewBox="0 0 120 150" fill="none"><defs><linearGradient id="mb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d8f7ff"/><stop offset="1" stop-color="#7fd4ff"/></linearGradient><linearGradient id="mr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff7a59"/><stop offset="1" stop-color="#db2d2d"/></linearGradient><linearGradient id="mf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3a1"/><stop offset="1" stop-color="#ff9c2a"/></linearGradient></defs><path d="M60 10C75 25 88 51 88 79V99H32V79C32 51 45 25 60 10Z" fill="url(#mb)" stroke="#194a8d" stroke-width="4"/><circle cx="60" cy="56" r="14" fill="#7fd4ff" stroke="#194a8d" stroke-width="4"/><circle cx="60" cy="56" r="6" fill="#dff7ff"/><path d="M32 83L17 100L32 110V83Z" fill="url(#mr)" stroke="#8a1b1b" stroke-width="4"/><path d="M88 83L103 100L88 110V83Z" fill="url(#mr)" stroke="#8a1b1b" stroke-width="4"/><path d="M42 101H78V118C78 129 70 138 60 144C50 138 42 129 42 118V101Z" fill="url(#mr)" stroke="#8a1b1b" stroke-width="4"/><path d="M48 118C48 129 55 138 60 144C65 138 72 129 72 118C72 118 63 122 60 122C57 122 48 118 48 118Z" fill="url(#mf)"/></svg>`,
  'satellite.svg': String.raw`<svg xmlns="http://www.w3.org/2000/svg" width="140" height="80" viewBox="0 0 140 80" fill="none"><defs><linearGradient id="sp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8e7ff"/><stop offset="1" stop-color="#90a8d6"/></linearGradient><linearGradient id="sb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5f91ff"/><stop offset="1" stop-color="#293d91"/></linearGradient></defs><rect x="48" y="26" width="44" height="28" rx="8" fill="url(#sp)" stroke="#5b6d99" stroke-width="4"/><circle cx="70" cy="40" r="7" fill="#ffd95e"/><path d="M36 40H48" stroke="#b3c7e8" stroke-width="4" stroke-linecap="round"/><path d="M92 40H104" stroke="#b3c7e8" stroke-width="4" stroke-linecap="round"/><rect x="4" y="18" width="30" height="44" rx="5" fill="url(#sb)" stroke="#2a396f" stroke-width="4"/><rect x="106" y="18" width="30" height="44" rx="5" fill="url(#sb)" stroke="#2a396f" stroke-width="4"/></svg>`,
  'planet-green.svg': String.raw`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120" fill="none"><defs><radialGradient id="pg" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(36 34) rotate(45) scale(70)"><stop offset="0" stop-color="#d5ffb7"/><stop offset="0.5" stop-color="#62d677"/><stop offset="1" stop-color="#1d7744"/></radialGradient></defs><circle cx="60" cy="60" r="48" fill="url(#pg)"/><ellipse cx="44" cy="44" rx="13" ry="9" fill="#9cf5ae" fill-opacity="0.65"/><ellipse cx="73" cy="71" rx="16" ry="11" fill="#2b8c52" fill-opacity="0.4"/></svg>`,
  'planet-orange-ring.svg': String.raw`<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120" viewBox="0 0 160 120" fill="none"><defs><radialGradient id="po" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(73 41) rotate(45) scale(62)"><stop offset="0" stop-color="#ffe2b2"/><stop offset="0.55" stop-color="#ff9d38"/><stop offset="1" stop-color="#a34f16"/></radialGradient></defs><ellipse cx="79" cy="70" rx="54" ry="13" transform="rotate(-12 79 70)" fill="#ffda9a" fill-opacity="0.4" stroke="#ffd08a" stroke-width="5"/><circle cx="78" cy="57" r="36" fill="url(#po)"/><ellipse cx="64" cy="48" rx="11" ry="7" fill="#ffd89f" fill-opacity="0.58"/></svg>`,
  'planet-pink.svg': String.raw`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120" fill="none"><defs><radialGradient id="pp" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(37 34) rotate(45) scale(70)"><stop offset="0" stop-color="#ffd6e0"/><stop offset="0.55" stop-color="#d87792"/><stop offset="1" stop-color="#72314a"/></radialGradient></defs><circle cx="60" cy="60" r="46" fill="url(#pp)"/><ellipse cx="45" cy="43" rx="12" ry="8" fill="#ffdbe4" fill-opacity="0.55"/></svg>`,
  'planet-purple.svg': String.raw`<svg xmlns="http://www.w3.org/2000/svg" width="130" height="130" viewBox="0 0 130 130" fill="none"><defs><radialGradient id="pu" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(40 36) rotate(45) scale(78)"><stop offset="0" stop-color="#edd7ff"/><stop offset="0.55" stop-color="#9460e2"/><stop offset="1" stop-color="#4b2468"/></radialGradient></defs><circle cx="65" cy="65" r="52" fill="url(#pu)"/><ellipse cx="83" cy="84" rx="17" ry="11" fill="#5b2f84" fill-opacity="0.42"/><ellipse cx="50" cy="48" rx="13" ry="9" fill="#f3e6ff" fill-opacity="0.45"/></svg>`,
  'blackhole.svg': String.raw`<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180" fill="none"><defs><radialGradient id="bh1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(90 90) rotate(90) scale(90)"><stop offset="0" stop-color="#120a2f"/><stop offset="0.3" stop-color="#2d1157"/><stop offset="0.58" stop-color="#6b28a9" stop-opacity="0.9"/><stop offset="0.74" stop-color="#bc6bff" stop-opacity="0.6"/><stop offset="1" stop-color="#000000" stop-opacity="0"/></radialGradient></defs><circle cx="90" cy="90" r="88" fill="url(#bh1)"/><circle cx="90" cy="90" r="30" fill="#07040f"/><path d="M24 100C46 70 117 50 154 76" stroke="#f5a8ff" stroke-opacity="0.7" stroke-width="8" stroke-linecap="round"/><path d="M31 112C56 86 118 79 150 94" stroke="#b8a6ff" stroke-opacity="0.55" stroke-width="6" stroke-linecap="round"/></svg>`,
  'banner-start.svg': String.raw`<svg xmlns="http://www.w3.org/2000/svg" width="180" height="80" viewBox="0 0 180 80" fill="none"><defs><linearGradient id="bs" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4f83ff"/><stop offset="1" stop-color="#6f42ff"/></linearGradient></defs><path d="M14 16C14 10 18 6 24 6H154C161 6 166 12 165 19L162 41C161 47 156 52 150 53L32 66C24 67 17 62 16 54L14 16Z" fill="url(#bs)"/><text x="90" y="41" text-anchor="middle" fill="#FFE45A" font-family="Arial, sans-serif" font-size="20" font-weight="900">DECOLAMOS!</text></svg>`,
  'banner-finish.svg': String.raw`<svg xmlns="http://www.w3.org/2000/svg" width="170" height="78" viewBox="0 0 170 78" fill="none"><defs><linearGradient id="bf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6f42ff"/><stop offset="1" stop-color="#e2419b"/></linearGradient></defs><path d="M12 18C12 11 17 6 24 6H148C155 6 160 12 159 19L156 43C155 49 150 54 144 55L28 68C20 69 13 64 12 56L12 18Z" fill="url(#bf)"/><text x="85" y="42" text-anchor="middle" fill="#FFE45A" font-family="Arial, sans-serif" font-size="20" font-weight="900">CHEGAMOS!</text></svg>`,
  'badge-today.svg': String.raw`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="46" viewBox="0 0 120 46" fill="none"><defs><linearGradient id="bt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7d45ff"/><stop offset="1" stop-color="#e63890"/></linearGradient></defs><rect x="2" y="2" width="116" height="42" rx="21" fill="url(#bt)"/><text x="60" y="29" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="18" font-weight="900">HOJE</text></svg>`
}

for (const [name, content] of Object.entries(assets)) {
  fs.writeFileSync(path.join(publicDir, name), content)
}

let main = fs.readFileSync(mainPath, 'utf8')
let css = fs.readFileSync(cssPath, 'utf8')
let changedMain = false
let changedCss = false

const monthBlock = String.raw`
const MONTH_SPACE_POINTS = [
  { day: 1, x: 10, y: 16, tag: 'start' },
  { day: 2, x: 25, y: 12 },
  { day: 3, x: 40, y: 12 },
  { day: 4, x: 54, y: 16 },
  { day: 5, x: 68, y: 24 },
  { day: 6, x: 74, y: 33 },
  { day: 7, x: 62, y: 43 },
  { day: 8, x: 42, y: 39 },
  { day: 9, x: 50, y: 49 },
  { day: 10, x: 15, y: 50 },
  { day: 11, x: 27, y: 58 },
  { day: 12, x: 41, y: 58 },
  { day: 13, x: 10, y: 71 },
  { day: 14, x: 23, y: 69 },
  { day: 15, x: 37, y: 67 },
  { day: 16, x: 51, y: 66 },
  { day: 17, x: 65, y: 65 },
  { day: 18, x: 79, y: 68, tag: 'today' },
  { day: 19, x: 57, y: 78 },
  { day: 20, x: 69, y: 78 },
  { day: 21, x: 81, y: 79 },
  { day: 22, x: 82, y: 89 },
  { day: 23, x: 67, y: 89 },
  { day: 24, x: 51, y: 89 },
  { day: 25, x: 35, y: 88 },
  { day: 26, x: 22, y: 98 },
  { day: 27, x: 37, y: 99 },
  { day: 28, x: 54, y: 99 },
  { day: 29, x: 70, y: 99 },
  { day: 30, x: 86, y: 96, tag: 'finish' },
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
    }, 80)
    return () => window.clearInterval(timer)
  }, [selectedDate, selectedChildIds.join('|'), kids.length])

  const selectedKids = kids.filter((child) => selectedChildIds.includes(child.id))
  const selectedDayNumber = parseLocalDate(selectedDate).getDate()

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
    <section className="panel entrance-card month-panel month-space-panel month-space-v3">
      <div className="month-space-header-grid">
        <div className="month-space-status-chip"><span>📅</span> Acompanhamento até dia <strong>{selectedDayNumber}</strong></div>
        <div className="month-space-summary-card">
          <span className="summary-star">⭐</span>
          <div>
            <small>Estrelas neste mês</small>
            <strong>{monthTotals.points}</strong>
            <em>Meta: {monthTotals.possiblePoints || 0}</em>
          </div>
          <ProgressBar value={progress} />
        </div>
        <div className="month-space-filters" aria-label="Filtrar crianças na trilha mensal">
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
      </div>

      <div className="space-map-board">
        <div className="space-stars" aria-hidden="true" />
        <img className="space-asset rocket-main" src="/month-space/rocket-main.svg" alt="" aria-hidden="true" />
        <img className="space-asset rocket-mini" src="/month-space/rocket-mini.svg" alt="" aria-hidden="true" />
        <img className="space-asset satellite" src="/month-space/satellite.svg" alt="" aria-hidden="true" />
        <img className="space-asset blackhole" src="/month-space/blackhole.svg" alt="" aria-hidden="true" />
        <img className="space-asset planet-1" src="/month-space/planet-green.svg" alt="" aria-hidden="true" />
        <img className="space-asset planet-2" src="/month-space/planet-orange-ring.svg" alt="" aria-hidden="true" />
        <img className="space-asset planet-3" src="/month-space/planet-pink.svg" alt="" aria-hidden="true" />
        <img className="space-asset planet-4" src="/month-space/planet-purple.svg" alt="" aria-hidden="true" />
        <img className="space-banner start" src="/month-space/banner-start.svg" alt="Decolamos" />
        <img className="space-banner finish" src="/month-space/banner-finish.svg" alt="Chegamos" />
        <span className="space-nebula nebula-1" aria-hidden="true" />
        <span className="space-nebula nebula-2" aria-hidden="true" />
        <span className="space-comet" aria-hidden="true" />
        <span className="space-asteroid asteroid-a" aria-hidden="true" />
        <span className="space-asteroid asteroid-b" aria-hidden="true" />
        <span className="space-asteroid asteroid-c" aria-hidden="true" />
        <span className="space-asteroid asteroid-d" aria-hidden="true" />
        <span className="space-asteroid asteroid-e" aria-hidden="true" />

        <svg className="space-path-layer" viewBox="0 0 100 110" preserveAspectRatio="none" aria-hidden="true">
          {monthNodes.slice(0, -1).map((node, index) => {
            const next = monthNodes[index + 1]
            const midX = (node.layout.x + next.layout.x) / 2
            const midY = (node.layout.y + next.layout.y) / 2 + (index % 2 === 0 ? -5 : 4)
            const pathD = 'M ' + node.layout.x + ' ' + node.layout.y + ' Q ' + midX + ' ' + midY + ' ' + next.layout.x + ' ' + next.layout.y
            const completedSegment = next.index <= activeStep && next.date <= selectedDate
            return (
              <g key={node.date}>
                <path d={pathD} className={completedSegment ? 'space-path glow completed' : 'space-path glow future'} />
                <path d={pathD} className={completedSegment ? 'space-path core completed' : 'space-path core future'} />
              </g>
            )
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
            <button type="button" key={node.date} className={className} style={{ left: node.layout.x + '%', top: node.layout.y + '%', animationDelay: (node.index * 50) + 'ms' }} title={formatFriendlyDate(node.date) + ' - ' + node.totalStars + ' estrelas'}>
              <span className="space-day-inner-glow" />
              <span className="space-day-number">{node.dayLabel}</span>
              {!node.isFuture && <span className="space-star-badge">{node.totalStars}⭐</span>}
              {hasRedemption && <span className="space-gift">🎁</span>}
              {node.isFuture && <span className="space-lock">🔒</span>}
              {node.isCurrent && <img className="space-today-badge" src="/month-space/badge-today.svg" alt="Hoje" />}
            </button>
          )
        })}
      </div>

      <div className="space-legend">
        <span><i className="legend-glow" /> Dias concluídos</span>
        <span>🎁 Prêmio resgatado</span>
        <span>🔒 Próximos dias</span>
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
    const oldConstIndexA = main.lastIndexOf('const MONTH_PATH_LAYOUT', fnIndex)
    const constIndex = Math.max(ownConstIndex, oldConstIndexA)
    const start = constIndex >= 0 ? constIndex : fnIndex
    main = main.slice(0, start) + monthBlock + '\n' + main.slice(anchorIndex)
    changedMain = true
    return true
  }
  return false
}

if (!replaceMonthPanel()) throw new Error('Nao encontrei onde inserir o MonthPanel espacial v3.')

const cssMarker = '/* Space game month map v5 assets */'
const cssBlock = String.raw`

/* Space game month map v5 assets */
.month-space-panel.month-space-v3 {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(81, 96, 255, .22);
  background: linear-gradient(180deg, #091233 0%, #08102e 48%, #060b1f 100%);
  color: #f8fafc;
  box-shadow: 0 28px 80px rgba(3, 9, 30, .42), inset 0 1px 0 rgba(255,255,255,.05);
}
.month-space-panel.month-space-v3::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: .42;
  background: radial-gradient(circle at 20% 0%, rgba(111, 66, 193, .24), transparent 23%), radial-gradient(circle at 85% 24%, rgba(168, 85, 247, .18), transparent 18%), radial-gradient(circle at 18% 92%, rgba(59, 130, 246, .18), transparent 24%);
}
.month-space-header-grid {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 240px;
  grid-template-areas: 'status summary' 'filters summary';
  gap: 12px 16px;
  align-items: start;
  margin-bottom: 16px;
}
.month-space-status-chip {
  grid-area: status;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  width: fit-content;
  max-width: 100%;
  padding: 12px 16px;
  border-radius: 18px;
  background: rgba(18, 26, 66, .78);
  border: 1px solid rgba(143, 163, 255, .18);
  box-shadow: 0 14px 28px rgba(2, 6, 23, .24);
  font-weight: 900;
}
.month-space-status-chip strong { color: #f8d44b; }
.month-space-filters {
  grid-area: filters;
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 2px 2px 8px;
  scrollbar-width: none;
}
.month-space-filters::-webkit-scrollbar { display: none; }
.month-space-filters button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
  min-height: 48px;
  padding: 0 16px;
  border: 1px solid rgba(143,163,255,.2);
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(35, 45, 110, .95), rgba(20, 26, 72, .95));
  color: #fff;
  font-weight: 950;
  box-shadow: 0 12px 26px rgba(6, 10, 31, .28), inset 0 1px 0 rgba(255,255,255,.08);
}
.month-space-filters button.active {
  background: linear-gradient(135deg, #6a41ff, #4e8dff);
  border-color: rgba(191,219,254,.42);
  box-shadow: 0 0 0 3px rgba(97, 218, 251, .12), 0 14px 28px rgba(64, 64, 220, .34);
}
.month-space-filters img, .month-space-filters .chip-icon {
  width: 30px; height: 30px; display: grid; place-items: center; overflow: hidden; border-radius: 12px; background: rgba(255,255,255,.12); object-fit: cover;
}
.month-space-summary-card {
  grid-area: summary;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
  align-items: center;
  width: 240px;
  padding: 16px;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(25, 28, 77, .96), rgba(17, 22, 58, .96));
  border: 1px solid rgba(155, 170, 255, .22);
  box-shadow: 0 20px 38px rgba(2, 6, 23, .32), inset 0 0 30px rgba(99, 102, 241, .18);
}
.month-space-summary-card .progress-track { grid-column: 1 / -1; background: rgba(255,255,255,.16); }
.month-space-summary-card small, .month-space-summary-card em { display: block; font-style: normal; color: rgba(232,240,255,.84); font-weight: 850; }
.month-space-summary-card strong { display: block; color: #ffd84b; font-size: 3rem; line-height: .9; text-shadow: 0 0 20px rgba(250,204,21,.42); }
.summary-star { width: 56px; height: 56px; display: grid; place-items: center; border-radius: 18px; background: radial-gradient(circle at 35% 35%, #fff6a4, #f5c542 60%, #d18b16 100%); color: #4b2b00; font-size: 2rem; box-shadow: 0 0 22px rgba(255,214,77,.35); }
.space-map-board {
  position: relative;
  min-height: 980px;
  border-radius: 30px;
  overflow: hidden;
  background: radial-gradient(circle at 78% 28%, rgba(104, 28, 154, .28), transparent 22%), radial-gradient(circle at 18% 86%, rgba(43, 95, 255, .18), transparent 18%), linear-gradient(180deg, #081231 0%, #09112b 52%, #08101f 100%);
  border: 1px solid rgba(145, 161, 255, .14);
  box-shadow: inset 0 0 120px rgba(11, 20, 64, .85), 0 20px 50px rgba(2, 6, 23, .2);
}
.space-stars {
  position: absolute; inset: 0; opacity: .72;
  background-image: radial-gradient(circle, rgba(255,255,255,.92) 0 1px, transparent 1.6px), radial-gradient(circle, rgba(158,219,255,.9) 0 1px, transparent 1.7px), radial-gradient(circle, rgba(255,215,91,.9) 0 1px, transparent 1.5px);
  background-size: 46px 46px, 82px 82px, 116px 116px;
  background-position: 0 0, 21px 35px, 61px 16px;
}
.space-asset, .space-banner, .space-nebula, .space-comet, .space-asteroid { position: absolute; z-index: 1; pointer-events: none; }
.space-asset.rocket-main { left: 1%; top: 4%; width: 78px; }
.space-asset.rocket-mini { right: 22%; top: 60%; width: 56px; transform: rotate(20deg); }
.space-asset.satellite { right: 21%; top: 25%; width: 58px; }
.space-asset.blackhole { right: 12%; top: 31%; width: 118px; opacity: .96; }
.space-asset.planet-1 { left: 3%; top: 25%; width: 54px; }
.space-asset.planet-2 { left: 4%; top: 55%; width: 84px; }
.space-asset.planet-3 { right: 8%; top: 52%; width: 94px; }
.space-asset.planet-4 { left: 1%; bottom: 2%; width: 112px; }
.space-banner.start { left: 10%; top: 6%; width: 88px; z-index: 3; transform: rotate(-8deg); }
.space-banner.finish { right: 4%; bottom: 6%; width: 86px; z-index: 3; transform: rotate(-10deg); }
.space-nebula { border-radius: 999px; filter: blur(4px); opacity: .85; }
.nebula-1 { right: 10%; top: 10%; width: 220px; height: 220px; background: radial-gradient(circle at 40% 40%, rgba(184, 93, 255, .48), rgba(114, 45, 204, .16) 42%, transparent 70%); }
.nebula-2 { left: 4%; bottom: 6%; width: 180px; height: 180px; background: radial-gradient(circle at 50% 50%, rgba(78, 164, 255, .26), rgba(48, 95, 255, .12) 44%, transparent 74%); }
.space-comet { left: 47%; top: 23%; width: 18px; height: 18px; border-radius: 999px; background: radial-gradient(circle at 35% 35%, #fffbe2, #ffd45a 55%, #f39c22 100%); box-shadow: 0 0 16px rgba(255, 220, 92, .46); }
.space-comet::after { content: ''; position: absolute; left: -66px; top: 5px; width: 74px; height: 8px; background: linear-gradient(90deg, rgba(255,255,255,0), rgba(160,236,255,.75), rgba(255,210,90,.22)); transform: rotate(-16deg); border-radius: 999px; filter: blur(2px); }
.space-asteroid { width: 16px; height: 16px; border-radius: 7px; background: radial-gradient(circle at 35% 35%, #7e7a95, #4f5169 60%, #25283c 100%); box-shadow: inset -3px -4px 7px rgba(0,0,0,.3); }
.asteroid-a { left: 50%; top: 31%; }
.asteroid-b { left: 44%; top: 41%; width: 14px; height: 14px; }
.asteroid-c { right: 30%; top: 48%; width: 22px; height: 22px; }
.asteroid-d { right: 25%; top: 58%; width: 17px; height: 17px; }
.asteroid-e { left: 58%; top: 71%; width: 18px; height: 18px; }
.space-path-layer { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 2; }
.space-path { fill: none; stroke-linecap: round; }
.space-path.glow.completed { stroke: rgba(99, 232, 255, .4); stroke-width: 2.2; filter: blur(1.5px); }
.space-path.core.completed { stroke: #90eeff; stroke-width: .95; filter: drop-shadow(0 0 4px rgba(103,232,249,.95)); }
.space-path.glow.future { stroke: rgba(229, 233, 246, .12); stroke-width: 2; stroke-dasharray: 1.2 2.4; }
.space-path.core.future { stroke: rgba(193, 198, 214, .42); stroke-width: .8; stroke-dasharray: .8 2.6; }
.space-day { position: absolute; z-index: 4; transform: translate(-50%, -50%) scale(.94); width: 52px; height: 52px; border: 0; border-radius: 999px; background: radial-gradient(circle at 35% 30%, #f7fbff, #edf7ff 55%, #d9ecff 100%); color: #142033; display: grid; place-items: center; box-shadow: 0 0 0 3px rgba(88, 215, 255, .26), 0 0 28px rgba(54, 187, 255, .48); transition: transform .25s ease, opacity .25s ease, filter .25s ease; opacity: .78; }
.space-day .space-day-inner-glow { position: absolute; inset: -7px; border-radius: inherit; background: radial-gradient(circle, rgba(73, 226, 255, .16), transparent 68%); }
.space-day.revealed { opacity: 1; animation: spaceNodeReveal .42s ease both; }
.space-day:hover { transform: translate(-50%, -50%) scale(1.08); }
.space-day.current { width: 88px; height: 88px; z-index: 6; background: radial-gradient(circle at 35% 24%, #ffffff, #d8fcff 22%, #65d3ff 48%, #2f84f7 76%, #18307b); color: #fff; box-shadow: 0 0 0 8px rgba(103,232,249,.12), 0 0 48px rgba(56,189,248,.95), inset 0 -10px 24px rgba(15,23,42,.22); }
.space-day.future { background: radial-gradient(circle at 35% 25%, rgba(137,146,173,.85), rgba(78,85,112,.85)); color: rgba(232,236,247,.76); box-shadow: none; opacity: .5; filter: grayscale(.45); }
.space-day-number { position: relative; z-index: 1; font-size: 1.28rem; font-weight: 1000; line-height: 1; letter-spacing: -.04em; }
.space-day.current .space-day-number { font-size: 2rem; }
.space-star-badge { position: absolute; bottom: -16px; min-width: 38px; padding: 4px 8px; border-radius: 999px; background: rgba(9, 13, 34, .94); color: #fddd57; font-size: .74rem; font-weight: 1000; box-shadow: 0 8px 18px rgba(0,0,0,.28); }
.space-gift { position: absolute; top: -16px; right: -7px; font-size: 1.25rem; filter: drop-shadow(0 0 10px rgba(255, 220, 90, .4)); }
.space-lock { position: absolute; right: -5px; bottom: -6px; font-size: .88rem; opacity: .92; }
.space-today-badge { position: absolute; right: -10px; top: 50%; transform: translate(100%, -50%); width: 52px; }
.space-legend { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-top: 14px; padding: 12px; border-radius: 20px; background: rgba(13, 20, 52, .66); border: 1px solid rgba(145,161,255,.14); color: rgba(241,245,249,.92); font-weight: 900; }
.space-legend span { display: inline-flex; align-items: center; gap: 8px; }
.legend-glow { width: 34px; height: 4px; border-radius: 999px; background: #68ebff; box-shadow: 0 0 14px rgba(103,232,249,.9); }
@keyframes spaceNodeReveal { 0% { opacity: .15; transform: translate(-50%, -50%) scale(.62); } 70% { transform: translate(-50%, -50%) scale(1.08); } 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
@media (max-width: 760px) {
  .month-space-header-grid { grid-template-columns: 1fr; grid-template-areas: 'status' 'summary' 'filters'; }
  .month-space-summary-card { width: 100%; }
  .space-map-board { min-height: 760px; }
  .space-day { width: 46px; height: 46px; }
  .space-day.current { width: 72px; height: 72px; }
  .space-day-number { font-size: 1rem; }
  .space-day.current .space-day-number { font-size: 1.65rem; }
  .space-star-badge { bottom: -14px; font-size: .64rem; padding: 3px 6px; }
  .space-today-badge { top: auto; right: 50%; bottom: -34px; transform: translateX(50%); width: 48px; }
  .space-asset.rocket-main { width: 64px; }
  .space-asset.rocket-mini { width: 44px; }
  .space-asset.planet-2 { width: 66px; }
  .space-asset.planet-3 { width: 76px; }
  .space-asset.planet-4 { width: 90px; }
}
@media (max-width: 430px) {
  .space-map-board { min-height: 640px; }
  .space-day { width: 40px; height: 40px; }
  .space-day.current { width: 62px; height: 62px; }
  .space-gift { font-size: 1rem; top: -13px; }
  .space-banner.start, .space-banner.finish { width: 70px; }
}
`

if (!css.includes(cssMarker)) {
  css += cssBlock
  changedCss = true
}

if (changedMain) fs.writeFileSync(mainPath, main)
if (changedCss) fs.writeFileSync(cssPath, css)
console.log('apply-month-space-map-manual-v3: ok')
