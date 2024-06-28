// GameRoom.tsx
import React, { ReactElement, SVGProps, useState } from 'react'
import { Link, useRoute } from 'wouter'
import useGame from '../hooks/useGame'
import HexButton, { Honeycomb } from './HexButton'
import styled, { keyframes } from 'styled-components'
import { toast } from 'react-hot-toast'
import { Backspace } from 'styled-icons/fluentui-system-filled'
import { Send } from 'styled-icons/boxicons-solid'
import { Shuffle } from 'styled-icons/icomoon'
import { useSupabase } from '../contexts/supabase'
import { Hive } from 'styled-icons/boxicons-regular'


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

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.colors.text} !important;
  margin-right: 18px;
`
const RoomContainer = styled.div`
  margin: 0 auto;
  width: 98vw;
  @media (min-width: 668px) { 
    max-width: 1200px;
    padding: 12px;
    max-height: 100dvh;
    display: grid;
    user-select: none;
    grid-template-columns: auto 1fr;
    grid-template-rows: 40px 58px 1fr;
    grid-template-areas:
      "title     title"
      "honeycomb   guess  "
      "honeycomb   guessed";
    gap: 36px 120px;
    align-items: start;
  }

`
const GuessInput = styled.div<{
  isEmpty: boolean
  isPlaceholder?: boolean
}>`
  font-family: ui-mono, monospace;
  text-transform: uppercase;
  display: inline-flex;
  flex-wrap: wrap;
  position: relative;
  font-size: 34px;
  color: ${({ theme }) => theme.colors.text};
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

  @media (min-width: 768px) {
    font-size: 34px;
  }
`
const TabButton = styled.button<{ active?: boolean }>`
  background-color: transparent;
  color: inherit;
  padding: 6px 16px;
  cursor: pointer;
  font-weight: 600;
  text-transform: uppercase;
  border: none;
  border-bottom: ${(props) => (props.active ? 'currentColor dashed 1px' : 'none')};
  margin-right: 18px;
`
const GuessedWords = styled.pre`
  grid-area: guessed;
  text-align: left;
`
const GuessedWordList = styled.div`
  margin-bottom: 18px;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  max-width: min(480px, 98vw);
  letter-spacing: 2px;

  @media (min-width: 1200px) {
    grid-template-columns: auto auto auto auto;
  }
`
const GuessedWord = styled.div<{ highlight?: boolean  }>`
  width: auto;
  padding-right: 24px;
  line-height: 1.5;
  ${({ highlight, theme }) => highlight && `
    color: ${theme.colors.primary};
    font-weight: 600;
  `}
`
const ShuffleIcon = styled(Shuffle)`
  color: ${({ theme }) => theme.colors.text};
`
const DeleteIcon = styled(Backspace)`
  color: ${({ theme }) => theme.colors.text};
`
const SubmitIcon = styled(Send)`
  color: ${({ theme }) => theme.colors.primary};
`
const ArrangeIcon = styled(Hive)`
  color: ${({ theme }) => theme.colors.text};
`
const Username = styled.div<{
  isMe?: boolean
  isSelectable?: boolean
  isSelected?: boolean
}>`
  margin-top: 8px;
  font-size: 18px;
  padding-left: 9px;

  ${({ isMe }) => isMe && `
    font-weight: 600;
  `}
  ${({ isSelectable }) => isSelectable && 'cursor: pointer;'}
  ${({ isSelected, theme }) => isSelected && `
    border-left: 4px solid ${theme.colors.primary};
    padding-left: 5px;
  `}
`
const Score = styled.sub<{ score?: number }>`
  padding-right: 12px;
  color: ${({ theme, score }) => score === 0 ? theme.colors.text : theme.colors.text};
  text-decoration: none;
`

function shuffle<T>(arr: T[]) {
  const newArr = [...arr]
  let currentIndex = newArr.length, randomIndex
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--;
    [newArr[currentIndex], newArr[randomIndex]] = [newArr[randomIndex], newArr[currentIndex]]
  }
  return newArr
}

const arrangements = [
  '',
  'arrangement-1',
  'arrangement-2',
  'arrangement-3',
  'arrangement-4',
  'arrangement-5',
]

const Hexagon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} {...props}>
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    >
      <path d="M15.73 16.875A2.225 2.225 90 0 1 13.782 18H6.498a2.225 2.225 0 0 1-1.948-1.158l-4.27-6.75a2.269 2.269 90 0 1 0-2.184l4.27-6.75A2.225 2.225 90 0 1 6.498 0h7.285c.809 0 1.554.443 1.947 1.158l3.98 6.75a2.33 2.33 90 0 1 0 2.25l-3.98 6.75v-.033z" />
      <path d="M10 16v-6a2 2 0 1 1 4 0v6m-4-3h4" />
    </g>
  </svg>
)



const GameRoom: React.FC = () => {
  const [_, params] = useRoute('/room/:code')
  const { username, setUsername } = useSupabase()
  const [tileOrder, setTileOrder] = useState([1, 2, 3, 4, 5, 6])
  const {
    game,
    guess,
    hasStarted,
    users,
    usernames,
    myId,
    submitGuess,
    addLetter,
    removeLetter
  } = useGame(params?.code!)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState(0)
  const [arrangement, setArrangement] = useState(0)
  const nextArrangement = () => { setArrangement((arrangement + 1) % arrangements.length) }
  const shuffleTiles = () => { setTileOrder(shuffle(tileOrder)) }

  const isHighlighted = (word: string) => {
    if (!guess.length) return selectedUserId
      ? users.get(selectedUserId)?.answers?.includes(word)
      : false
    else if (!activeTab) return word.startsWith(guess)
    const pattern = word
      .slice(0, guess.length)
      .split('')
      .map(l => l === '_' ? '.' : l)
      .join('')
    const regex = new RegExp(`^${pattern}`, 'i')
    return regex.test(guess)
  }

  const displayAnswers = (
    activeTab === 2
      ? [...game?.guessed_answers || []]
      : !activeTab ? [...game?.guessed_answers || []] : []
  ).sort()

  const getPuzzleLetter = (i: number) => {
    if (!game?.puzzle) return ''
    return game.puzzle[i]
  }
  const getScore = (id: string) => users.get(id)?.score || 0
  const firstLetter = getPuzzleLetter(0)



  if (game) return <>
    <RoomContainer>
      <div style={{ display: 'flex', alignItems: 'baseline', userSelect: 'none', justifyContent: 'space-between', gridArea: 'title' }}>
        <h1>
          <StyledLink href='/'>hives</StyledLink>
        </h1>
        <div>
          room code:
          <button
            style={{ marginLeft: 12, marginRight: 12, marginBottom: 18, backgroundColor: 'transparent', border: 'currentColor dashed 1px', color: 'inherit', cursor: 'pointer' }}
            onClick={() => {
              toast('copied link to clipboard')
              navigator.clipboard.writeText(window.location.href)
            }}
          >
            <code><b>{game.room_code}</b></code>
          </button>
        </div>
      </div>
      <div style={{ textAlign: 'center', gridArea: 'guess', margin: '8px 0 38spx', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 40, paddingLeft: 8 }}>
        <GuessInput isEmpty={guess === ''} isPlaceholder={!hasStarted}>
          {
            !hasStarted
              ? 'type or click'
              : guess.length && guess.split('').map((l, i) => l === firstLetter
                ? <span key={i} className="required-letter">{l}</span>
                : <span key={i + l}>{l}</span>
              ) || '\u200B'
          }
        </GuessInput>
        {guess.length > 0 &&
          <HexButton required onClick={removeLetter}>
            <DeleteIcon size={39} />
          </HexButton>
        }
      </div>

      <Honeycomb className={arrangements[arrangement]}>
        <HexButton
          required
          gridArea='hex1'
          onClick={() => game?.puzzle && addLetter(game.puzzle[0])}
        >{game?.puzzle && game.puzzle[0]}
        </HexButton>
        {tileOrder.map((o, i) =>
          <HexButton
            key={['tile', i].join('-')}
            gridArea={`hex${i + 2}`}
            onClick={() => game?.puzzle && addLetter(game.puzzle[o])}
          >{game?.puzzle && game.puzzle[o]}
          </HexButton>
        )}
        <HexButton required gridArea='shuffle' onClick={shuffleTiles}>
          <ShuffleIcon size={32} />
        </HexButton>
        <HexButton required gridArea='arrange' onClick={nextArrangement}>
          <ArrangeIcon size={44} />
        </HexButton>
        <HexButton required gridArea="submit" type="submit" onClick={submitGuess}>
          <SubmitIcon size={40} />
        </HexButton>
      </Honeycomb>

      <GuessedWords>
        {displayAnswers.length > 0 && <TabButton active>guessed</TabButton>}
        <GuessedWordList>
          {/* <Hexagon /> */}
          {displayAnswers.map((a, i) =>
            <GuessedWord
              key={i}
              highlight={isHighlighted(a)}
            >
              {a}
            </GuessedWord>
          )}
        </GuessedWordList>
        <div style={{ marginBottom: 18, fontSize: 18, fontWeight: 600 }}>
          {game?.guessed_answers?.length || 0}/{game.answer_count} words
        </div>
        <div>
          {usernames.size > 0 && [...usernames.entries()]
            .sort((a, b) => users.get(b[0])?.score! - users.get(a[0])?.score!)
            .map(([id, name]) => <>
              <Username
                key={name + id}
                isMe={id === myId}
                isSelectable={!!users.get(id)?.score || id === myId}
                isSelected={selectedUserId === id}
                onClick={users.get(id)?.score
                  ? () => setSelectedUserId(selectedUserId !== id ? id : null)
                  : undefined}
                onKeyDown={e => { e.stopPropagation() }}
              >
                <Score score={getScore(id)}>
                  {getScore(id)}
                </Score>
                {
                  myId === id
                    ? <input
                      style={{ maxWidth: 128, marginRight: 8, fontSize: 14, padding: 8, background: 'transparent', border: '1px solid currentColor', color: 'inherit', fontWeight: 600 }}
                      type='text'
                      value={username}
                      onChange={e => { setUsername(e.target.value) }}
                      onFocus={e => e.target.select()}
                    />
                    : name
                }
              </Username>
            </>
            )}
        </div>
      </GuessedWords>
    </RoomContainer>
  </>
  else return <div>Loading...</div>
}

export default GameRoom
