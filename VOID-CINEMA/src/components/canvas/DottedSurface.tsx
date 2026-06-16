import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const DottedSurface: React.FC = () => {
  const meshRef = useRef<THREE.Points>(null);

  // Configuration
  const width = 100;
  const depth = 100;
  const spacing = 1.5;
  const particleCount = width * depth;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    
    let i = 0;
    for (let x = 0; x < width; x++) {
      for (let z = 0; z < depth; z++) {
        // Center the grid
        const posX = (x - width / 2) * spacing;
        const posZ = (z - depth / 2) * spacing;
        
        pos[i * 3] = posX;
        pos[i * 3 + 1] = 0; // Y is handled in shader
        pos[i * 3 + 2] = posZ;

        // Color gradient based on depth/position (Cyan -> Purple)
        const mixRatio = (posX + posZ) / (width * spacing);
        const color = new THREE.Color().lerpColors(
          new THREE.Color('#00f3ff'), // Cyan
          new THREE.Color('#bf00ff'), // Purple
          Math.sin(mixRatio * Math.PI) * 0.5 + 0.5
        );

        col[i * 3] = color.r;
        col[i * 3 + 1] = color.g;
        col[i * 3 + 2] = color.b;

        i++;
      }
    }
    return [pos, col];
  }, [width, depth, spacing, particleCount]);

  const shaderArgs = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#00f3ff') }
    },
    vertexShader: `
      uniform float uTime;
      attribute vec3 color;
      varying vec3 vColor;
      
      void main() {
        vColor = color;
        vec3 pos = position;
        
        // Sine wave motion based on X and Z
        float wave1 = sin(pos.x * 0.2 + uTime * 1.5) * 2.0;
        float wave2 = cos(pos.z * 0.2 + uTime * 1.2) * 1.5;
        float wave3 = sin((pos.x + pos.z) * 0.1 + uTime * 0.8) * 1.0;
        
        pos.y = wave1 + wave2 + wave3 - 15.0; // Offset below the camera
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        
        // Point size attenuation based on depth
        gl_PointSize = (10.0 / -mvPosition.z);
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      
      void main() {
        // Create soft circular dots
        float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
        float alpha = 1.0 - smoothstep(0.3, 0.5, distanceToCenter);
        
        if(alpha < 0.01) discard;
        
        gl_FragColor = vec4(vColor, alpha * 0.8);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  }), []);

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        {/* @ts-ignore */}
        <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
        {/* @ts-ignore */}
        <bufferAttribute attach="attributes-color" count={particleCount} array={colors} itemSize={3} />
      </bufferGeometry>
      <shaderMaterial attach="material" args={[shaderArgs]} />
    </points>
  );
};

export default DottedSurface;
