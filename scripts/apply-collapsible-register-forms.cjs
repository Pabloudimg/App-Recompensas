const fs = require('fs')
const path = require('path')

const mainPath = path.join(process.cwd(), 'src', 'main.jsx')
const cssPath = path.join(process.cwd(), 'src', 'styles.css')
let main = fs.readFileSync(mainPath, 'utf8')
let css = fs.readFileSync(cssPath, 'utf8')

if (!main.includes('Adicionar Atividade</summary>')) {
  main = main.replace(
    '<form className="inline-form activities-form" onSubmit={submit}>',
    '<details className="create-disclosure"><summary>+ Adicionar Atividade</summary><form className="inline-form activities-form" onSubmit={submit}>'
  )
  main = main.replace(
    '</form>\n      <div className="settings-list activities-settings">',
    '</form></details>\n      <div className="settings-list activities-settings">'
  )
}

if (!main.includes('Adicionar Prêmio</summary>')) {
  main = main.replace(
    '<form className="inline-form rewards-form" onSubmit={submit}>',
    '<details className="create-disclosure"><summary>+ Adicionar Prêmio</summary><form className="inline-form rewards-form" onSubmit={submit}>'
  )
  main = main.replace(
    '</form><div className="settings-list rewards-settings">',
    '</form></details><div className="settings-list rewards-settings">'
  )
}

if (!main.includes('Adicionar Criança</summary>')) {
  main = main.replace(
    '<form className="inline-form children-form" onSubmit={submit}>',
    '<details className="create-disclosure"><summary>+ Adicionar Criança</summary><form className="inline-form children-form" onSubmit={submit}>'
  )
  main = main.replace(
    '</form><div className="settings-list children-settings">',
    '</form></details><div className="settings-list children-settings">'
  )
}

main = main.replace('{showSplash && <SplashScreen />}', '{showSplash && <SplashScreen children={data.children} />}')
main = main.replace('{(showSplash || cloudLoading) && <SplashScreen />}', '{(showSplash || cloudLoading) && <SplashScreen children={data.children} />}')
main = main.replace('function SplashScreen() {', 'function SplashScreen({ children = [] }) {')
main = main.replace("<p>Malu & Miguel</p>", "<p>{children.map((child) => child.name).filter(Boolean).join(' & ') || 'Level Up'}</p>")

main = main.replace(
  "button.textContent = previousText\n  }, 950)",
  "button.textContent = previousText\n    event.currentTarget.closest('details')?.removeAttribute('open')\n  }, 950)"
)

const cssBlock = `

/* Formulários colapsáveis dos cadastros */
.create-disclosure {
  margin-bottom: 18px;
  border: 1px solid var(--line);
  border-radius: 24px;
  background: color-mix(in srgb, var(--card) 72%, transparent);
  overflow: hidden;
}
.create-disclosure summary {
  min-height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 18px;
  list-style: none;
  cursor: pointer;
  user-select: none;
  background: #111827;
  color: #fff;
  font-weight: 950;
  border-radius: 22px;
  margin: 8px;
  transition: transform .16s ease, box-shadow .16s ease, background .16s ease;
}
.create-disclosure summary::-webkit-details-marker { display: none; }
.create-disclosure summary:hover { transform: translateY(-1px); box-shadow: 0 14px 34px rgba(15, 23, 42, .16); }
.create-disclosure[open] summary { background: linear-gradient(135deg, #7c3aed, #06b6d4); }
:root[data-theme="dark"] .create-disclosure summary { background: #f8fafc; color: #111827; }
:root[data-theme="dark"] .create-disclosure[open] summary { background: linear-gradient(135deg, #a78bfa, #22d3ee); color: #0f172a; }
.create-disclosure .inline-form { margin: 0; padding: 12px; }

@media (min-width: 821px) {
  .create-disclosure .activities-form {
    grid-template-columns: 82px minmax(280px, 1fr) 92px 92px 140px;
    grid-template-areas:
      "icon desc points order add"
      "children children children days days";
  }
  .create-disclosure .rewards-form {
    grid-template-columns: 82px minmax(280px, 1fr) 110px 150px;
  }
  .create-disclosure .children-form {
    grid-template-columns: minmax(260px, 1fr) 180px 200px 150px;
  }
}

@media (max-width: 820px) {
  .create-disclosure summary { min-height: 52px; }
  .create-disclosure .inline-form { padding: 10px; }
}
`
if (!css.includes('Formulários colapsáveis dos cadastros')) css = css.trimEnd() + cssBlock

fs.writeFileSync(mainPath, main, 'utf8')
fs.writeFileSync(cssPath, css, 'utf8')
