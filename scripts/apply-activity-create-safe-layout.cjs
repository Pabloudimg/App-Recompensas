const fs = require('fs')
const path = require('path')

const cssPath = path.join(process.cwd(), 'src', 'styles.css')
let css = fs.readFileSync(cssPath, 'utf8')

const block = `

/* Layout seguro para o formulário de nova atividade em telas de PC */
@media (min-width: 821px) {
  .create-disclosure .activities-form {
    grid-template-columns: 82px minmax(320px, 1fr) 90px 90px 140px;
    grid-template-areas:
      "icon desc order points add"
      "children children children children children"
      "days days days days days";
    align-items: end;
  }

  .create-disclosure .activities-form > .child-multiselect,
  .create-disclosure .activities-form .child-multiselect > div {
    max-width: 100%;
  }

  .create-disclosure .activities-form .child-multiselect > div {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    min-height: 44px;
  }

  .create-disclosure .activities-form > .weekday-multiselect {
    min-width: 0;
    width: 100%;
  }

  .create-disclosure .activities-form .weekday-multiselect > div {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    justify-content: flex-start;
    align-items: center;
  }

  .create-disclosure .activities-form .weekday-multiselect button {
    flex: 0 0 44px;
    width: 44px;
    min-width: 44px;
    height: 36px;
    min-height: 36px;
    padding: 0;
    border-radius: 999px;
    font-size: .7rem;
    line-height: 1;
  }
}
`

if (!css.includes('Layout seguro para o formulário de nova atividade em telas de PC')) {
  css = css.trimEnd() + block
}

fs.writeFileSync(cssPath, css, 'utf8')
