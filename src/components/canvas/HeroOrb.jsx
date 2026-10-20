import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, MeshDistortMaterial, Float, Icosahedron, Preload } from "@react-three/drei";
import CanvasLoader from "../Loader";

const Orb = () => {
  const shellRef = useRef();
  const coreRef = useRef();

  useFrame((state, delta) => {
    if (shellRef.current) {
      shellRef.current.rotation.y += delta * 0.25;
      shellRef.current.rotation.x += delta * 0.12;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y -= delta * 0.15;
    }
  });

  return (
    <Float speed={1.4} rotationIntensity={0.6} floatIntensity={0.9}>
      {/* soft key + rim lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} color='#c4b0ff' />
      <pointLight position={[-5, -3, -4]} intensity={2.5} color='#00cea8' />
      <pointLight position={[4, -2, 3]} intensity={1.6} color='#915eff' />

      {/* morphing glossy core */}
      <mesh ref={coreRef} scale={1.65}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color='#7a4bff'
          distort={0.42}
          speed={2.2}
          roughness={0.15}
          metalness={0.6}
        />
      </mesh>

      {/* rotating wireframe shell */}
      <Icosahedron ref={shellRef} args={[1, 1]} scale={2.35}>
        <meshBasicMaterial color='#915eff' wireframe transparent opacity={0.25} />
      </Icosahedron>
    </Float>
  );
};

const HeroOrb = () => {
  return (
    <Canvas
      frameloop='always'
      dpr={[1, 2]}
      camera={{ position: [0, 0, 6], fov: 45 }}
      gl={{ preserveDrawingBuffer: true }}
    >
      <Suspense fallback={<CanvasLoader />}>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.8}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
        <Orb />
        <Preload all />
      </Suspense>
    </Canvas>
  );
};

export default HeroOrb;
