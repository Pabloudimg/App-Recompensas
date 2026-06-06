const fs = require('fs')
const path = require('path')

const mainPath = path.join(process.cwd(), 'src', 'main.jsx')
const cssPath = path.join(process.cwd(), 'src', 'styles.css')
let main = fs.readFileSync(mainPath, 'utf8')
let css = fs.readFileSync(cssPath, 'utf8')

const allWeekdays = '[1, 2, 3, 4, 5, 6, 0]'

if (!main.includes('const weekDayOptions')) {
  main = main.replace(
    "const themeOptions = [\n  ['purple', 'Roxo'], ['blue', 'Azul'], ['green', 'Verde'], ['amber', 'Âmbar'], ['rose', 'Rosa'],\n  ['orange', 'Laranja'], ['teal', 'Turquesa'], ['cyan', 'Ciano'], ['indigo', 'Índigo'], ['slate', 'Grafite']\n]",
    "const themeOptions = [\n  ['purple', 'Roxo'], ['blue', 'Azul'], ['green', 'Verde'], ['amber', 'Âmbar'], ['rose', 'Rosa'],\n  ['orange', 'Laranja'], ['teal', 'Turquesa'], ['cyan', 'Ciano'], ['indigo', 'Índigo'], ['slate', 'Grafite']\n]\n\nconst weekDayOptions = [\n  [1, 'Seg'], [2, 'Ter'], [3, 'Qua'], [4, 'Qui'], [5, 'Sex'], [6, 'Sáb'], [0, 'Dom']\n]\nconst allWeekdayValues = weekDayOptions.map(([value]) => value)"
  )
}

main = main.replace(/(\{ id: '[^']+', title: '[^']+', points: \d+, active: true, icon: '[^']+', order: \d+, assignedChildIds: \['malu', 'miguel'\])( \})/g, `$1, weekdays: ${allWeekdays}$2`)

main = main.replace(
  "const activeActivities = useMemo(\n    () => orderedActivities.filter((activity) => activity.active && isActivityAssignedToChild(activity, selectedChild?.id)),\n    [orderedActivities, selectedChild?.id]\n  )",
  "const activeActivities = useMemo(\n    () => orderedActivities.filter((activity) => activity.active && isActivityAssignedToChild(activity, selectedChild?.id) && isActivityScheduledForDate(activity, selectedDate)),\n    [orderedActivities, selectedChild?.id, selectedDate]\n  )"
)

main = main.replace(
  "assignedChildIds: activity.assignedChildIds?.length ? activity.assignedChildIds : current.children.map((child) => child.id),\n             active: true",
  "assignedChildIds: activity.assignedChildIds?.length ? activity.assignedChildIds : current.children.map((child) => child.id),\n             weekdays: normalizeWeekdays(activity.weekdays),\n             active: true"
)

main = main.replace(
  "const [form, setForm] = useState({ title: '', points: '1', icon: '⭐', order: String(nextOrder), assignedChildIds: allChildIds })",
  "const [form, setForm] = useState({ title: '', points: '1', icon: '⭐', order: String(nextOrder), assignedChildIds: allChildIds, weekdays: allWeekdayValues })"
)

main = main.replace(
  "setForm({ title: '', points: '1', icon: '⭐', order: String(Math.min(99, nextOrder + 1)), assignedChildIds: allChildIds })",
  "setForm({ title: '', points: '1', icon: '⭐', order: String(Math.min(99, nextOrder + 1)), assignedChildIds: allChildIds, weekdays: allWeekdayValues })"
)

main = main.replace(
  "<ChildMultiSelect children={children} selectedIds={form.assignedChildIds} onChange={(assignedChildIds) => setForm({ ...form, assignedChildIds })} />\n        <button type=\"submit\">Adicionar</button>",
  "<ChildMultiSelect children={children} selectedIds={form.assignedChildIds} onChange={(assignedChildIds) => setForm({ ...form, assignedChildIds })} />\n        <WeekdayMultiSelect selectedDays={form.weekdays} onChange={(weekdays) => setForm({ ...form, weekdays })} />\n        <button type=\"submit\">Adicionar</button>"
)

main = main.replace(
  "<ChildMultiSelect children={children} selectedIds={activity.assignedChildIds?.length ? activity.assignedChildIds : allChildIds} onChange={(assignedChildIds) => onUpdateActivity(activity.id, { assignedChildIds })} />\n            <label className=\"toggle-label\"><input type=\"checkbox\" checked={activity.active} onChange={(event) => onUpdateActivity(activity.id, { active: event.target.checked })} />Ativa</label>",
  "<ChildMultiSelect children={children} selectedIds={activity.assignedChildIds?.length ? activity.assignedChildIds : allChildIds} onChange={(assignedChildIds) => onUpdateActivity(activity.id, { assignedChildIds })} />\n            <WeekdayMultiSelect selectedDays={activity.weekdays} onChange={(weekdays) => onUpdateActivity(activity.id, { weekdays })} />\n            <label className=\"toggle-label\"><input type=\"checkbox\" checked={activity.active} onChange={(event) => onUpdateActivity(activity.id, { active: event.target.checked })} />Ativa</label>"
)

if (!main.includes('function WeekdayMultiSelect(')) {
  main = main.replace(
    "function ChildMultiSelect({ children, selectedIds, onChange }) {",
    "function WeekdayMultiSelect({ selectedDays, onChange }) {\n  const selected = normalizeWeekdays(selectedDays)\n  function toggle(dayValue) {\n    const next = selected.includes(dayValue) ? selected.filter((value) => value !== dayValue) : [...selected, dayValue]\n    onChange(next.length ? next : allWeekdayValues)\n  }\n  return <div className=\"field weekday-multiselect\"><span>Dias</span><div>{weekDayOptions.map(([value, label]) => <button type=\"button\" key={value} className={selected.includes(value) ? 'is-selected' : ''} onClick={() => toggle(value)} aria-pressed={selected.includes(value)}>{label}</button>)}</div></div>\n}\n\nfunction ChildMultiSelect({ children, selectedIds, onChange }) {"
  )
} else {
  main = main.replace(
    "return <div className=\"field weekday-multiselect\"><span>Dias</span><div>{weekDayOptions.map(([value, label]) => <label key={value}><input type=\"checkbox\" checked={selected.includes(value)} onChange={() => toggle(value)} /><strong>{label}</strong></label>)}</div></div>",
    "return <div className=\"field weekday-multiselect\"><span>Dias</span><div>{weekDayOptions.map(([value, label]) => <button type=\"button\" key={value} className={selected.includes(value) ? 'is-selected' : ''} onClick={() => toggle(value)} aria-pressed={selected.includes(value)}>{label}</button>)}</div></div>"
  )
}

const normalizeStart = main.indexOf('function normalizeData(data)')
const normalizeEnd = main.indexOf('function sortActivities', normalizeStart)
if (normalizeStart !== -1 && normalizeEnd !== -1 && !main.slice(normalizeStart, normalizeEnd).includes('weekdays: normalizeWeekdays')) {
  const newNormalize = `function normalizeData(data) {
  const defaultChildrenById = new Map(defaultData.children.map((child) => [child.id, child]))
  const children = (data.children ?? defaultData.children).map((child, index) => {
    const defaultChild = defaultChildrenById.get(child.id) ?? {}
    return {
      birthDate: defaultChild.birthDate || '',
      photo: defaultChild.photo || '',
      theme: defaultChild.theme || (index % 2 === 0 ? 'purple' : 'blue'),
      ...child,
      birthDate: child.birthDate || defaultChild.birthDate || '',
      photo: child.photo || defaultChild.photo || ''
    }
  })
  return {
    ...defaultData,
    ...data,
    children,
    activities: (data.activities ?? defaultData.activities).map((activity, index) => ({
      ...activity,
      points: clampTwoDigit(activity.points, 1),
      order: clampTwoDigit(activity.order, index + 1),
      assignedChildIds: activity.assignedChildIds?.length ? activity.assignedChildIds : children.map((child) => child.id),
      weekdays: normalizeWeekdays(activity.weekdays)
    })),
    rewards: (data.rewards ?? defaultData.rewards).map((reward) => ({ ...reward, cost: clampTwoDigit(reward.cost, 10) })),
    rewardRedemptions: data.rewardRedemptions ?? {},
    transfers: data.transfers ?? {},
    records: data.records ?? {},
    notes: data.notes ?? {}
  }
}
`
  main = main.slice(0, normalizeStart) + newNormalize + main.slice(normalizeEnd)
}

if (!main.includes('function normalizeWeekdays(')) {
  main = main.replace(
    "function sortActivities(activities) { return [...activities].sort((a, b) => Number(a.order ?? 999) - Number(b.order ?? 999) || a.title.localeCompare(b.title, 'pt-BR')) }",
    "function normalizeWeekdays(weekdays) { const values = Array.isArray(weekdays) ? weekdays.map((value) => Number(value)).filter((value) => allWeekdayValues.includes(value)) : []; return values.length ? Array.from(new Set(values)) : allWeekdayValues }\nfunction isActivityScheduledForDate(activity, dateString) { return normalizeWeekdays(activity.weekdays).includes(parseLocalDate(dateString).getDay()) }\nfunction sortActivities(activities) { return [...activities].sort((a, b) => Number(a.order ?? 999) - Number(b.order ?? 999) || a.title.localeCompare(b.title, 'pt-BR')) }"
  )
}

main = main.replace(
  "activities.forEach((activity) => { const status = childRecords[activity.id]; if (status === 'na') return; possiblePoints += activity.points; applicable += 1; if (status === 'ok') { points += activity.points; completed += 1 } })",
  "activities.filter((activity) => isActivityScheduledForDate(activity, date)).forEach((activity) => { const status = childRecords[activity.id]; if (status === 'na') return; possiblePoints += activity.points; applicable += 1; if (status === 'ok') { points += activity.points; completed += 1 } })"
)

const cssAdd = `

/* Seleção de dias da semana nas atividades */
.weekday-multiselect > div { display: grid; grid-template-columns: repeat(7, minmax(38px, 1fr)); gap: 6px; }
.weekday-multiselect button { min-height: 36px; padding: 0 6px; border: 1px solid rgba(124, 58, 237, .18); border-radius: 999px; background: rgba(124, 58, 237, .07); color: var(--ink); font-size: .76rem; font-weight: 950; line-height: 1; cursor: pointer; transition: transform .14s ease, background .14s ease, border-color .14s ease; }
.weekday-multiselect button.is-selected { border-color: transparent; background: linear-gradient(135deg, #7c3aed, #06b6d4); color: #fff; box-shadow: 0 8px 18px rgba(124, 58, 237, .18); }
.weekday-multiselect button:active { transform: scale(.96); }
.activities-form .weekday-multiselect, .activities-settings .weekday-multiselect { min-width: min(100%, 310px); }
.activities-form { align-items: end; }
.activities-settings article { align-items: end; }
@media (max-width: 720px) { .weekday-multiselect > div { grid-template-columns: repeat(4, minmax(46px, 1fr)); gap: 6px; } .weekday-multiselect button { min-height: 38px; font-size: .74rem; padding: 0 4px; } }
`
if (!css.includes('Seleção de dias da semana nas atividades')) css = css.trimEnd() + cssAdd
else {
  css = css.replace(/\/\* Seleção de dias da semana nas atividades \*\/[\s\S]*?(?=\/\* Feedback visual ao adicionar cadastros \*\/|$)/, cssAdd.trim() + '\n')
}

fs.writeFileSync(mainPath, main, 'utf8')
fs.writeFileSync(cssPath, css, 'utf8')
