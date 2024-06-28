import React from 'react';
import * as THREE from 'three';
import { DbRow, DbView } from '../contexts/supabase';


type Room = DbView<'room_with_puzzle'> 


interface HexagonalPrismProps {
  position: [number, number, number];
  depth: number;
  radius: number;
  letter: string;
}

const HexagonalPrism: React.FC<HexagonalPrismProps> = ({ position, depth, radius, letter }) => {
  const points = [];
  for (let i = 0; i < 6; i++) {
    points.push(
      new THREE.Vector2(
        radius * Math.cos((Math.PI / 3) * i),
        radius * Math.sin((Math.PI / 3) * i)
      )
    );
  }
  const shape = new THREE.Shape(points);
  const extrudeSettings = { depth, bevelEnabled: false };
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

  const material = new THREE.MeshStandardMaterial({ color: 'orange', flatShading: true });

  if (letter) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if(ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 256, 256);
        ctx.font = `${256 * 0.7}px Arial`;
        ctx.fillStyle = 'black';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText(letter, 128, 128);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16;
    material.alphaMap = texture;
    material.transparent = true;
  }

  return (
    <mesh position={position}>
      <primitive attach="geometry" object={geometry} />
      <primitive attach="material" object={material} />
    </mesh>
  );
};

interface HoneycombProps {
  position: [number, number, number];
  depth: number;
  radius: number;
  room: Room;
  onClick?: (code: string) => void;
}

const Honeycomb: React.FC<HoneycombProps> = ({ position, depth, radius, room, onClick }) => {
  const gap = radius / 2.8;

  const prisms = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (row === 2 && (!col || col === 2)) continue;
      const x = col * (radius * 1.5 + gap);
      const y = row * (radius * Math.sqrt(3) + gap) - (col % 2 === 0 ? 0 : (radius * Math.sqrt(3) + gap) / 2);
      prisms.push(
        <HexagonalPrism
          key={`${row}-${col}`}
          position={[x, y, 0]}
          radius={radius}
          depth={depth}
          letter={room?.puzzle && room.puzzle[row * 3 + col] || ''}
        />
      );
    }
  }
  
  return (
    <group position={position} onClick={() =>  room?.room_code && onClick ? onClick(room.room_code) : undefined}>
      {prisms}
    </group>
  );
};

interface HiveProps {
  depth: number;
  radius: number;
  rooms: Room[];
  rows?: number;
  cols?: number;
  onRoomClick: (code: string) => void;
}


const Hive: React.FC<HiveProps> = ({ depth, radius, rooms, rows, cols, onRoomClick }) => {
  const gap = radius / 2.8;
  const honeycombs = rooms.map((room, index) => {
    const row = Math.floor(index / (rows || 3));
    const col = index % (cols || 3);
   const x = col * (radius * 1.5 + gap);
   const y = row * (radius * Math.sqrt(3) + gap) - (col % 2 === 0 ? 0 : (radius * Math.sqrt(3) + gap) / 2);
    return (
      <Honeycomb
        key={room.room_code}
        position={[x, y, 0]}
        radius={radius}
        depth={depth}
        room={room}
        onClick={() => room?.room_code && onRoomClick(room.room_code)}
      />
    );
  });

  return <>{honeycombs}</>;
};

export { HexagonalPrism, Honeycomb, Hive };
