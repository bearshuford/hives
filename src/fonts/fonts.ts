import { createGlobalStyle } from "styled-components"

// see https://dev.to/anteronunes/comment/171a3
export default createGlobalStyle`
    body {
        font-family: ui-sans-serif, sans-serif;
        button, h1 {
            font-family: ui-mono, monospace;
        }
    }
        `
