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

function fail(label) {
  throw new Error('Nao encontrei o trecho esperado em src/main.jsx: ' + label)
}

function extractRawConst(name) {
  const pattern = new RegExp('const ' + name + ' = String\\.raw`([\\s\\S]*?)`')
  const match = legacy.match(pattern)
  if (!match) throw new Error('Nao encontrei o bloco ' + name + ' no script legado.')
  return match[1]
}

function insertBefore(pattern, text, label) {
  if (!pattern.test(main)) fail(label)
  main = main.replace(pattern, text + '$&')
  changedMain = true
}

function replace(pattern, replacement, label) {
  if (!pattern.test(main)) fail(label)
  main = main.replace(pattern, replacement)
  changedMain = true
}

main = main.replace(/nextChildRedemptions\[rewardId\]\s*=\s*true/g, () => {
  changedMain = true
  return 'nextChildRedemptions[rewardId] = selectedDate'
})

const monthPanel = extractRawConst('monthPanel')
const monthCss = legacy.match(/css \+= String\.raw`([\s\S]*?)`\n\s*changedCss = true/)
const helpers = String.raw`
function getMonthDates(dateString) { const date = parseLocalDate(dateString); const first = new Date(date.getFullYear(), date.getMonth(), 1); const last = new Date(date.getFullYear(), date.getMonth() + 1, 0); return Array.from({ length: last.getDate() }, (_, index) => { const nextDate = new Date(first); nextDate.setDate(index + 1); return formatDate(nextDate) }) }
function getRewardRedemptionItemsForDate({ date, selectedChildIds, rewardRedemptions, rewards }) { const selectedSet = new Set(selectedChildIds); const items = []; Object.entries(rewardRedemptions ?? {}).forEach(([weekKey, weekRedemptions]) => { Object.entries(weekRedemptions ?? {}).forEach(([childId, childRedemptions]) => { if (!selectedSet.has(childId)) return; Object.entries(childRedemptions ?? {}).forEach(([rewardId, redemptionValue]) => { const redemptionDate = typeof redemptionValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(redemptionValue) ? redemptionValue : weekKey; if (redemptionDate !== date) return; const reward = rewards.find((item) => item.id === rewardId); items.push(reward ?? { id: rewardId, title: 'Premio resgatado', icon: '🏆' }) }) }) }); return items }
function capitalizeFirst(value) { const text = String(value ?? ''); return text ? text.charAt(0).toUpperCase() + text.slice(1) : text }
`

if (!main.includes("setActiveTab('month')")) {
  replace(
    /(<button[^>]*activeTab === 'week'[^>]*setActiveTab\('week'\)[^>]*>Semana<\/button>)/,
    "$1\n          <button className={activeTab === 'month' ? 'active' : ''} onClick={() => setActiveTab('month')}>Mês</button>",
    'botao da aba Mes'
  )
}

if (!main.includes("activeTab === 'month' && <MonthPanel")) {
  insertBefore(
    /\s*\{activeTab === 'activities' && <ActivitiesPanel[\s\S]*?\/\>\}/,
    "\n        {activeTab === 'month' && <MonthPanel kids={data.children} selectedChildId={selectedChildId} activities={orderedActivities} selectedDate={selectedDate} records={data.records} rewards={data.rewards} rewardRedemptions={data.rewardRedemptions} />}",
    'renderizacao da aba Mes'
  )
}

if (!main.includes('function MonthPanel(')) {
  insertBefore(
    /function ActivitiesPanel\({ activities, children, onAddActivity, onUpdateActivity, onRemoveActivity, onMoveActivity }\) \{/,
    monthPanel + '\n',
    'componente MonthPanel'
  )
}

if (!main.includes('function getMonthDates(')) {
  insertBefore(/function getWeekDates\(dateString\) \{/, helpers, 'helpers da aba Mes')
}

if (!css.includes('/* Month progress trail */')) {
  if (!monthCss) throw new Error('Nao encontrei o CSS mensal no script legado.')
  css += monthCss[1]
  changedCss = true
}

if (changedMain) fs.writeFileSync(mainPath, main)
if (changedCss) fs.writeFileSync(cssPath, css)

console.log('apply-month-progress-safe: ok')
