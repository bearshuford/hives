// my-theme.ts
import { DefaultTheme } from 'styled-components'

// https://github.com/monkeytypegame/monkeytype/blob/3ca184009728ef11c696d35cbec5335467adaa56/frontend/static/themes/serika_dark.css#L4
const serikaDark = {
  background: '#323437',
  primary: '#e2b714',
  secondary: '#646669',
  accent: '#ca4754',
  accentDark: '#ca4754',
  text: '#d1d0c5',
  textSecondary: 'dimgray'
}
const myTheme: DefaultTheme = {
  colors: serikaDark,
  tile: {
    background: serikaDark.secondary,
    text: serikaDark.text,
    width: 98,
    gap: 6
  }
}

export { myTheme }

export default myTheme