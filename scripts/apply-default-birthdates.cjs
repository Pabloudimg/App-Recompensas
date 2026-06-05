const fs = require('fs')
const path = require('path')

const mainPath = path.join(process.cwd(), 'src', 'main.jsx')
let main = fs.readFileSync(mainPath, 'utf8')

if (!main.includes('defaultChildrenById')) {
  const oldText = "function normalizeData(data) { const children = (data.children ?? defaultData.children).map((child, index) => ({ birthDate: '', photo: '', theme: index % 2 === 0 ? 'purple' : 'blue', ...child })); return { ...defaultData, ...data, children, activities: (data.activities ?? defaultData.activities).map((activity, index) => ({ ...activity, points: clampTwoDigit(activity.points, 1), order: clampTwoDigit(activity.order, index + 1), assignedChildIds: activity.assignedChildIds?.length ? activity.assignedChildIds : children.map((child) => child.id) })), rewards: (data.rewards ?? defaultData.rewards).map((reward) => ({ ...reward, cost: clampTwoDigit(reward.cost, 10) })), rewardRedemptions: data.rewardRedemptions ?? {}, transfers: data.transfers ?? {}, records: data.records ?? {}, notes: data.notes ?? {} } }"

  const newText = `function normalizeData(data) {
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
      assignedChildIds: activity.assignedChildIds?.length ? activity.assignedChildIds : children.map((child) => child.id)
    })),
    rewards: (data.rewards ?? defaultData.rewards).map((reward) => ({ ...reward, cost: clampTwoDigit(reward.cost, 10) })),
    rewardRedemptions: data.rewardRedemptions ?? {},
    transfers: data.transfers ?? {},
    records: data.records ?? {},
    notes: data.notes ?? {}
  }
}`

  if (!main.includes(oldText)) {
    throw new Error('Trecho normalizeData não encontrado para aplicar backfill de datas de nascimento.')
  }

  main = main.replace(oldText, newText)
}

fs.writeFileSync(mainPath, main, 'utf8')
