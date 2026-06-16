import React, { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';
import ParticleSystem from './ParticleSystem';
import DottedSurface from './DottedSurface';
import CameraRig from './CameraRig';
import TheaterEnvironment from './TheaterEnvironment';

const EnvironmentManager = () => {
  const activeSector = useStore((state) => state.activeSector);
  const isEnteringTheater = useStore((state) => state.isEnteringTheater);
  const { scene } = useThree();

  useEffect(() => {
    if (activeSector === 'theater' || isEnteringTheater) {
      // Dense fog for the theater
      scene.fog = new THREE.FogExp2('#05050a', 0.015);
    } else {
      // No fog or very light fog for space
      scene.fog = new THREE.FogExp2('#0a0a1a', 0.002);
    }
  }, [activeSector, isEnteringTheater, scene]);

  return null;
};

const Scene = ({ navigate }: { navigate: any }) => {
  const activeSector = useStore((state) => state.activeSector);

  return (
    <>
      <color attach="background" args={['#0a0a1a']} />
      <EnvironmentManager />
      
      {/* Background Environment - Only in space */}
      {activeSector !== 'theater' && (
        <>
          <ambientLight intensity={0.1} />
          <directionalLight position={[10, 10, 5]} intensity={1} color="#00f3ff" />
          <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#bf00ff" />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <ParticleSystem />
          <DottedSurface />
        </>
      )}
      
      {/* Theater Environment */}
      <TheaterEnvironment />
      
      {/* Global Camera Rig */}
      <CameraRig />
    </>
  );
};

const UniverseCanvas: React.FC<{ navigate: any }> = ({ navigate }) => {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
      <Scene navigate={navigate} />
    </Canvas>
  );
};

export default UniverseCanvas;
