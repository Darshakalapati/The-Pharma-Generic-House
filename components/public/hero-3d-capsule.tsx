'use client';

import * as React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import { useReducedMotion } from 'framer-motion';
import * as THREE from 'three';

const PLUM = '#6B2C5F';
const TEAL = '#2A9B8E';

function CapsuleMesh() {
  const groupRef = React.useRef<THREE.Group>(null);
  const reduced = useReducedMotion();

  const { geometry, clipLeft, clipRight } = React.useMemo(() => {
    const geo = new THREE.CapsuleGeometry(0.45, 1.6, 16, 32);
    return {
      geometry: geo,
      clipLeft: new THREE.Plane(new THREE.Vector3(1, 0, 0), 0),
      clipRight: new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0),
    };
  }, []);

  React.useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  useFrame((state, delta) => {
    if (!groupRef.current || reduced) return;
    groupRef.current.rotation.y += 0.15 * delta;
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * (Math.PI / 2)) * 0.05;
  });

  const materialProps = {
    roughness: 0.35,
    metalness: 0.1,
  };

  return (
    <group ref={groupRef} rotation={[0, 0, THREE.MathUtils.degToRad(15)]}>
      <mesh geometry={geometry} castShadow>
        <meshStandardMaterial
          color={PLUM}
          {...materialProps}
          clippingPlanes={[clipLeft]}
          clipIntersection={false}
        />
      </mesh>
      <mesh geometry={geometry} castShadow>
        <meshStandardMaterial
          color={TEAL}
          {...materialProps}
          clippingPlanes={[clipRight]}
          clipIntersection={false}
        />
      </mesh>
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 4]} intensity={0.4} castShadow />
      <directionalLight position={[-3, 2, -4]} intensity={0.2} />
      <CapsuleMesh />
      <ContactShadows
        position={[0, -1.35, 0]}
        opacity={0.25}
        blur={2.5}
        far={4}
        resolution={256}
        color="#1F1A1F"
      />
    </>
  );
}

export default function Hero3DCapsule({ onReady }: { onReady?: () => void }) {
  React.useEffect(() => {
    THREE.ColorManagement.enabled = true;
  }, []);

  return (
    <Canvas
      dpr={[1, 2]}
      frameloop="always"
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 0, 4.2], fov: 42 }}
      style={{ background: 'transparent' }}
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true;
        onReady?.();
      }}
    >
      <Scene />
    </Canvas>
  );
}
