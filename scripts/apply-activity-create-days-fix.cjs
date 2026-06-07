const fs = require('fs')
const path = require('path')

const cssPath = path.join(process.cwd(), 'src', 'styles.css')
let css = fs.readFileSync(cssPath, 'utf8')

const block = `

/* Correção do tamanho dos chips de dias no formulário de nova atividade */
@media (min-width: 821px) {
  .create-disclosure .activities-form {
    grid-template-areas:
      "icon desc order points add"
      "children children days days days";
  }

  .create-disclosure .activities-form > .child-multiselect {
    max-width: none;
  }

  .create-disclosure .activities-form .weekday-multiselect > div {
    display: grid;
    grid-template-columns: repeat(7, 46px);
    justify-content: start;
    align-items: start;
    gap: 7px;
  }

  .create-disclosure .activities-form .weekday-multiselect button {
    width: 46px;
    height: 38px;
    min-height: 38px;
    padding: 0;
    border-radius: 999px;
    align-self: start;
    justify-self: start;
    font-size: .72rem;
    line-height: 1;
  }
}

@media (min-width: 1180px) {
  .create-disclosure .activities-form {
    grid-template-columns: 82px minmax(420px, 1.1fr) 90px 90px 140px;
  }
}
`

if (!css.includes('Correção do tamanho dos chips de dias no formulário de nova atividade')) {
  css = css.trimEnd() + block
}

fs.writeFileSync(cssPath, css, 'utf8')
