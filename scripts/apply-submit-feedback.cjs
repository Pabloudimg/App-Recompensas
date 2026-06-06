const fs = require('fs')
const path = require('path')

const mainPath = path.join(process.cwd(), 'src', 'main.jsx')
const cssPath = path.join(process.cwd(), 'src', 'styles.css')
let main = fs.readFileSync(mainPath, 'utf8')
let css = fs.readFileSync(cssPath, 'utf8')

if (!main.includes('function markSubmitFeedback(')) {
  main = main.replace(
    "function ProgressBar({ value }) { return <div className=\"progress-track\" aria-label={`Progresso ${value}%`}><span style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }} /></div> }",
    "function ProgressBar({ value }) { return <div className=\"progress-track\" aria-label={`Progresso ${value}%`}><span style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }} /></div> }\n\nfunction markSubmitFeedback(event, message = 'Adicionado!') {\n  const button = event.currentTarget?.querySelector('button[type=\"submit\"]')\n  if (!button) return\n  const previousText = button.textContent\n  button.classList.add('just-added')\n  button.textContent = `✓ ${message}`\n  window.setTimeout(() => {\n    button.classList.remove('just-added')\n    button.textContent = previousText\n  }, 950)\n}"
  )
}

const replacements = [
  ["onAddActivity(form)\n    setForm(", "onAddActivity(form)\n    markSubmitFeedback(event)\n    setForm("],
  ["onAddReward(form); setForm(", "onAddReward(form); markSubmitFeedback(event); setForm("],
  ["onAddChild(form); setForm(", "onAddChild(form); markSubmitFeedback(event); setForm("],
  ["await onCreateInvite(form)\n    setForm(", "await onCreateInvite(form)\n    markSubmitFeedback(event, 'Convite enviado!')\n    setForm("]
]

for (const [from, to] of replacements) {
  if (main.includes(from) && !main.includes(to)) main = main.replace(from, to)
}

const cssAdd = `

/* Feedback visual ao adicionar cadastros */
button.just-added { animation: submitSuccessPulse .95s ease both; background: linear-gradient(135deg, #22c55e, #14b8a6) !important; color: #fff !important; box-shadow: 0 18px 40px rgba(34, 197, 94, .26) !important; }
@keyframes submitSuccessPulse { 0% { transform: scale(1); } 22% { transform: scale(1.04); } 100% { transform: scale(1); } }
`
if (!css.includes('Feedback visual ao adicionar cadastros')) css = css.trimEnd() + cssAdd

fs.writeFileSync(mainPath, main, 'utf8')
fs.writeFileSync(cssPath, css, 'utf8')
