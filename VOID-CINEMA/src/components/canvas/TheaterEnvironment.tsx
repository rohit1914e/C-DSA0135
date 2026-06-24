import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';
import { Seat } from '../../models/Seat';

// --- Shared Local State for High-Performance Hover ---
// We avoid React state for hovered seat to prevent re-rendering all 200+ seats on every mouse move.
export const theaterState = {
  hoveredSeatId: null as string | null,
  hoveredSeatPos: null as THREE.Vector3 | null,
};

// --- Helper to calculate seat rating ---
const calculateSeatRating = (x: number, y: number, z: number): { distanceToScreen: number; viewingAngle: number; qualityScore: number; ratingCategory: 'BEST VIEW' | 'PREMIUM' | 'GOOD' | 'BUDGET'; color: string } => {
  const screenPos = new THREE.Vector3(0, 10, -30);
  const seatPos = new THREE.Vector3(x, y, z);
  const distanceToScreen = seatPos.distanceTo(screenPos);
  
  const dx = Math.abs(x);
  const dz = Math.abs(z - screenPos.z);
  const viewingAngle = (Math.atan2(dx, dz) * 180) / Math.PI;

  let score = 100;
  score -= Math.abs(distanceToScreen - 40) * 1.5; 
  score -= viewingAngle * 1.2; 
  
  // Boost the center middle rows for "BEST VIEW"
  if (distanceToScreen >= 35 && distanceToScreen <= 45 && viewingAngle <= 15) {
    score += 15;
  }

  score = Math.max(20, Math.min(100, score));
  
  let ratingCategory: 'BEST VIEW' | 'PREMIUM' | 'GOOD' | 'BUDGET';
  let color: string;

  if (score > 85) {
    ratingCategory = 'BEST VIEW';
    color = '#ffd700'; // Gold/Yellow for Best View
  } else if (score > 65) {
    ratingCategory = 'PREMIUM';
    color = '#00f3ff'; // Cyan
  } else if (score > 40) {
    ratingCategory = 'GOOD';
    color = '#bf00ff'; // Purple
  } else {
    ratingCategory = 'BUDGET';
    color = '#4b5563'; // Gray
  }

  return { distanceToScreen: Math.round(distanceToScreen), viewingAngle: Math.round(viewingAngle), qualityScore: Math.round(score), ratingCategory, color };
};

// --- Seat Mesh ---
const SeatMesh: React.FC<{ r: number; s: number; x: number; y: number; z: number; angle: number }> = ({ r, s, x, y, z, angle }) => {
  const [isHoveredReact, setIsHoveredReact] = useState(false);
  const setActivePOVSeat = useStore((state) => state.setActivePOVSeat);
  const activePOVSeat = useStore((state) => state.activePOVSeat);
  
  const seatPosVec = useMemo(() => new THREE.Vector3(x, y, z), [x, y, z]);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const armrestMatRef = useRef<THREE.MeshStandardMaterial>(null);

  const seatData = useMemo(() => {
    const metrics = calculateSeatRating(x, y, z);
    const rowChar = String.fromCharCode(65 + r); 
    
    let category: 'VIP' | 'PREMIUM' | 'REGULAR' | 'BUDGET';
    if (metrics.ratingCategory === 'BEST VIEW' || metrics.ratingCategory === 'PREMIUM') category = 'VIP';
    else if (metrics.ratingCategory === 'GOOD') category = 'REGULAR';
    else category = 'BUDGET';

    return new Seat(
      `${rowChar}${s}`,
      rowChar,
      s,
      category,
      250, // dummy price for 3D environment
      metrics.qualityScore,
      metrics.viewingAngle,
      metrics.distanceToScreen,
      false,
      [x, y, z],
      metrics.color,
      metrics.ratingCategory,
      'available'
    );
  }, [r, s, x, y, z]);

  const isPOV = activePOVSeat?.id === seatData.id;
  const baseColor = new THREE.Color('#161622');
  const povColor = new THREE.Color(seatData.color);

  useFrame((_state, delta) => {
    if (!materialRef.current || !armrestMatRef.current) return;

    let targetColor = baseColor;
    let targetRoughness = 0.9;
    let targetEmissive = new THREE.Color('#000000');
    let targetEmissiveIntensity = 0;

    const isHoveredGlobally = theaterState.hoveredSeatId === seatData.id;
    const hasGlobalHover = theaterState.hoveredSeatId !== null;

    if (isPOV || isHoveredGlobally) {
      targetColor = povColor;
      targetRoughness = 0.4;
      targetEmissive = povColor;
      targetEmissiveIntensity = 0.2;
    } else if (hasGlobalHover && theaterState.hoveredSeatPos) {
      // Darken based on distance to hovered seat
      const dist = seatPosVec.distanceTo(theaterState.hoveredSeatPos);
      if (dist < 5) {
        targetColor = new THREE.Color('#0a0a14'); // slightly dark
      } else {
        targetColor = new THREE.Color('#030308'); // very dark
      }
    }

    materialRef.current.color.lerp(targetColor, delta * 5);
    materialRef.current.roughness = THREE.MathUtils.lerp(materialRef.current.roughness, targetRoughness, delta * 5);
    materialRef.current.emissive.lerp(targetEmissive, delta * 5);
    materialRef.current.emissiveIntensity = THREE.MathUtils.lerp(materialRef.current.emissiveIntensity, targetEmissiveIntensity, delta * 5);
    
    // Armrests stay metallic but dim
    armrestMatRef.current.color.lerp(targetColor.clone().multiplyScalar(0.5), delta * 5);
  });

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
        setIsHoveredReact(true);
        theaterState.hoveredSeatId = seatData.id;
        theaterState.hoveredSeatPos = seatPosVec;
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setIsHoveredReact(false);
        if (theaterState.hoveredSeatId === seatData.id) {
          theaterState.hoveredSeatId = null;
          theaterState.hoveredSeatPos = null;
        }
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Premium Seat Geometry */}
      {/* Base/Cushion */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[1.3, 0.5, 1.4]} />
        <meshStandardMaterial ref={materialRef} roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Backrest (curved slightly backward) */}
      <mesh position={[0, 1.6, 0.6]} rotation={[-0.15, 0, 0]}>
        <boxGeometry args={[1.3, 2.2, 0.4]} />
        <meshStandardMaterial color="#161622" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Left Armrest */}
      <mesh position={[-0.75, 1.1, 0]}>
        <boxGeometry args={[0.25, 0.2, 1.6]} />
        <meshStandardMaterial ref={armrestMatRef} roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Right Armrest */}
      <mesh position={[0.75, 1.1, 0]}>
        <boxGeometry args={[0.25, 0.2, 1.6]} />
        <meshStandardMaterial roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Metallic Base Stand */}
      <mesh position={[0, 0.15, 0.2]}>
        <cylinderGeometry args={[0.3, 0.4, 0.3, 16]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.5} metalness={0.8} />
      </mesh>

      {/* Row Letter Indicator on outer seats */}
      {(s === 1 || s === 24) && (
        <group position={[s === 1 ? -0.9 : 0.9, 0.5, 0.7]} rotation={[0, s === 1 ? -Math.PI/2 : Math.PI/2, 0]}>
          <mesh>
            <planeGeometry args={[0.3, 0.3]} />
            <meshBasicMaterial color="#000" />
          </mesh>
          <pointLight color="#00f3ff" intensity={0.2} distance={1} position={[0, 0, 0.1]} />
        </group>
      )}

      {/* Holographic Analysis Panel on Hover */}
      {isHoveredReact && !isPOV && (
        <Html position={[0, 3.5, 0]} center zIndexRange={[100, 0]} className="pointer-events-none">
          <div className="glass-panel-neon p-4 w-56 backdrop-blur-xl border border-white/20 bg-black/80 relative overflow-hidden" style={{ borderColor: seatData.color }}>
            <div className="absolute top-0 left-0 w-full h-[2px]" style={{ backgroundColor: seatData.color, boxShadow: `0 0 15px ${seatData.color}` }}></div>
            
            <div className="flex justify-between items-end mb-3 border-b border-white/10 pb-2">
              <span className="text-3xl font-black text-white tracking-wider">{seatData.id}</span>
              <span className="text-[10px] font-mono tracking-widest px-2 py-1 rounded-full border bg-white/5 uppercase" style={{ borderColor: seatData.color, color: seatData.color }}>
                {seatData.ratingCategory}
              </span>
            </div>
            
            <div className="space-y-2 text-xs font-mono text-gray-300">
              <div className="flex justify-between">
                <span>DISTANCE</span>
                <span className="text-white font-bold">{seatData.distanceToScreen}m</span>
              </div>
              <div className="flex justify-between">
                <span>VIEW ANGLE</span>
                <span className="text-white font-bold">{seatData.viewingAngle}°</span>
              </div>
              <div className="flex justify-between mt-2 pt-2 border-t border-white/5">
                <span>IMMERSION</span>
                <span className="font-black" style={{ color: seatData.color }}>{seatData.qualityScore}%</span>
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

// --- Procedural Seats Generator ---
const Seats: React.FC = () => {
  // Removed unused themeColor

  const rows = 14;
  const seatsPerRow = 24;
  const aisleWidth = 4;
  
  const seatGeometries = useMemo(() => {
    const elements = [];
    for (let r = 0; r < rows; r++) {
      // Curve the rows slightly based on distance to screen
      const radius = 45 + r * 3.5;
      const angleStep = 0.06;
      const totalAngle = seatsPerRow * angleStep;
      
      for (let s = 1; s <= seatsPerRow; s++) {
        // Skip middle seats for an aisle
        if (s === 12 || s === 13) continue;
        
        // Calculate angle and apply slight inward angling for outer seats
        const angleFromCenter = -totalAngle / 2 + s * angleStep;
        
        const x = Math.sin(angleFromCenter) * radius;
        const z = Math.cos(angleFromCenter) * radius - 35; // Push back from origin
        
        // Tiered seating calculation (steeper at the back)
        const y = Math.pow(r, 1.2) * 1.2 - 5; 
        
        // Seats face the screen, outer seats angle in more
        const seatRotation = angleFromCenter * 0.8;
        
        elements.push(<SeatMesh key={`${r}-${s}`} r={r} s={s} x={x} y={y} z={z} angle={seatRotation} />);
      }
    }
    return elements;
  }, []);

  // Premium Aisle lighting
  const aisles = useMemo(() => {
    const lights = [];
    for (let r = 0; r < rows; r++) {
      const radius = 45 + r * 3.5;
      const z = Math.cos(0) * radius - 35;
      const y = Math.pow(r, 1.2) * 1.2 - 5; 
      
      lights.push(
        <group key={`aisle-${r}`} position={[0, y, z]}>
          {/* Left stair step light */}
          <mesh position={[-aisleWidth / 2 + 0.8, 0.05, 0]}>
            <boxGeometry args={[0.8, 0.05, 0.1]} />
            <meshBasicMaterial color="#00f3ff" transparent opacity={0.8} />
          </mesh>
          <pointLight position={[-aisleWidth / 2 + 0.8, 0.2, 0]} color="#00f3ff" intensity={0.2} distance={2} />
          
          {/* Right stair step light */}
          <mesh position={[aisleWidth / 2 - 0.8, 0.05, 0]}>
            <boxGeometry args={[0.8, 0.05, 0.1]} />
            <meshBasicMaterial color="#00f3ff" transparent opacity={0.8} />
          </mesh>
          <pointLight position={[aisleWidth / 2 - 0.8, 0.2, 0]} color="#00f3ff" intensity={0.2} distance={2} />
        </group>
      );
    }
    return lights;
  }, []);

  return (
    <group>
      {seatGeometries}
      {aisles}
    </group>
  );
};

// --- Cinema Architecture (Walls, Ceiling, Floor) ---
const CinemaArchitecture: React.FC = () => {
  return (
    <group>
      {/* Main Floor / Tiers base */}
      <mesh position={[0, -5.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[120, 150]} />
        <meshStandardMaterial color="#020203" roughness={1} metalness={0} />
      </mesh>

      {/* Side Walls with Acoustic Panels */}
      {[-40, 40].map((x, i) => (
        <group key={`wall-${i}`} position={[x, 15, 0]} rotation={[0, i === 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
          <mesh>
            <planeGeometry args={[150, 50]} />
            <meshStandardMaterial color="#050508" roughness={0.9} />
          </mesh>
          {/* Acoustic panel ridges */}
          {[...Array(15)].map((_, j) => (
            <mesh key={`panel-${j}`} position={[j * 10 - 70, 0, 0.5]}>
              <boxGeometry args={[2, 40, 1]} />
              <meshStandardMaterial color="#0a0a0f" roughness={1} />
            </mesh>
          ))}
          {/* Wall Sconce Lights */}
          {[...Array(5)].map((_, j) => (
            <group key={`sconce-${j}`} position={[j * 30 - 60, -5, 1]}>
              <mesh>
                <boxGeometry args={[0.5, 2, 0.2]} />
                <meshBasicMaterial color="#bf00ff" />
              </mesh>
              <pointLight color="#bf00ff" intensity={0.5} distance={15} />
            </group>
          ))}
        </group>
      ))}

      {/* Structured Ceiling */}
      <mesh position={[0, 40, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[80, 150]} />
        <meshStandardMaterial color="#020202" roughness={0.6} metalness={0.4} />
      </mesh>

      {/* Ceiling Beams / Baffles */}
      {[...Array(8)].map((_, i) => (
        <mesh key={`beam-${i}`} position={[0, 39, i * 15 - 40]}>
          <boxGeometry args={[80, 2, 1]} />
          <meshStandardMaterial color="#050505" roughness={0.9} />
        </mesh>
      ))}

      {/* Back Wall (Projection Booth) */}
      <group position={[0, 15, 60]}>
        <mesh>
          <planeGeometry args={[80, 50]} />
          <meshStandardMaterial color="#020202" />
        </mesh>
        {/* Projector Window */}
        <mesh position={[0, 5, 0.1]}>
          <planeGeometry args={[4, 1.5]} />
          <meshBasicMaterial color="#00f3ff" />
        </mesh>
      </group>
    </group>
  );
};

// --- Screen and Fake Volumetrics ---
const CinemaScreenAndVolumetrics: React.FC = () => {
  const selectedMovie = useStore((state) => state.selectedMovie);
  const themeColor = selectedMovie ? 
    (selectedMovie.id === 'interstellar' ? '#00f3ff' : 
     selectedMovie.id === 'kanguva' ? '#ff9900' : 
     selectedMovie.id === 'spiderman-bnd' ? '#ff0055' : '#bf00ff') : 
    '#00f3ff';

  const screenMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const beamMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const ceilingReflectorRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    // Dynamic cinematic lighting using noise/time to fake audio-reactivity
    const time = state.clock.elapsedTime;
    const flicker = Math.sin(time * 8) * 0.1 + Math.sin(time * 3.4) * 0.2 + Math.cos(time * 1.2) * 0.3;
    const baseIntensity = 1.8;
    const intensity = Math.max(0.5, baseIntensity + flicker);

    if (screenMatRef.current) {
      screenMatRef.current.emissiveIntensity = intensity;
    }
    if (beamMatRef.current) {
      beamMatRef.current.opacity = 0.08 + flicker * 0.02;
    }
    if (ceilingReflectorRef.current) {
      ceilingReflectorRef.current.intensity = intensity * 1.5;
    }
  });

  return (
    <group position={[0, 12, -35]}>
      {/* Massive Curved Screen */}
      <mesh>
        <cylinderGeometry args={[50, 50, 35, 32, 1, true, -Math.PI/6, Math.PI/3]} />
        <meshStandardMaterial 
          ref={screenMatRef}
          color="#000000" 
          emissive={themeColor}
          emissiveIntensity={1.8}
          roughness={0.2}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Screen Frame Border */}
      <mesh position={[0, 0, -1]}>
        <cylinderGeometry args={[51, 51, 37, 32, 1, true, -Math.PI/5.8, Math.PI/2.9]} />
        <meshStandardMaterial color="#000" roughness={1} side={THREE.DoubleSide} />
      </mesh>

      {/* Bounced Screen Light (illuminates the room) */}
      <pointLight ref={ceilingReflectorRef} color={themeColor} intensity={3} distance={100} position={[0, 10, 20]} />
      <rectAreaLight width={80} height={40} color={themeColor} intensity={2.0} position={[0, 0, 5]} lookAt={[0, 0, 0]} />

      {/* Volumetric Light Cone from Projector */}
      <mesh position={[0, 8, 47]} rotation={[-0.1, 0, 0]}>
        <coneGeometry args={[45, 95, 32, 1, true]} />
        <meshBasicMaterial 
          ref={beamMatRef}
          color={themeColor} 
          transparent 
          opacity={0.08} 
          blending={THREE.AdditiveBlending} 
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

// --- Subtle Atmospheric Particles ---
const DustParticles: React.FC = () => {
  const count = 500;
  const meshRef = useRef<THREE.Points>(null);

  const [positions, scales] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const scl = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Focus particles within the light cone volume
      pos[i * 3] = (Math.random() - 0.5) * 60;     // x
      pos[i * 3 + 1] = Math.random() * 30;         // y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 80; // z
      scl[i] = Math.random();
    }
    return [pos, scl];
  }, [count]);

  useFrame((_state, delta) => {
    if (meshRef.current) {
      meshRef.current.position.y += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.02;
      if (meshRef.current.position.y > 10) {
        meshRef.current.position.y = -5;
      }
    }
  });

  return (
    <points ref={meshRef} position={[0, 0, 0]}>
      <bufferGeometry>
        {/* @ts-ignore */}
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        {/* @ts-ignore */}
        <bufferAttribute attach="attributes-size" count={count} array={scales} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial size={0.1} color="#ffffff" transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
};

const TheaterEnvironment: React.FC = () => {
  const activeSector = useStore((state) => state.activeSector);
  const isEnteringTheater = useStore((state) => state.isEnteringTheater);

  // Only render if we are in the theater or currently transitioning into it
  if (activeSector !== 'theater' && !isEnteringTheater) return null;

  return (
    <group>
      <ambientLight intensity={0.02} />
      <CinemaArchitecture />
      <CinemaScreenAndVolumetrics />
      <Seats />
      <DustParticles />
    </group>
  );
};

export default TheaterEnvironment;
