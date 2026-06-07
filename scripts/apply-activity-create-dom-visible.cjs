const fs = require('fs')
const path = require('path')

const cssPath = path.join(process.cwd(), 'src', 'styles.css')
let css = fs.readFileSync(cssPath, 'utf8')

const block = `

/* Ajuste fino: garantir que Domingo não corte no cadastro de atividade em telas de PC */
@media (min-width: 821px) {
  .create-disclosure .activities-form {
    grid-template-areas:
      "icon desc order points add"
      "children days days days days";
  }

  .create-disclosure .activities-form > .child-multiselect {
    max-width: 360px;
  }

  .create-disclosure .activities-form .child-multiselect > div {
    max-width: 360px;
  }

  .create-disclosure .activities-form > .weekday-multiselect {
    min-width: 0;
    overflow: visible;
  }

  .create-disclosure .activities-form .weekday-multiselect > div {
    grid-template-columns: repeat(7, 42px);
    gap: 6px;
    justify-content: start;
    overflow: visible;
  }

  .create-disclosure .activities-form .weekday-multiselect button {
    width: 42px;
    min-width: 42px;
    height: 36px;
    min-height: 36px;
    font-size: .7rem;
  }
}

@media (min-width: 1180px) {
  .create-disclosure .activities-form > .child-multiselect,
  .create-disclosure .activities-form .child-multiselect > div {
    max-width: 390px;
  }
}
`

if (!css.includes('Ajuste fino: garantir que Domingo não corte no cadastro de atividade')) {
  css = css.trimEnd() + block
}

fs.writeFileSync(cssPath, css, 'utf8')
