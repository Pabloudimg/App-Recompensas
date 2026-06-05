const fs = require('fs')
const path = require('path')

const filePath = path.join(process.cwd(), 'src', 'cloudStore.js')
let text = fs.readFileSync(filePath, 'utf8')

text = text.replace(
  "map[item.weekKey][childId][item.rewardId] = true",
  "map[item.weekKey][item.childId][item.rewardId] = true"
)

fs.writeFileSync(filePath, text, 'utf8')
