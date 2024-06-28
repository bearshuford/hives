// GameRoom.tsx
import React, { useState } from 'react'
import { Link, useRoute } from 'wouter'
import useGame from '../../hooks/useGame'
import HexButton, { Honeycomb } from '../HexButton'
import styled, { DefaultTheme, keyframes } from 'styled-components'
import { Shuffle } from 'styled-icons/entypo'
import { Backspace } from 'styled-icons/fluentui-system-filled'
import { DeleteSweep } from 'styled-icons/material'
import { Send } from 'styled-icons/boxicons-solid'
import toast from 'react-hot-toast'
import { useSupabase } from '../../contexts/supabase'

function cursor() {
  return keyframes`
    0% {
      opacity: 0;
    }
    40% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  `
}

const StyledTitle = styled.h1`
  grid-area: title;
  display: flex;
`
const StyledLink = styled(Link) <{
  color?: keyof DefaultTheme['colors']
}>`
  color: ${({ theme, color }) => theme.colors[color || 'text']};
  padding-right: 24px;
  text-decoration: none;
`
const RoomInfo = styled.div`
  grid-area: room-info;
  font-size: 15px;
`
const RoomCode = styled.button`
  color: ${({ theme }) => theme.colors.text};
  border: currentColor dashed 1px;
  background-color: transparent;
  outline: none;
  cursor: pointer;
  font-size: 14px;
  margin: 12px;
`
const Score = styled.sub<{ score?: number }>`
  font-size: 12px;
  color: ${({ theme, score }) => score === 0 ? theme.colors.text : theme.colors.primary};
`

const GuessInputWrapper = styled.div`
  grid-area: guess;
  width: 100%;
  text-align: center;
`
const GuessInput = styled.div<{
  isEmpty: boolean
  isPlaceholder?: boolean
}>`
  text-transform: uppercase;
  display: inline-flex;
  flex-wrap: wrap;
  position: relative;
  font-size: 28px;
  max-width: 100%;
  &::after {
    content: "";
    display: block;
    position: absolute;
    top: 1px;
    width: 2px;
    height: 1.25em;
    background: ${({ theme }) => theme.colors.primary};
    animation: ${cursor} 1.4s infinite;
    right: -4px;
  }
  .required-letter {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 600;
  }
  ${({ isPlaceholder }) => isPlaceholder
    ? `
      color: dimgray !important;
      text-transform: unset;
      &::after {
        left: 0;
      }
    `
    : `letter-spacing: 3px;`
  }
`
const RoomContainer = styled.div`
  display: grid;
  grid-template-rows: 1fr 1fr auto 1fr;
  grid-template-areas: 
    "title"
    "room-info"
    "gameboard"
    "guessed";
  height: 100vh;
  @media (min-width: 660px) {
    grid-template-areas:
    "room-info gameboard"
    "guessed gameboard"
    "guessed gameboard"
    "guessed gameboard"
    "guessed gameboard";
  }
  @media (min-width: 900px) { 
    margin: 0 auto;
    max-width: 1200px;
    grid-template-areas:
      "title gameboard"
      "room-info gameboard"
      "guessed gameboard"
      "guessed gameboard"
      "guessed gameboard";
    justify-items: start;
    align-items: start;
  }
`
const GameBoard = styled.div`
  grid-area: gameboard;
  display: grid;
   grid-template-columns: auto auto auto auto auto;
  grid-template-rows: 50px 50px 1fr 10px;
  gap: 4px 16px;
  align-items: start;
  font-size: 18px;
  justify-content: center;

  grid-template-areas:
    "guess   guess   guess  delete"
    "letters letters letters ."
    "letters letters letters ."
    "shuffle .       reset   submit";

`
const ActionButton = styled.button<{ gridArea?: string }>`
  unset: all;
  color: ${({ theme }) => theme.colors.text};
  ${({ gridArea }) => gridArea && `grid-area: ${gridArea};`}
  ${({ gridArea, theme }) => gridArea !== 'submit'
    ? `
      background-color: transparent;
      border: none;
    `
    : ` color: ${theme.colors.background};`
  }
  border-color: transparent;
  padding: 4px 8px;
  font-size: 16px;
  font-weight: 600;
  user-select: none;
  cursor: pointer;
  &[type="reset"] {
    grid-area: reset;
  }
  svg {
    width: 34px;
  }
  span.label {
    display: none
  }
  @media (min-width: 768px) {
    span.label {
      display: inline;
      + svg {
        display: none;
      }
    }
  }
`
const GuessedWords = styled.div`
  grid-area: guessed;
  text-align: left;
`
const GuessedWordList = styled.div`
  display: grid;
  auto-flow: column;
  column-gap: 18px;
  row-gap: 2px;
  grid-template-columns: auto auto auto auto;
  padding-top: 12px;
  margin-bottom: 16px;
`
const GuessedWord = styled.div<{ highlight?: boolean }>`
  width: auto;
  padding-right: 28px;
  ${({ highlight, theme }) => highlight && `
    color: ${theme.colors.primary};
    font-weight: 600;
  `}
`

function shuffle<T>(arr: T[]) {
  const newArr = [...arr]
  let currentIndex = newArr.length, randomIndex
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--;
    [newArr[currentIndex], newArr[randomIndex]] = [
      newArr[randomIndex], newArr[currentIndex]]
  }
  return newArr
}

// would be nice to make styled components `css`
const arrangements = [
  '',
  'pairs-3',
  'pairs-1',
  'pairs-2',
  'pairs-5',
  'pairs-4',
]

const ShuffleIcon = styled(Shuffle)`
  color: ${({ theme }) => theme.colors.text};
`
const ResetIcon = styled(DeleteSweep)`
  color: ${({ theme }) => theme.colors.text};
  padding: 4px;
`
const DeleteIcon = styled(Backspace)`
  color: ${({ theme }) => theme.colors.text};
`
const SubmitIcon = styled(Send)`
  color: ${({ theme }) => theme.colors.background};
  `
const GameRoom: React.FC = () => {
  //   const [_, params] = useRoute('/room/:code')
  const params = { code: 'DSHL' }
  const [tileOrder, setTileOrder] = useState([1, 2, 3, 4, 5, 6])
  const {
    game,
    guess,
    submitGuess,
    addLetter,
    hasStarted,
    removeLetter,
    users,
    usernames,
    clearGuess,
    myId,
  } = useGame(params?.code!)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [arrangement, setArrangement] = useState<number>(0)
  const nextArrangement = () => { setArrangement((arrangement + 1) % arrangements.length) }

  const shuffleTiles = () => {
    nextArrangement()
    setTileOrder(shuffle(tileOrder))
  }

  const highlightAnswers = !guess.length
    ? (selectedUserId ? users.get(selectedUserId)?.answers : null) || []
    : game?.guessed_answers?.filter(a => a.startsWith(guess)) || []

  // put highlighted answers first
  const displayAnswers = highlightAnswers.length
    ? [...game?.guessed_answers || []].sort((a, b) => {
      return highlightAnswers.includes(a)
        ? -1
        : (highlightAnswers.includes(b) ? 1 : a.localeCompare(b))
    })
    : [...game?.guessed_answers || []].sort()

  if (game) return <>
    <RoomContainer>
      <StyledTitle><StyledLink href='/'>hives</StyledLink></StyledTitle>
      <GameBoard>
        <GuessInputWrapper>
          <GuessInput isEmpty={guess === ''} isPlaceholder={!hasStarted}>

          </GuessInput>
        </GuessInputWrapper>
        <Honeycomb className={arrangements[arrangement]}>
        </Honeycomb>

        <ActionButton gridArea='delete' onClick={removeLetter}>
          <span className='label'>delete</span>
          <DeleteIcon />
        </ActionButton>
        <ActionButton type='reset' onClick={clearGuess}>
          <span className='label'>clear</span>
          <ResetIcon />
        </ActionButton>
        <ActionButton gridArea='shuffle' onClick={shuffleTiles}>
          <span className='label'>shuffle</span>
          <ShuffleIcon />
        </ActionButton>
        <ActionButton gridArea='submit' onClick={submitGuess}>
          <span className='label'>submit</span>
          <SubmitIcon />
        </ActionButton>
      </GameBoard>
      <RoomInfo>
        room code
        <RoomCode
          onClick={() => {
            toast('copied link to clipboard')
            navigator.clipboard.writeText(window.location.href)
          }}
        ><code><b>{game.room_code}</b></code>
        </RoomCode>
        {usernames.size > 0 && [...usernames.entries()]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([id, name]) =>
            <span
              key={name + id}
              style={{
                fontWeight: selectedUserId === id ? 'bold' : 'normal',
                marginLeft: 16,
                marginRight: 16,
                cursor: users.get(id)?.score ? 'pointer' : 'auto'
              }}
              onClick={users.get(id)?.score
                ? () => setSelectedUserId(selectedUserId !== id ? id : null)
                : undefined
              }
            >
              {[
                myId === id ? 'you' : undefined,
                name
              ].filter(Boolean).join(' ~ ')} <Score score={users.get(id)?.score || 0}>{users.get(id)?.score || 0}</Score>
            </span>
          )
        }
      </RoomInfo>
      <GuessedWords>
        <GuessedWordList>
          {
            displayAnswers.map((a, i) => (
              <GuessedWord
                key={i}
                highlight={highlightAnswers.includes(a)}
              >{a}</GuessedWord>
            ))
          }
        </GuessedWordList>

      </GuessedWords>
    </RoomContainer>
  </>
  else return <div>Loading...</div>
}

export default GameRoom
