import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'wouter'
import { DbView, useSupabase } from '../contexts/supabase'
import styled, { DefaultTheme } from 'styled-components'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { PerspectiveCamera, RandomizedLight } from '@react-three/drei'


const StyledInput = styled.input`
  background-color: transparent;
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid currentColor;
  line-height: 50px;
  padding-left: 12px;
  margin-right: 12px;
  background-color: transparent;
  font-size: 22px;
  @media (max-width: 767px) {
    display: block;
    width: 100%;
    max-width: 90%;
    margin: 12px auto;
  }
`
const FilledButton = styled.button<{
  color?: keyof DefaultTheme['colors']
  textColor?: keyof DefaultTheme['colors']
}>`
  font-size: 24px;
  color: ${({ theme, textColor }) => theme.colors[textColor || 'background']};
  background-color: ${({ theme, color }) => theme.colors[color || 'primary']}};
  border: unset;
  font-weight: bold;
  padding: 10px 20px;
  @media (max-width: 767px) {
    display: block;
    width: 100%;
    max-width: 90%;
    margin: 12px auto;
  }
`
const SmallButton = styled(Link)`
  color: ${({ theme }) => theme.colors.background};
  background-color: ${({ theme }) => theme.colors.accent}};
  font-weight: 700;
  border: 1px solid currentColor;
  padding: 0px 10px;
  text-transform: uppercase;
  letter-spacing: 3px;
  line-height: 1.8;
  text-decoration: none;
  font-size: 18px;
  :first-letter {
    letter-spacing: 7px;
    font-weight: 900;
    font-size: 21px;
  }
`
const GameList = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  gap: 18px;
`


const Home: React.FC = () => {
  const [roomCode, setRoomCode] = useState('')
  const [, setLocation] = useLocation()
  const [rooms, setRooms] = useState<DbView<'room_with_puzzle'>[]>([])

  const { client: supabase } = useSupabase()

  const handleCreateRoom = async () => {
    const r = await supabase.from('rooms').insert({}).select().single()
    if (!r.error) setLocation(`/room/${r.data.room_code}`)
  }
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocation(`/room/${roomCode}`)
  }

  useEffect(() => {
    const fetchRooms = async () => {
      const r = await supabase
        .from('room_with_puzzle')
        .select()
        .order('updated_at', { ascending: false })
        .filter('score', 'gt', 0)
        .limit(24)

      if (r.error) return
      setRooms(r.data.sort(() => Math.random() - 0.5).slice(0, 4))
    }
    fetchRooms()
  }, [])


  interface HexagonalPrismProps {
    position: [number, number, number]
    depth: number
    radius: number
  }

  const towardsZero = (n: number, maxChange = .1, zeroThreshhold = .25) =>
    Math.abs(n) < zeroThreshhold ? 0 : n * (1 - Math.random() * maxChange)
  const towardsThreshold = (n: number, maxChange = .2, threshhold = Math.PI * 2, fuzz = .25) =>
    Math.abs(n - threshhold) < fuzz ? threshhold : n * 1 + Math.random() * maxChange

  const HexagonalPrism: React.FC<HexagonalPrismProps> = ({ position, depth, radius }) => {
    const points = []
    for (let i = 0; i < 6; i++)
      points.push(
        new THREE.Vector2(
          radius * Math.cos((Math.PI / 3) * i),
          radius * Math.sin((Math.PI / 3) * i)
        )
      )

    const geometry = new THREE.ExtrudeGeometry(new THREE.Shape(points), { depth, bevelEnabled: false })
    const meshEl = React.useRef<THREE.Mesh>(null)
    let prevTime = 0, currTime

    useFrame(({ clock }) => {
      if (!meshEl.current) return
      currTime = clock.getElapsedTime()
      if (currTime - prevTime < .9) meshEl.current.rotation.y = towardsThreshold(meshEl.current.rotation.y, .28)
      else if (currTime - prevTime < 5) meshEl.current.rotation.y = towardsThreshold(meshEl.current.rotation.y)
      else if (currTime - prevTime < 6) meshEl.current.rotation.y = towardsZero(meshEl.current.rotation.y, .12)
      else if (currTime - prevTime < 7.5) meshEl.current.rotation.y = towardsZero(meshEl.current.rotation.y, .058, .1)
      else if (currTime - prevTime > 9) prevTime = clock.getElapsedTime()
    })

    return (
      <mesh ref={meshEl} position={position} rotation-x={Math.PI * 0.1} rotation-y={Math.PI * Math.random() * 0.1}>
        <primitive attach="geometry" object={geometry} />
        <meshStandardMaterial color={new THREE.Color(0xE2B714)} flatShading />
      </mesh>
    )
  }


  const Honeycomb: React.FC<{
    depth: number
    radius: number
    gap?: number
  }> = ({
    depth,
    radius,
    gap = radius / 2.8,
  }) => {

      const prisms = []
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          // skip any corner hexagons and the middle
          const isCorner = row === 2 && (!col || col === 2)
          const isCenter = row === 1 && col === 1
          if (isCorner || isCenter) continue
          const x = col * (radius * 1.5 + gap)
          const y = row * (radius * Math.sqrt(3) + gap) - (col % 2 === 0 ? 0 : (radius * Math.sqrt(3) + gap) / 2)
          prisms.push(<HexagonalPrism key={`${row}-${col}`} position={[x, y, 0]} radius={radius} depth={depth} />)
        }
      }
      return <>{prisms}</>
    }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <h1 style={{ display: 'flex', alignItems: 'center' }}>
        <Canvas
          style={{ display: 'inline-block', width: 56, height: 80, zIndex: -1 }}
        >
          <PerspectiveCamera makeDefault position={[16, 6, 75]} fov={60} />
          <ambientLight intensity={.766} />
          <RandomizedLight
            intensity={0.9}
            position={[0, 0, 0]}
          />
          <pointLight position={[0, 0, -10]} intensity={0.5} />
          <pointLight position={[0, 0, 10]} intensity={0.5} />

          <Honeycomb depth={5} radius={8} />
        </Canvas>
        hives
      </h1>
      <p>
        Find as many words as you can. Longer words are worth more points.
        <br />  Words must be at least 4 letters long, and use the center letter.
      </p>
      <form style={{ marginTop: 28, marginBottom: 28 }} onSubmit={handleJoinRoom}>
        <label>
          if you have a room code, enter it here:
          <br />
          <StyledInput
            type='text'
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toLocaleUpperCase())}
          />
        </label>
        <FilledButton color='accent' type='submit'>join</FilledButton>
        <span style={{ padding: 12 }}> or </span>
        <FilledButton autoFocus onClick={handleCreateRoom}>
          start a new game
        </FilledButton>
      </form>

      or join one of these games: <GameList>
        {
          rooms.map((r, i) =>
            <SmallButton key={i} to={`/room/${r.room_code}`}>
              {r.puzzle}
            </SmallButton>
          )
        }
      </GameList>

    </div>
  )
}

export default Home
