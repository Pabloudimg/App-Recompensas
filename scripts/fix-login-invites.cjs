const fs = require('fs')
const path = require('path')

const filePath = path.join(process.cwd(), 'src', 'main.jsx')
let text = fs.readFileSync(filePath, 'utf8')

text = text.replace(
  "        const invitations = await listPendingInvitesForEmail(currentUser.email)\n        setPendingInvites(invitations)\n",
  "        setPendingInvites([])\n"
)

fs.writeFileSync(filePath, text, 'utf8')
