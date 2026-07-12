'use client';

import * as React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useReducedMotion } from 'framer-motion';
import * as THREE from 'three';

const PLUM = '#6B2C5F';
const TEAL = '#2A9B8E';
const CREAM = '#FBF7F2';

type RibbonConfig = {
  color: string;
  opacity: number;
  yOffset: number;
  zOffset: number;
  period: number;
  phase: number;
  amplitude: number;
};

const DESKTOP_RIBBONS: RibbonConfig[] = [
  { color: PLUM, opacity: 0.16, yOffset: 1.2, zOffset: -1, period: 14, phase: 0, amplitude: 0.9 },
  { color: PLUM, opacity: 0.13, yOffset: -0.8, zOffset: 0.5, period: 18, phase: 1.2, amplitude: 0.7 },
  { color: TEAL, opacity: 0.15, yOffset: 0.4, zOffset: -0.5, period: 11, phase: 2.1, amplitude: 0.85 },
  { color: TEAL, opacity: 0.12, yOffset: -1.5, zOffset: 1, period: 20, phase: 0.6, amplitude: 0.65 },
  { color: CREAM, opacity: 0.14, yOffset: 2, zOffset: 0, period: 16, phase: 3.4, amplitude: 0.55 },
];

const MOBILE_RIBBONS: RibbonConfig[] = [
  { color: PLUM, opacity: 0.15, yOffset: 0.6, zOffset: 0, period: 14, phase: 0, amplitude: 0.75 },
  { color: TEAL, opacity: 0.14, yOffset: -0.9, zOffset: 0.3, period: 17, phase: 1.5, amplitude: 0.7 },
];

function basePoints(config: RibbonConfig, mobile: boolean): THREE.Vector3[] {
  const spread = mobile ? 5 : 7;
  return [
    new THREE.Vector3(-spread, config.yOffset + 0.8, config.zOffset),
    new THREE.Vector3(-spread * 0.45, config.yOffset, config.zOffset + 0.4),
    new THREE.Vector3(0, config.yOffset - 0.5, config.zOffset - 0.3),
    new THREE.Vector3(spread * 0.45, config.yOffset + 0.3, config.zOffset + 0.2),
    new THREE.Vector3(spread, config.yOffset - 0.7, config.zOffset),
  ];
}

function FlowRibbon({
  config,
  index,
  mobile,
}: {
  config: RibbonConfig;
  index: number;
  mobile: boolean;
}) {
  const reduced = useReducedMotion();
  const meshRef = React.useRef<THREE.Mesh>(null);
  const anchors = React.useMemo(() => basePoints(config, mobile), [config, mobile]);
  const curve = React.useMemo(
    () => new THREE.CatmullRomCurve3(anchors.map((p) => p.clone())),
    [anchors]
  );

  const geometry = React.useMemo(() => {
    const tubularSegments = mobile ? 24 : 48;
    const radius = mobile ? 0.12 : 0.14 + index * 0.02;
    return new THREE.TubeGeometry(curve, tubularSegments, radius, 8, false);
  }, [curve, mobile, index]);

  React.useEffect(() => () => geometry.dispose(), [geometry]);

  const frameCounter = React.useRef(0);

  useFrame((state) => {
    if (!meshRef.current || reduced) return;

    frameCounter.current += 1;
    if (frameCounter.current % 2 !== 0) return;

    const t = state.clock.elapsedTime;

    anchors.forEach((anchor, i) => {
      const wave =
        Math.sin(t / config.period + config.phase + i * 0.85) * config.amplitude;
      const drift =
        Math.cos(t / (config.period + 3) + config.phase + i * 0.5) *
        (config.amplitude * 0.45);
      curve.points[i].x = anchor.x + wave * 0.35;
      curve.points[i].y = anchor.y + wave;
      curve.points[i].z = anchor.z + drift;
    });

    const tubularSegments = mobile ? 24 : 48;
    const radius = mobile ? 0.12 : 0.14 + index * 0.02;
    const next = new THREE.TubeGeometry(curve, tubularSegments, radius, 8, false);
    meshRef.current.geometry.dispose();
    meshRef.current.geometry = next;
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshBasicMaterial
        color={config.color}
        transparent
        opacity={config.opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

function RibbonScene({ mobile }: { mobile: boolean }) {
  const ribbons = mobile ? MOBILE_RIBBONS : DESKTOP_RIBBONS;

  return (
    <>
      <ambientLight intensity={1} />
      {ribbons.map((config, i) => (
        <FlowRibbon key={i} config={config} index={i} mobile={mobile} />
      ))}
    </>
  );
}

export default function Diagnostics3DBackground({ onReady }: { onReady?: () => void }) {
  const [mobile, setMobile] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop="always"
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      orthographic
      camera={{ position: [0, 0, 10], zoom: 42 }}
      style={{ background: 'transparent' }}
      onCreated={() => onReady?.()}
    >
      <RibbonScene mobile={mobile} />
    </Canvas>
  );
}
