import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';
import { theaterState } from './TheaterEnvironment'; // Import the high-performance local state

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
  
  // To track ongoing camera timeline so we can kill it if state changes
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // Parallax base state
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    // Kill previous timeline if active
    if (tlRef.current) {
      tlRef.current.kill();
      tlRef.current = null;
    }

    if (activeSector === 'explore') {
      if (selectedMovie) {
        const targetPos = POSITIONS[selectedMovie.id as keyof typeof POSITIONS];
        if (targetPos) {
          if (isEnteringTheater) {
            // Portal dive
            gsap.to(camera.position, {
              x: -3.0, y: 0, z: 0,
              duration: 2.5,
              ease: 'power2.in',
              onComplete: () => {
                setActiveSector('theater');
                setIsEnteringTheater(false);
                camera.position.set(0, 15, 30);
              }
            });
          } else {
            // Selection flight
            const camTarget = new THREE.Vector3(0, 0, 10);
            gsap.to(camera.position, {
              x: camTarget.x, y: camTarget.y, z: camTarget.z,
              duration: 2,
              ease: 'power3.inOut'
            });
          }
        }
      } else {
        // Return to overview
        gsap.to(camera.position, {
          x: 0, y: 0, z: 5,
          duration: 2,
          ease: 'power3.inOut'
        });
      }
    } else if (activeSector === 'theater') {
      if (activePOVSeat) {
        // We are moving into a seat
        const seatX = activePOVSeat.position[0];
        const seatY = activePOVSeat.position[1];
        const seatZ = activePOVSeat.position[2];

        if (activePOVSeat.ratingCategory === 'BEST VIEW') {
          // Premium Cinematic Sequence for Best View
          tlRef.current = gsap.timeline();
          
          // 1. Initial swoop down towards the seat area
          tlRef.current.to(camera.position, {
            x: seatX * 0.5,
            y: seatY + 8,
            z: seatZ + 10,
            duration: 1.2,
            ease: 'sine.inOut'
          });
          
          // 2. Slow glide into the actual seat POV
          tlRef.current.to(camera.position, {
            x: seatX,
            y: seatY + 2.5, // Eye level
            z: seatZ + 0.5, // Inside seat
            duration: 1.8,
            ease: 'power2.out'
          });
        } else {
          // Standard Dolly Movement
          gsap.to(camera.position, {
            x: seatX,
            y: seatY + 2.5, 
            z: seatZ + 0.5, 
            duration: 2,
            ease: 'sine.inOut',
          });
        }
      } else {
        // Default theater view (entering or returning from seat)
        gsap.to(camera.position, {
          x: 0,
          y: 20, // High up looking down at the massive theater
          z: 35, // Back of the room
          duration: 2.5,
          ease: 'power2.inOut'
        });
      }
    } else {
      // Default fallback
      gsap.to(camera.position, {
        x: 0, y: 0, z: 8,
        duration: 1.5,
        ease: 'power2.out'
      });
    }
  }, [selectedMovie, activeSector, isEnteringTheater, camera, setActiveSector, setIsEnteringTheater, activePOVSeat]);

  useFrame((state, delta) => {
    if (activeSector === 'explore' && !selectedMovie && !isEnteringTheater) {
      camera.position.x += (mouse.current.x * 0.5 - camera.position.x) * 0.02;
      camera.position.y += (mouse.current.y * 0.5 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);
    } else if (activeSector === 'theater') {
      // Always look at the cinema screen when in the theater
      camera.lookAt(0, 10, -35);

      // --- Seat Focus Parallax (Slight camera shift based on hovering) ---
      if (!activePOVSeat) {
        // We are in the overview. Add parallax based on mouse and hovered seat
        let targetX = mouse.current.x * 2;
        let targetY = 20 + mouse.current.y * 2;

        if (theaterState.hoveredSeatPos) {
          // Pull camera slightly towards the hovered seat
          targetX += theaterState.hoveredSeatPos.x * 0.05;
          targetY += (theaterState.hoveredSeatPos.y + 10) * 0.05;
        }

        // Apply smooth inertia to the camera shifts
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, delta * 2);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, delta * 2);
      } else {
        // Inside POV Seat - Subtle breathing/head movement
        const time = state.clock.elapsedTime;
        const breathX = Math.sin(time * 0.5) * 0.05;
        const breathY = Math.cos(time * 0.4) * 0.02;
        
        // Add subtle mouse look around
        const lookAroundX = activePOVSeat.position[0] + mouse.current.x * 0.5;
        const lookAroundY = activePOVSeat.position[1] + 2.5 + mouse.current.y * 0.5;

        camera.position.x = THREE.MathUtils.lerp(camera.position.x, lookAroundX + breathX, delta * 3);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, lookAroundY + breathY, delta * 3);
      }
    } else if (selectedMovie && !isEnteringTheater) {
      camera.lookAt(0, 0, 0);
    }
  });

  return null;
};

export default CameraRig;
