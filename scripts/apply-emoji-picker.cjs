const fs = require('fs')
const path = require('path')

const mainPath = path.join(process.cwd(), 'src', 'main.jsx')
const cssPath = path.join(process.cwd(), 'src', 'styles.css')

let main = fs.readFileSync(mainPath, 'utf8')
let css = fs.readFileSync(cssPath, 'utf8')

function replaceRegex(regex, replacement) {
  main = main.replace(regex, replacement)
}

replaceRegex(
  /<label className="field small-field"><span>Ícone<\/span><input value=\{form\.icon\}[\s\S]*?<\/label>/g,
  `<EmojiPicker value={form.icon} onChange={(icon) => setForm({ ...form, icon })} />`
)

replaceRegex(
  /<label className="field small-field"><span>Ícone<\/span><input value=\{activity\.icon\}[\s\S]*?<\/label>/g,
  `<EmojiPicker value={activity.icon} onChange={(icon) => onUpdateActivity(activity.id, { icon })} />`
)

replaceRegex(
  /<label className="field small-field"><span>Ícone<\/span><input value=\{reward\.icon\}[\s\S]*?<\/label>/g,
  `<EmojiPicker value={reward.icon} onChange={(icon) => onUpdateReward(reward.id, { icon })} />`
)

if (!main.includes('function EmojiPicker(')) {
  const picker = `
const emojiOptions = ['⭐','🌟','🎒','🚗','🍽️','🪥','🤝','🧸','📚','✏️','🛏️','🧼','🧹','🧺','🥗','🍎','💧','🏃','⚽','🎨','🎵','🎮','🎬','🍨','🌳','🍕','🎁','🏆','🪙','🚀','🦄','🐶','🐱','🐼','🦊','😊','😄','👍','👏','💪','❤️']

function EmojiPicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  function choose(icon) {
    onChange(icon)
    setOpen(false)
  }
  return (
    <div className="field small-field emoji-picker">
      <span>Ícone</span>
      <button type="button" className="emoji-picker-button" onClick={() => setOpen(!open)}>{value || '⭐'}</button>
      {open && <div className="emoji-picker-menu" role="listbox">{emojiOptions.map((icon) => <button type="button" key={icon} onClick={() => choose(icon)}>{icon}</button>)}</div>}
    </div>
  )
}
`
  main = main.replace('function ChildMultiSelect', picker + '\nfunction ChildMultiSelect')
}

const cssAdd = `

/* Seletor visual de emoticons */
.emoji-picker { position: relative; }
.emoji-picker-button { width: 100%; min-height: 48px; border: 1px solid rgba(124, 58, 237, .18); border-radius: 16px; background: var(--field); color: var(--ink); font-size: 1.45rem; }
.emoji-picker-menu { position: absolute; z-index: 20; top: calc(100% + 8px); left: 0; width: min(304px, calc(100vw - 36px)); display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; padding: 10px; border: 1px solid var(--line); border-radius: 18px; background: color-mix(in srgb, var(--card) 96%, transparent); box-shadow: 0 24px 60px rgba(15, 23, 42, .22); backdrop-filter: blur(18px); }
.emoji-picker-menu button { display: grid; place-items: center; min-height: 36px; border: 0; border-radius: 12px; background: rgba(124, 58, 237, .08); font-size: 1.22rem; transition: transform .15s ease, background .15s ease; }
.emoji-picker-menu button:hover { transform: translateY(-2px); background: rgba(124, 58, 237, .16); }
@media (max-width: 560px) { .emoji-picker-menu { grid-template-columns: repeat(6, 1fr); } }
`
if (!css.includes('Seletor visual de emoticons')) css = css.trimEnd() + cssAdd

fs.writeFileSync(mainPath, main)
fs.writeFileSync(cssPath, css)
