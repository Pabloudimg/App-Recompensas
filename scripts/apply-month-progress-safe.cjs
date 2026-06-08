const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const mainPath = path.join(root, 'src', 'main.jsx')
const cssPath = path.join(root, 'src', 'styles.css')
const legacyPath = path.join(root, 'scripts', 'apply-month-progress.cjs')

let main = fs.readFileSync(mainPath, 'utf8')
let css = fs.readFileSync(cssPath, 'utf8')
const legacy = fs.readFileSync(legacyPath, 'utf8')
let changedMain = false
let changedCss = false

function extractRawConst(name) {
  const pattern = new RegExp('const ' + name + ' = String\\.raw`([\\s\\S]*?)`')
  const match = legacy.match(pattern)
  if (!match) throw new Error('Missing block ' + name + ' in legacy month script.')
  return match[1]
}

function replaceFirst(search, replacement) {
  const before = main
  main = main.replace(search, replacement)
  if (main !== before) changedMain = true
  return main !== before
}

function insertBeforeText(search, text) {
  const index = main.indexOf(search)
  if (index < 0) return false
  main = main.slice(0, index) + text + main.slice(index)
  changedMain = true
  return true
}

function insertBeforeLastText(search, text) {
  const index = main.lastIndexOf(search)
  if (index < 0) return false
  main = main.slice(0, index) + text + main.slice(index)
  changedMain = true
  return true
}

main = main.replace(/nextChildRedemptions\[rewardId\]\s*=\s*true/g, () => {
  changedMain = true
  return 'nextChildRedemptions[rewardId] = selectedDate'
})

const monthPanel = extractRawConst('monthPanel')
const monthCss = legacy.match(/css \+= String\.raw`([\s\S]*?)`\n\s*changedCss = true/)
const monthButton = "          <button className={activeTab === 'month' ? 'active' : ''} onClick={() => setActiveTab('month')}>Mês</button>\n"
const monthRender = "        {activeTab === 'month' && <MonthPanel kids={data.children} selectedChildId={selectedChildId} activities={orderedActivities} selectedDate={selectedDate} records={data.records} rewards={data.rewards} rewardRedemptions={data.rewardRedemptions} />}\n"
const helpers = String.raw`
function getMonthDates(dateString) { const date = parseLocalDate(dateString); const first = new Date(date.getFullYear(), date.getMonth(), 1); const last = new Date(date.getFullYear(), date.getMonth() + 1, 0); return Array.from({ length: last.getDate() }, (_, index) => { const nextDate = new Date(first); nextDate.setDate(index + 1); return formatDate(nextDate) }) }
function getRewardRedemptionItemsForDate({ date, selectedChildIds, rewardRedemptions, rewards }) { const selectedSet = new Set(selectedChildIds); const items = []; Object.entries(rewardRedemptions ?? {}).forEach(([weekKey, weekRedemptions]) => { Object.entries(weekRedemptions ?? {}).forEach(([childId, childRedemptions]) => { if (!selectedSet.has(childId)) return; Object.entries(childRedemptions ?? {}).forEach(([rewardId, redemptionValue]) => { const redemptionDate = typeof redemptionValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(redemptionValue) ? redemptionValue : weekKey; if (redemptionDate !== date) return; const reward = rewards.find((item) => item.id === rewardId); items.push(reward ?? { id: rewardId, title: 'Premio resgatado', icon: '🏆' }) }) }) }); return items }
function capitalizeFirst(value) { const text = String(value ?? ''); return text ? text.charAt(0).toUpperCase() + text.slice(1) : text }
`

if (!main.includes("setActiveTab('month')")) {
  const insertedAfterWeek = replaceFirst(
    /(<button[^>]*setActiveTab\('week'\)[\s\S]*?>Semana<\/button>\s*)/,
    '$1' + monthButton
  )
  if (!insertedAfterWeek) {
    const insertedBeforeNavEnd = insertBeforeText('</nav>', monthButton)
    if (!insertedBeforeNavEnd) console.warn('apply-month-progress-safe: tabbar not found; month button skipped')
  }
}

if (!main.includes("activeTab === 'month' && <MonthPanel")) {
  const insertedBeforeActivities = replaceFirst(
    /(\s*\{activeTab === 'activities' && <ActivitiesPanel[\s\S]*?\/\>\})/,
    '\n' + monthRender + '$1'
  )
  if (!insertedBeforeActivities) {
    const insertedBeforeData = insertBeforeText("        {activeTab === 'data' &&", monthRender)
    if (!insertedBeforeData) {
      const insertedBeforeMainEnd = insertBeforeLastText('</main>', monthRender)
      if (!insertedBeforeMainEnd) console.warn('apply-month-progress-safe: main content area not found; month render skipped')
    }
  }
}

if (!main.includes('function MonthPanel(')) {
  const insertedBeforeActivitiesFn = insertBeforeText('function ActivitiesPanel({ activities, children, onAddActivity, onUpdateActivity, onRemoveActivity, onMoveActivity }) {', monthPanel + '\n')
  if (!insertedBeforeActivitiesFn) {
    const insertedBeforeProgress = insertBeforeText('function ProgressBar', monthPanel + '\n')
    if (!insertedBeforeProgress) insertBeforeText('createRoot(document.getElementById', monthPanel + '\n')
  }
}

if (!main.includes('function getMonthDates(')) {
  const insertedBeforeWeekDates = insertBeforeText('function getWeekDates(dateString) {', helpers)
  if (!insertedBeforeWeekDates) insertBeforeText('function formatDate', helpers)
}

if (!css.includes('/* Month progress trail */')) {
  if (monthCss) {
    css += monthCss[1]
    changedCss = true
  } else {
    console.warn('apply-month-progress-safe: month css block not found')
  }
}

if (changedMain) fs.writeFileSync(mainPath, main)
if (changedCss) fs.writeFileSync(cssPath, css)

console.log('apply-month-progress-safe: ok')
