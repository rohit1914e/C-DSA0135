import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';
import type { Seat } from '../../store/useStore';

// Helper to calculate seat rating
const calculateSeatRating = (x: number, y: number, z: number): Omit<Seat, 'id' | 'row' | 'number' | 'position' | 'status'> => {
  const screenPos = new THREE.Vector3(0, 10, -30);
  const seatPos = new THREE.Vector3(x, y, z);
  const distanceToScreen = seatPos.distanceTo(screenPos);
  
  // Calculate horizontal viewing angle in degrees (0 is straight on)
  const dx = Math.abs(x);
  const dz = Math.abs(z - screenPos.z);
  const viewingAngle = (Math.atan2(dx, dz) * 180) / Math.PI;

  let score = 100;
  score -= Math.abs(distanceToScreen - 40) * 1.5; // Ideal distance is ~40
  score -= viewingAngle * 1.2; // Penalize extreme angles
  
  let ratingCategory: 'BEST VIEW' | 'PREMIUM' | 'GOOD' | 'BUDGET';
  let color: string;

  if (score > 85) {
    ratingCategory = 'BEST VIEW';
    color = '#00f3ff'; // Cyan
  } else if (score > 65) {
    ratingCategory = 'PREMIUM';
    color = '#bf00ff'; // Purple
  } else if (score > 40) {
    ratingCategory = 'GOOD';
    color = '#ffffff'; // White
  } else {
    ratingCategory = 'BUDGET';
    color = '#888888'; // Gray
  }

  return { distanceToScreen: Math.round(distanceToScreen), viewingAngle: Math.round(viewingAngle), qualityScore: Math.round(score), ratingCategory, color };
};

const SeatMesh: React.FC<{ r: number; s: number; x: number; y: number; z: number; angle: number }> = ({ r, s, x, y, z, angle }) => {
  const [hovered, setHovered] = useState(false);
  const setActivePOVSeat = useStore((state) => state.setActivePOVSeat);
  const activePOVSeat = useStore((state) => state.activePOVSeat);
  
  const seatData = useMemo(() => {
    const metrics = calculateSeatRating(x, y, z);
    const rowChar = String.fromCharCode(65 + r); // A, B, C...
    return {
      id: `${rowChar}${s}`,
      row: rowChar,
      number: s,
      position: [x, y, z] as [number, number, number],
      status: 'available' as const,
      ...metrics
    };
  }, [r, s, x, y, z]);

  const isPOV = activePOVSeat?.id === seatData.id;

  return (
    <group 
      position={[x, y, z]} 
      rotation={[0, angle, 0]}
      onClick={(e) => {
        e.stopPropagation();
        setActivePOVSeat(seatData);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Holographic Outline on Hover/POV */}
      {(hovered || isPOV) && (
        <mesh position={[0, 1.0, 0]}>
          <boxGeometry args={[1.5, 2.5, 1.5]} />
          <meshBasicMaterial color={seatData.color} wireframe transparent opacity={0.5} />
        </mesh>
      )}

      {/* Seat Geometry */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.2, 0.4, 1.2]} />
        <meshStandardMaterial color={hovered ? seatData.color : "#1a1a2e"} roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh position={[0, 1.5, 0.5]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[1.2, 2.0, 0.3]} />
        <meshStandardMaterial color={hovered ? seatData.color : "#1a1a2e"} roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh position={[-0.7, 1.0, 0]}>
        <boxGeometry args={[0.2, 0.2, 1.4]} />
        <meshStandardMaterial color="#2a2a4e" roughness={0.5} metalness={0.5} />
      </mesh>
      <mesh position={[0.7, 1.0, 0]}>
        <boxGeometry args={[0.2, 0.2, 1.4]} />
        <meshStandardMaterial color="#2a2a4e" roughness={0.5} metalness={0.5} />
      </mesh>

      {/* Subtle glow underneath */}
      <pointLight position={[0, 0.2, 0]} color={seatData.color} intensity={0.2} distance={2} />

      {/* Holographic Analysis Panel on Hover */}
      {hovered && !isPOV && (
        <Html position={[0, 3, 0]} center zIndexRange={[100, 0]} className="pointer-events-none">
          <div className="glass-panel-neon p-4 w-48 backdrop-blur-xl border border-white/20 bg-black/60 relative overflow-hidden" style={{ borderColor: seatData.color }}>
            <div className="absolute top-0 left-0 w-full h-[2px]" style={{ backgroundColor: seatData.color, boxShadow: `0 0 10px ${seatData.color}` }}></div>
            
            <div className="flex justify-between items-end mb-3 border-b border-white/10 pb-2">
              <span className="text-2xl font-black text-white">{seatData.id}</span>
              <span className="text-[10px] font-mono tracking-widest px-2 py-1 rounded-full border bg-white/5 uppercase" style={{ borderColor: seatData.color, color: seatData.color }}>
                {seatData.ratingCategory}
              </span>
            </div>
            
            <div className="space-y-2 text-xs font-mono text-gray-300">
              <div className="flex justify-between">
                <span>DISTANCE</span>
                <span className="text-white">{seatData.distanceToScreen}m</span>
              </div>
              <div className="flex justify-between">
                <span>VIEW ANGLE</span>
                <span className="text-white">{seatData.viewingAngle}°</span>
              </div>
              <div className="flex justify-between">
                <span>SCORE</span>
                <span style={{ color: seatData.color }}>{seatData.qualityScore}</span>
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

// Procedural Seats Generator
const Seats: React.FC = () => {
  const selectedMovie = useStore((state) => state.selectedMovie);
  const themeColor = selectedMovie ? 
    (selectedMovie.id === 'neon-horizon' ? '#00f3ff' : selectedMovie.id === 'void-beyond' ? '#bf00ff' : '#ff0055') : 
    '#00f3ff';

  const rows = 12;
  const seatsPerRow = 24;
  const aisleWidth = 3;
  
  const seatGeometries = useMemo(() => {
    const elements = [];
    for (let r = 0; r < rows; r++) {
      // Curve the rows slightly
      const radius = 30 + r * 3;
      const angleStep = 0.08;
      const totalAngle = seatsPerRow * angleStep;
      
      for (let s = 0; s < seatsPerRow; s++) {
        // Skip middle seats for an aisle
        if (s === seatsPerRow / 2 || s === seatsPerRow / 2 - 1) continue;
        
        const angle = -totalAngle / 2 + s * angleStep;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius - 20; // Offset from origin
        const y = r * 1.5 - 5; // Tiered height
        
        elements.push(<SeatMesh key={`${r}-${s}`} r={r} s={s} x={x} y={y} z={z} angle={angle} />);
      }
    }
    return elements;
  }, []);

  // Aisle lighting
  const aisles = useMemo(() => {
    const lights = [];
    for (let r = 0; r < rows; r++) {
      const radius = 30 + r * 3;
      const z = Math.cos(0) * radius - 20;
      const y = r * 1.5 - 5;
      
      lights.push(
        <group key={`aisle-${r}`} position={[0, y, z]}>
          {/* Left stair glow */}
          <mesh position={[-aisleWidth / 2 + 0.5, 0.1, 0]}>
            <boxGeometry args={[0.2, 0.1, 2]} />
            <meshBasicMaterial color={themeColor} transparent opacity={0.6} />
          </mesh>
          <pointLight position={[-aisleWidth / 2 + 0.5, 0.5, 0]} color={themeColor} intensity={0.5} distance={3} />
          
          {/* Right stair glow */}
          <mesh position={[aisleWidth / 2 - 0.5, 0.1, 0]}>
            <boxGeometry args={[0.2, 0.1, 2]} />
            <meshBasicMaterial color={themeColor} transparent opacity={0.6} />
          </mesh>
          <pointLight position={[aisleWidth / 2 - 0.5, 0.5, 0]} color={themeColor} intensity={0.5} distance={3} />
        </group>
      );
    }
    return lights;
  }, [themeColor]);

  return (
    <group>
      {seatGeometries}
      {aisles}
    </group>
  );
};

// Procedural Volumetric Lights
const VolumetricRays: React.FC = () => {
  const selectedMovie = useStore((state) => state.selectedMovie);
  const themeColor = selectedMovie ? 
    (selectedMovie.id === 'neon-horizon' ? '#00f3ff' : selectedMovie.id === 'void-beyond' ? '#bf00ff' : '#ff0055') : 
    '#00f3ff';

  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Subtle flickering to simulate a movie playing
      const material = meshRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.15 + Math.sin(state.clock.elapsedTime * 10) * 0.05;
    }
  });

  return (
    <group position={[0, 20, 40]} rotation={[-0.3, 0, 0]}>
      {/* Projection beams originating from the back booth hitting the screen */}
      <mesh ref={meshRef}>
        <cylinderGeometry args={[40, 2, 80, 32, 1, true]} />
        <meshBasicMaterial 
          color={themeColor} 
          transparent 
          opacity={0.15} 
          blending={THREE.AdditiveBlending} 
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

// The Massive Cinema Screen
const CinemaScreen: React.FC = () => {
  const selectedMovie = useStore((state) => state.selectedMovie);
  const themeColor = selectedMovie ? 
    (selectedMovie.id === 'neon-horizon' ? '#00f3ff' : selectedMovie.id === 'void-beyond' ? '#bf00ff' : '#ff0055') : 
    '#ffffff';

  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      // Simulate audio-reactive or dynamic movie lighting on the screen
      const intensity = 2.0 + Math.sin(state.clock.elapsedTime * 3) * 0.5 + Math.random() * 0.2;
      materialRef.current.emissiveIntensity = intensity;
    }
  });

  return (
    <group position={[0, 10, -30]}>
      {/* Screen Mesh */}
      <mesh>
        <planeGeometry args={[80, 40, 32, 32]} />
        {/* Make the screen curved */}
        <meshStandardMaterial 
          ref={materialRef}
          color="#000000" 
          emissive={themeColor}
          emissiveIntensity={2.0}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
      
      {/* Intense light bouncing off the screen into the room */}
      <pointLight color={themeColor} intensity={5} distance={100} position={[0, 0, 10]} />
      <rectAreaLight width={80} height={40} color={themeColor} intensity={2.0} position={[0, 0, 1]} lookAt={[0, 0, 0]} />
    </group>
  );
};

const TheaterEnvironment: React.FC = () => {
  const activeSector = useStore((state) => state.activeSector);
  const isEnteringTheater = useStore((state) => state.isEnteringTheater);

  // Only render if we are in the theater or currently transitioning into it
  if (activeSector !== 'theater' && !isEnteringTheater) return null;

  return (
    <group>
      {/* Ambient Theater Lighting */}
      <ambientLight intensity={0.05} />
      
      {/* Structural Room Elements */}
      <mesh position={[0, 30, 0]}>
        {/* Ceiling */}
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#050505" roughness={0.9} />
      </mesh>
      <mesh position={[0, -10, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {/* Floor */}
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#020202" roughness={0.8} metalness={0.2} />
      </mesh>

      <CinemaScreen />
      <Seats />
      <VolumetricRays />
    </group>
  );
};

export default TheaterEnvironment;
