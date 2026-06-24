import React, { useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';

const POSITIONS = {
  'interstellar': new THREE.Vector3(-6, 1, -5),
  'spiderman-bnd': new THREE.Vector3(-2, 0, -2),
  'kanguva': new THREE.Vector3(2, -1, -2),
  'obsession': new THREE.Vector3(6, 0, -5),
};

const CameraRig: React.FC = () => {
  const { camera } = useThree();
  const selectedMovie = useStore((state) => state.selectedMovie);
  const activeSector = useStore((state) => state.activeSector);
  const isEnteringTheater = useStore((state) => state.isEnteringTheater);
  const setActiveSector = useStore((state) => state.setActiveSector);
  const setIsEnteringTheater = useStore((state) => state.setIsEnteringTheater);
  const activePOVSeat = useStore((state) => state.activePOVSeat);

  // Parallax base state
  let mouseX = 0;
  let mouseY = 0;

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (activeSector === 'explore') {
      if (selectedMovie) {
        const targetPos = POSITIONS[selectedMovie.id as keyof typeof POSITIONS];
        if (targetPos) {
          if (isEnteringTheater) {
            // Portal dive: Fly directly into the origin of the Hero poster
            gsap.to(camera.position, {
              x: -3.0,
              y: 0,
              z: 0, // Dive through the center of the hero poster
              duration: 2.5,
              ease: 'power2.in',
              onComplete: () => {
                // Instantly swap environments once we pass through
                setActiveSector('theater');
                setIsEnteringTheater(false);
                
                // Snap camera to the theater entry position
                camera.position.set(0, 15, 30);
              }
            });
          } else {
            // Normal Selection flight: Calculate a position perfectly framed for the Hero Poster on the left and Metadata on the right
            const camTarget = new THREE.Vector3(0, 0, 10);

            gsap.to(camera.position, {
              x: camTarget.x,
              y: camTarget.y,
              z: camTarget.z,
              duration: 2,
              ease: 'power3.inOut'
            });
          }
        }
      } else {
        // Return to overview
        gsap.to(camera.position, {
          x: 0,
          y: 0,
          z: 5,
          duration: 2,
          ease: 'power3.inOut'
        });
      }
    } else if (activeSector === 'theater') {
      if (activePOVSeat) {
        // Fly to the seat POV
        gsap.to(camera.position, {
          x: activePOVSeat.position[0],
          y: activePOVSeat.position[1] + 2.5, // Eye level above the seat
          z: activePOVSeat.position[2] + 0.5, // Slightly forward in the seat
          duration: 1.5,
          ease: 'power2.inOut',
        });
      } else {
        // Default theater view (entering or returning from seat)
        gsap.to(camera.position, {
          x: 0,
          y: 15, // High up looking down
          z: 25, // Back of the room
          duration: 2,
          ease: 'power2.out'
        });
      }
    } else {
      // Default position for other sectors
      gsap.to(camera.position, {
        x: 0,
        y: 0,
        z: 8,
        duration: 1.5,
        ease: 'power2.out'
      });
    }
  }, [selectedMovie, activeSector, isEnteringTheater, camera, setActiveSector, setIsEnteringTheater, activePOVSeat]);

  useFrame(() => {
    // Only apply parallax if no movie is selected and we are in space, to keep the artifact perfectly centered when selected
    if (!selectedMovie && activeSector === 'explore' && !isEnteringTheater) {
      camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.02;
      camera.position.y += (mouseY * 0.5 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);
    } else if (activeSector === 'theater') {
      // Always look at the cinema screen when in the theater
      camera.lookAt(0, 10, -30);
    } else if (selectedMovie && !isEnteringTheater) {
      camera.lookAt(0, 0, 0);
    }
  });

  return null;
};

export default CameraRig;
