// GameRoomExperiment.tsx
import React, { useState } from 'react';
import styled from 'styled-components';

const side = 100;
const padding = 12;

const height = side * Math.sqrt(3);
const pSide = side + (padding);
const pHeight = (pSide) * Math.sqrt(3) ;

const HexButton = styled.button<{ color?: string }>`
  border: unset;
  width: ${side * 2}px;
  height: ${height}px;
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
  background-color: ${({ color }) => color || 'dimgray'};
`;

const Honeycomb = styled.div`
  position: relative;
  width: ${pSide * 5}px;
  height: ${pHeight * 3}px;

  > * {
    position: absolute;
    top: ${pHeight}px;
    left: ${pSide * 1.5}px;
    transition: all .24s ease-out;
  }
  > *:nth-child(8) {
    width: ${pSide * 2}px;
    height: ${pHeight}px;
    z-index: -1;
    position: absolute;
    clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
    transform: translate(-${padding}px, -${padding}px);

    background-color: dimgray;
  }
  > *:nth-child(2) {
    transform: translateY(-${pHeight}px);
  }
  > *:nth-child(3) {
    transform: translate(${pSide * 1.5}px, -${pHeight / 2}px);
  }
  > *:nth-child(4) {
    transform: translate(${pSide * 1.5}px, ${pHeight / 2}px);
  }
  > *:nth-child(5) {
    transform: translateY(${pHeight}px);
  }
  > *:nth-child(6) {
    transform: translate(-${pSide * 1.5}px, ${pHeight / 2}px);
  }
  > *:nth-child(7) {
    transform: translate(-${pSide * 1.5}px, -${pHeight / 2}px);
  }

  &.stacked-2-3 {

  }

`;

const GameRoomExperiment: React.FC = () => {
  const [stacked, setStacked] = useState(false);

  const toggleStacked = () => {
    setStacked(!stacked);
  };

  return (
    <Honeycomb className={stacked ? 'stacked-2-3' : ''} onClick={toggleStacked}>
      <HexButton color='red' />
      <HexButton />
      <HexButton />
      <HexButton />
      <HexButton />
      <HexButton />
      <HexButton />
      <HexButton />
    </Honeycomb>
  )
}

export default GameRoomExperiment
