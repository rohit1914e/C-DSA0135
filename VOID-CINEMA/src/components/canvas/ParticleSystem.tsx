import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ParticleSystem: React.FC = () => {
  const count = 2000;
  const meshRef = useRef<THREE.Points>(null);

  // Generate random positions for particles
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Spread them around
      pos[i * 3] = (Math.random() - 0.5) * 30;     // x
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30; // y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30; // z
      
      // Neon cyan / purple mix
      const isCyan = Math.random() > 0.5;
      const color = new THREE.Color(isCyan ? '#00f3ff' : '#bf00ff');
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }
    
    return [pos, col];
  }, [count]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      // Slowly rotate the entire particle system
      meshRef.current.rotation.y -= delta * 0.05;
      meshRef.current.rotation.x += delta * 0.02;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        {/* @ts-ignore */}
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        {/* @ts-ignore */}
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export default ParticleSystem;
