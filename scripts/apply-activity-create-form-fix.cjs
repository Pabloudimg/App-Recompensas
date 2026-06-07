const fs = require('fs')
const path = require('path')

const cssPath = path.join(process.cwd(), 'src', 'styles.css')
let css = fs.readFileSync(cssPath, 'utf8')

const block = `

/* Ajuste final do formulário de nova atividade no desktop */
@media (min-width: 821px) {
  .create-disclosure .activities-form {
    grid-template-columns: 82px minmax(320px, 1fr) 90px 90px 136px;
    grid-template-areas:
      "icon desc order points add"
      "children days days days days";
    align-items: end;
  }

  .create-disclosure .activities-form > .small-field { grid-area: icon; }
  .create-disclosure .activities-form > .field:not(.small-field):not(.numeric-field):not(.child-multiselect):not(.weekday-multiselect) { grid-area: desc; }
  .create-disclosure .activities-form > .numeric-field:nth-of-type(3) { grid-area: order; }
  .create-disclosure .activities-form > .numeric-field:nth-of-type(4) { grid-area: points; }
  .create-disclosure .activities-form > .child-multiselect { grid-area: children; }
  .create-disclosure .activities-form > .weekday-multiselect { grid-area: days; }
  .create-disclosure .activities-form > button[type="submit"] { grid-area: add; width: 100%; }

  .create-disclosure .activities-form .child-multiselect > div {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    min-height: 44px;
    padding: 6px;
  }

  .create-disclosure .activities-form .child-multiselect label {
    min-height: 32px;
    padding: 4px 8px;
    font-size: .78rem;
  }

  .create-disclosure .activities-form .weekday-multiselect > div {
    grid-template-columns: repeat(7, minmax(42px, 1fr));
    gap: 7px;
  }

  .create-disclosure .activities-form .weekday-multiselect button {
    min-height: 38px;
    font-size: .74rem;
  }
}

@media (min-width: 1180px) {
  .create-disclosure .activities-form {
    grid-template-columns: 82px minmax(420px, 1.1fr) 90px 90px 140px;
  }

  .create-disclosure .activities-form > .child-multiselect {
    max-width: 520px;
  }
}
`

if (!css.includes('Ajuste final do formulário de nova atividade no desktop')) {
  css = css.trimEnd() + block
}

fs.writeFileSync(cssPath, css, 'utf8')
