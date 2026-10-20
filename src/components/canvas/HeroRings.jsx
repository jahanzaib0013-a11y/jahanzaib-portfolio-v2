import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const Ring = ({ radius, tube, color, opacity, speed, tilt }) => {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.z += delta * speed;
      ref.current.rotation.x += delta * speed * 0.35;
    }
  });
  return (
    <mesh ref={ref} rotation={tilt}>
      <torusGeometry args={[radius, tube, 24, 140]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

const OrbitDot = ({ radius, color, speed, tilt, phase }) => {
  const ref = useRef();
  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + phase;
    if (ref.current) {
      ref.current.position.set(Math.cos(t) * radius, Math.sin(t) * radius, 0);
    }
  });
  return (
    <group rotation={tilt}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
};

const HeroRings = () => {
  return (
    <Canvas frameloop='always' dpr={[1, 2]} camera={{ position: [0, 0, 6], fov: 45 }} gl={{ alpha: true }}>
      <Ring radius={2.55} tube={0.012} color='#915eff' opacity={0.7} speed={0.35} tilt={[1.2, 0.4, 0]} />
      <Ring radius={2.75} tube={0.010} color='#00cea8' opacity={0.5} speed={-0.28} tilt={[0.5, 1.1, 0.3]} />
      <Ring radius={2.35} tube={0.014} color='#c4b0ff' opacity={0.55} speed={0.45} tilt={[0.9, -0.6, 0.6]} />
      <OrbitDot radius={2.55} color='#b69bff' speed={0.6} tilt={[1.2, 0.4, 0]} phase={0} />
      <OrbitDot radius={2.75} color='#00cea8' speed={-0.5} tilt={[0.5, 1.1, 0.3]} phase={2} />
      <OrbitDot radius={2.35} color='#ffffff' speed={0.7} tilt={[0.9, -0.6, 0.6]} phase={4} />
    </Canvas>
  );
};

export default HeroRings;
