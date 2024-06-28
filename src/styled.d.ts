// import original module declarations
import 'styled-components';


// and extend them! 
declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string
      secondary: string
      background: string
      accent: string
      accentDark: string
      text: string
      textSecondary: string
    }
    tile: {
      text: string
      background: string
      width: number
      gap: number
    }
  }
}