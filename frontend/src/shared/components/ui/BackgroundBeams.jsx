import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import * as THREE from 'three';

const Beam = ({ index, count }) => {
  const meshRef = useRef();
  
  // Randomize beam properties
  const { position, speed, opacity, scale } = useMemo(() => ({
    position: [
      (Math.random() - 0.5) * 15,
      (Math.random() - 0.5) * 15,
      (Math.random() - 0.5) * 5 - 5
    ],
    speed: Math.random() * 0.02 + 0.005,
    opacity: Math.random() * 0.5 + 0.2,
    scale: [Math.random() * 0.05 + 0.01, 10, 0.01]
  }), []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y += speed;
      if (meshRef.current.position.y > 10) {
        meshRef.current.position.y = -10;
      }
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial 
        color="#10b981" 
        transparent 
        opacity={opacity} 
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

export const BackgroundBeams = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-zinc-950">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <color attach="background" args={['#09090b']} />
        <ambientLight intensity={0.5} />
        {Array.from({ length: 40 }).map((_, i) => (
          <Beam key={i} index={i} count={40} />
        ))}
        {/* Optional: Add post-processing for glow */}
        <EffectComposer>
          <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} opacity={1.5} />
        </EffectComposer>
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950 opacity-80" />
    </div>
  );
};
