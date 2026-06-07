const fs = require('fs')
const path = require('path')

const mainPath = path.join(process.cwd(), 'src', 'main.jsx')
const cssPath = path.join(process.cwd(), 'src', 'styles.css')
let main = fs.readFileSync(mainPath, 'utf8')
let css = fs.readFileSync(cssPath, 'utf8')

main = main.replace("const timer = window.setTimeout(() => setShowSplash(false), 1050)", "const timer = window.setTimeout(() => setShowSplash(false), 1800)")
main = main.replace("  if (cloudLoading) return <LoadingScreen />\n\n  if (!user) {", "  if (!user) {")
main = main.replace("{showSplash && <SplashScreen />}", "{(showSplash || cloudLoading) && <SplashScreen />}")
main = main.replace("function LoadingScreen() {\n  return <main className=\"app-shell\"><section className=\"hero-card entrance-card\"><div><p className=\"eyebrow\">Carregando</p><h1>Conectando à nuvem...</h1><p className=\"hero-copy\">Estamos preparando seus dados do Firebase.</p></div></section></main>\n}\n\n", "")

css = css.replace(".splash-screen { position: fixed; inset: 0; z-index: 50; display: grid; place-content: center; gap: 8px; text-align: center; background: linear-gradient(135deg, #7c3aed, #0ea5e9, #22c55e); color: white; animation: splashOut 1.1s ease forwards; }", ".splash-screen { position: fixed; inset: 0; z-index: 50; display: grid; place-content: center; gap: 8px; text-align: center; background: linear-gradient(135deg, #7c3aed, #0ea5e9, #22c55e); color: white; overflow: hidden; animation: splashSoftEntrance .22s ease-out both; }")

const cssAdd = `

/* Splash inicial mais suave */
.splash-badge { animation: badgePulse 0.95s ease-in-out infinite alternate, splashGlow 1.8s ease-in-out infinite alternate; }
.splash-screen h2 { animation: splashText 1.4s ease-in-out infinite alternate; }
@keyframes splashSoftEntrance { from { opacity: 0; } to { opacity: 1; } }
@keyframes splashGlow { from { box-shadow: 0 18px 50px rgba(255,255,255,.12); } to { box-shadow: 0 24px 70px rgba(255,255,255,.28); } }
@keyframes splashText { from { transform: translateY(0); opacity: .92; } to { transform: translateY(-3px); opacity: 1; } }
`
if (!css.includes('Splash inicial mais suave')) css = css.trimEnd() + cssAdd

fs.writeFileSync(mainPath, main, 'utf8')
fs.writeFileSync(cssPath, css, 'utf8')
