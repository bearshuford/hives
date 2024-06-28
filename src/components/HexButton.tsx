import React from "react"
import styled, { css } from "styled-components"
import { Hexagon, HexagonFill } from "styled-icons/bootstrap"

const pair23 = css`
  > *:nth-child(2) {
    transform: translateX(${({ theme }) => (theme.tile.width) / 16}px);
  }
  > *:nth-child(3){
    transform: translateX(${({ theme }) => -(theme.tile.width) / 32}px) translateY(${({ theme }) => -((theme.tile.width) * Math.sqrt(3) / 32)}px);
  }
`
const pair45 = css`
  > *:nth-child(4) {
    transform: translateX(-${({ theme }) => (theme.tile.width) / 32}px) translateY(${({ theme }) => (theme.tile.width) * Math.sqrt(3) / 32}px);
  }
  > *:nth-child(5){
    transform: translateX(${({ theme }) => (theme.tile.width) / 16}px);
  }
`
const pair67 = css`
  > *:nth-child(7) {
    transform: translateX(-${({ theme }) => (theme.tile.width) / 24}px) translateY(${({ theme }) => (theme.tile.width) * Math.sqrt(3) / 32}px);
  }
  > *:nth-child(6) {
    transform: translateX(-${({ theme }) => (theme.tile.width) / 24}px) translateY(${({ theme }) => -(theme.tile.width) * Math.sqrt(3) / 32}px);
  }
`
const pair72 = css`
  > *:nth-child(7){
    transform: translateX(${({ theme }) => (theme.tile.width) / 32}px) translateY(${({ theme }) => -(theme.tile.width) * Math.sqrt(3) / 32}px);
  }
  > *:nth-child(2) {
    transform: translateX(${({ theme }) => -(theme.tile.width) / 16}px);
  }
`
const pair34 = css`
  > *:nth-child(3) {
    transform: translateX(${({ theme }) => (theme.tile.width) / 32}px) translateY(${({ theme }) => (theme.tile.width) * Math.sqrt(3) / 32}px);
  }
  > *:nth-child(4) {
    transform: translateX(${({ theme }) => (theme.tile.width) / 32}px) translateY(${({ theme }) => -(theme.tile.width) * Math.sqrt(3) / 32}px);
  }
`
const pair56 = css`
  > *:nth-child(5){
    transform: translateX(${({ theme }) => -theme.tile.width / 16}px);
  }
  > *:nth-child(6){
    transform: translateX(${({ theme }) => theme.tile.width / 32}px) translateY(${({ theme }) => theme.tile.width * Math.sqrt(3) / 32}px);
  }
`
const group723 = css`
  > *:nth-child(7) {
    transform: translateX(${({ theme }) => theme.tile.width / 32}px) translateY(${({ theme }) => -theme.tile.width * Math.sqrt(3) / 32}px);
  }
  > *:nth-child(3) {
    transform: translateX(${({ theme }) => -theme.tile.width / 32}px) translateY(${({ theme }) => -theme.tile.width * Math.sqrt(3) / 32}px);
  }
`
const group456 = css`
  > *:nth-child(4) {
    transform: translateX(${({ theme }) => -theme.tile.width / 32}px) translateY(${({ theme }) => theme.tile.width * Math.sqrt(3) / 32}px);
  }
  > *:nth-child(6) {
    transform: translateX(${({ theme }) => theme.tile.width / 32}px) translateY(${({ theme }) => theme.tile.width * Math.sqrt(3) / 32}px);
  }
`
export const arrangements = [
  [pair23, pair45, pair67],
  [group723, group456],
  [pair72, pair34, pair56],
  [pair72, pair45],
  [pair23, pair56],
]

export const Honeycomb = styled.div`
  user-select: none;
  grid-area: honeycomb;
  display: grid;
  grid-template-areas: 
    ".       .       hex2 .       ."
    ".       hex7    .    hex3    ."
    ".       .       hex1 .       ."
    ".       hex6    .    hex4    ."
    "shuffle .       hex5 .       submit"
    ".       arrange .    .       .";
  grid-template-columns: ${({ theme }) => {
    const w = theme.tile.width + theme.tile.gap
    return `${w / 2}px ${w}px ${w / 2}px ${w}px ${w / 2}px ${w}px`
  }};
  grid-template-rows: ${({ theme }) => `repeat(6, ${((theme.tile.width + theme.tile.gap) * Math.sqrt(3)) / 4}px)`};

  margin: 32px 14px;
  @media (min-width: 768px) {
    margin: 28px;
  }
  align-items: center;
  justify-items: center;
  transition: all .3s;
  width: ${({ theme }) => (theme.tile.width + theme.tile.gap) * 2.5}px;

  ${arrangements.map((arrangement, index) => css`
    &.arrangement-${index + 1} {
      ${arrangement}
    }
  `)}
`
const HexButton = styled.button<{
  required?: boolean
  gridArea?: string
}>`
  all: unset;
  user-select: none;
  ${({ gridArea }) => gridArea && `grid-area: ${gridArea};`}
  color: ${({ theme, required }) => required ? theme.colors.primary : theme.tile.text};
  position: relative;
  cursor: pointer;
  width: ${({ theme }) => theme.tile.width}px;
  height: ${({ theme }) => (theme.tile.width) * Math.sqrt(3) / 2}px;
  line-height: 78px;
  text-align: center;
  text-transform: uppercase;
  font-weight: bold;
  font-size: ${({ required }) => required ? 52 : 42}px;
  background-color: ${({ required, theme }) => required ? 'transparent' : theme.tile.background};
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
  transition: all .24s ease-out;
`
export const Hex = styled(HexagonFill)`
  color: ${({ theme }) => theme.tile.background};
`
export const HexOutline = styled(Hexagon)`
  color: ${({ theme }) => theme.colors.accent};
`
export const HexLetter: React.FC = ({ letter = '', required = false, ...props }: {
  letter?: string
  required?: boolean
  onClick?: () => void
}) => {
  return (
    <div {...props}>
      {required
        ? <Hex> {letter} </Hex>
        : <HexOutline> {letter} </HexOutline>
      }
    </div>
  )
}


export default HexButton