const fs = require('fs')
const path = require('path')

const cssPath = path.join(process.cwd(), 'src', 'styles.css')
let css = fs.readFileSync(cssPath, 'utf8')

const block = `

/* Correções finais para uso em notebook/PC */
@media (min-width: 821px) {
  .app-shell {
    width: min(1280px, calc(100% - 48px));
  }

  .panel {
    overflow: hidden;
  }

  .activities-form {
    grid-template-columns: 76px minmax(280px, 1fr) 86px 86px 132px;
    grid-template-areas:
      "icon desc points order add"
      "children children children days days";
    align-items: end;
  }

  .activities-form > .small-field { grid-area: icon; }
  .activities-form > .field:not(.small-field):not(.numeric-field):not(.child-multiselect):not(.weekday-multiselect) { grid-area: desc; }
  .activities-form > .numeric-field:nth-of-type(3) { grid-area: points; }
  .activities-form > .numeric-field:nth-of-type(4) { grid-area: order; }
  .activities-form > .child-multiselect { grid-area: children; }
  .activities-form > .weekday-multiselect { grid-area: days; }
  .activities-form > button[type="submit"] { grid-area: add; min-width: 0; }

  .activities-settings article {
    grid-template-columns: 62px 70px minmax(260px, 1fr) 82px 82px 82px 112px;
    grid-template-areas:
      "move icon desc points order active remove"
      ". children children children days days days";
    gap: 10px;
    align-items: end;
    overflow: hidden;
  }

  .activities-settings article > .order-buttons { grid-area: move; }
  .activities-settings article > .small-field { grid-area: icon; }
  .activities-settings article > .field:not(.small-field):not(.numeric-field):not(.child-multiselect):not(.weekday-multiselect) { grid-area: desc; }
  .activities-settings article > .numeric-field:nth-of-type(3) { grid-area: points; }
  .activities-settings article > .numeric-field:nth-of-type(4) { grid-area: order; }
  .activities-settings article > .child-multiselect { grid-area: children; }
  .activities-settings article > .weekday-multiselect { grid-area: days; }
  .activities-settings article > .toggle-label { grid-area: active; justify-content: center; }
  .activities-settings article > .ghost.danger { grid-area: remove; width: 100%; min-width: 0; }

  .activities-settings .field,
  .activities-form .field,
  .activities-settings input,
  .activities-form input {
    min-width: 0;
  }

  .weekday-multiselect > div {
    grid-template-columns: repeat(7, minmax(36px, 1fr));
  }

  .weekday-multiselect button {
    min-height: 34px;
    padding: 0 4px;
    font-size: .72rem;
  }

  .child-multiselect > div {
    min-height: 46px;
    align-content: center;
  }
}

@media (min-width: 1180px) {
  .activities-form {
    grid-template-columns: 78px minmax(360px, 1.3fr) 88px 88px 140px;
  }

  .activities-settings article {
    grid-template-columns: 62px 72px minmax(360px, 1.4fr) 84px 84px 84px 112px;
  }
}

@media (min-width: 1500px) {
  .app-shell {
    width: min(1360px, calc(100% - 64px));
  }
}
`

if (!css.includes('Correções finais para uso em notebook/PC')) {
  css = css.trimEnd() + block
}

fs.writeFileSync(cssPath, css, 'utf8')
