const fs = require('fs')
const path = require('path')

const cssPath = path.join(process.cwd(), 'src', 'styles.css')
let css = fs.readFileSync(cssPath, 'utf8')

const block = `

/* Ajustes adaptativos para notebook/desktop */
@media (min-width: 1180px) {
  .app-shell {
    width: min(1320px, calc(100% - 56px));
  }

  .hero-card {
    padding: 34px;
  }

  .children-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }

  .summary-grid {
    grid-template-columns: repeat(auto-fit, minmax(430px, 1fr));
  }

  .reward-grid {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  }

  .activities-form {
    grid-template-columns: 78px minmax(260px, 1.4fr) 92px 92px minmax(250px, 1fr) minmax(290px, 1.25fr) 132px;
    align-items: end;
  }

  .activities-settings {
    gap: 14px;
  }

  .activities-settings article {
    grid-template-columns: 72px 70px minmax(260px, 1.6fr) 86px 86px minmax(240px, 1fr) minmax(280px, 1.2fr) 78px 104px;
    gap: 10px;
    align-items: end;
  }

  .activities-settings .field,
  .activities-form .field {
    min-width: 0;
  }

  .activities-settings .field input,
  .activities-form .field input {
    min-width: 0;
  }

  .weekday-multiselect > div {
    grid-template-columns: repeat(7, minmax(34px, 1fr));
  }

  .weekday-multiselect button {
    min-height: 34px;
    padding: 0 5px;
    font-size: .72rem;
  }

  .child-multiselect > div {
    min-height: 48px;
    align-content: center;
  }

  .child-multiselect label {
    min-height: 32px;
    padding: 4px 7px;
    font-size: .78rem;
  }

  .child-multiselect img {
    width: 22px;
    height: 22px;
  }

  .toggle-label {
    justify-content: center;
  }
}

@media (min-width: 821px) and (max-width: 1179px) {
  .app-shell {
    width: min(1120px, calc(100% - 36px));
  }

  .activities-form {
    grid-template-columns: 72px minmax(240px, 1fr) 88px 88px minmax(250px, 1fr);
  }

  .activities-form .weekday-multiselect {
    grid-column: 1 / -2;
  }

  .activities-form button[type="submit"] {
    grid-column: -2 / -1;
  }

  .activities-settings article {
    grid-template-columns: 70px 70px minmax(240px, 1fr) 86px 86px 120px;
  }

  .activities-settings article .child-multiselect,
  .activities-settings article .weekday-multiselect {
    grid-column: 1 / -1;
  }

  .activities-settings article .toggle-label {
    grid-column: 1 / 3;
  }

  .activities-settings article .ghost.danger {
    grid-column: 3 / 5;
    justify-self: start;
    min-width: 140px;
  }

  .weekday-multiselect > div {
    grid-template-columns: repeat(7, minmax(42px, 1fr));
  }
}

@media (min-width: 1180px) and (max-width: 1320px) {
  .activities-settings article {
    grid-template-columns: 70px 68px minmax(220px, 1.4fr) 82px 82px minmax(210px, 1fr) minmax(250px, 1.1fr) 74px 100px;
  }

  .activities-form {
    grid-template-columns: 76px minmax(230px, 1.3fr) 88px 88px minmax(230px, 1fr) minmax(260px, 1.15fr) 124px;
  }
}
`

if (!css.includes('Ajustes adaptativos para notebook/desktop')) {
  css = css.trimEnd() + block
}

fs.writeFileSync(cssPath, css, 'utf8')
