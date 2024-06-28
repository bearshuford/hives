import React from 'react'
import { Route } from 'wouter'
import Home from './components/Home'
import GameRoom from './components/GameRoom'
import { Toaster } from 'react-hot-toast'
import GlobalFonts from './fonts/fonts'
import { ThemeProvider, createGlobalStyle } from 'styled-components'
import myTheme from './theme'
import Grid from './components/exp/Grid'

const GlobalStyles = createGlobalStyle`
    html,
    body {
        background-color: ${({ theme }) => theme.colors.background};
        min-height: 100%;
    }

    body {
        font-size: 18px;
        line-height: 1.45;
        margin: 0 auto 1rem;
        padding: .25rem;
        color: ${({ theme }) => theme.colors.text};
    }
    .primary-text {
        color: ${({ theme }) => theme.colors.primary};
    }
`

const App: React.FC = () => (
    <ThemeProvider theme={myTheme}>
        <GlobalFonts />
        <GlobalStyles />
        <Route path="/" component={Home} />
        <Route path="/exp" component={Grid} />
        <Route path="/room/:roomCode" component={GameRoom} />
        <Toaster position='top-center' />
    </ThemeProvider>
)

export default App
