import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COUNT = 130;        // nodes that get connecting lines
const RANGE = 9;          // cube half-size the nodes live in
const LINK_DIST = 2.2;    // max distance to draw a link
const LINK_DIST_SQ = LINK_DIST * LINK_DIST;

const Network = () => {
  const pointsRef = useRef();
  const linesRef = useRef();
  const groupRef = useRef();

  // initial positions + gentle per-node velocities
  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const velocities = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * RANGE * 2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * RANGE * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * RANGE * 2;
      velocities[i * 3] = (Math.random() - 0.5) * 0.012;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.012;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.012;
    }
    return { positions, velocities };
  }, []);

  // pre-allocate a line buffer big enough for many links
  const linePositions = useMemo(() => new Float32Array(COUNT * COUNT * 3), []);

  useFrame((state) => {
    const pos = pointsRef.current.geometry.attributes.position.array;

    // drift + soft bounce inside the cube
    for (let i = 0; i < COUNT; i++) {
      const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
      pos[ix] += velocities[ix];
      pos[iy] += velocities[iy];
      pos[iz] += velocities[iz];
      if (pos[ix] > RANGE || pos[ix] < -RANGE) velocities[ix] *= -1;
      if (pos[iy] > RANGE || pos[iy] < -RANGE) velocities[iy] *= -1;
      if (pos[iz] > RANGE || pos[iz] < -RANGE) velocities[iz] *= -1;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;

    // rebuild connecting lines between nearby nodes
    let n = 0;
    for (let i = 0; i < COUNT; i++) {
      const ix = i * 3;
      for (let j = i + 1; j < COUNT; j++) {
        const jx = j * 3;
        const dx = pos[ix] - pos[jx];
        const dy = pos[ix + 1] - pos[jx + 1];
        const dz = pos[ix + 2] - pos[jx + 2];
        const dSq = dx * dx + dy * dy + dz * dz;
        if (dSq < LINK_DIST_SQ) {
          linePositions[n++] = pos[ix];
          linePositions[n++] = pos[ix + 1];
          linePositions[n++] = pos[ix + 2];
          linePositions[n++] = pos[jx];
          linePositions[n++] = pos[jx + 1];
          linePositions[n++] = pos[jx + 2];
        }
      }
    }
    const lineGeo = linesRef.current.geometry;
    lineGeo.attributes.position.needsUpdate = true;
    lineGeo.setDrawRange(0, n / 3);

    // subtle mouse parallax + slow auto-rotation
    if (groupRef.current) {
      const { x, y } = state.pointer;
      groupRef.current.rotation.y += (x * 0.35 - groupRef.current.rotation.y) * 0.05 + 0.0009;
      groupRef.current.rotation.x += (y * 0.2 - groupRef.current.rotation.x) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach='attributes-position' count={COUNT} array={positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={0.14}
          color='#b69bff'
          transparent
          opacity={0.95}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <lineSegments ref={linesRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach='attributes-position' count={linePositions.length / 3} array={linePositions} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial
          color='#915eff'
          transparent
          opacity={0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
};

const ParticleField = () => {
  return (
    <Canvas frameloop='always' dpr={[1, 2]} camera={{ position: [0, 0, 16], fov: 55 }}>
      <Network />
    </Canvas>
  );
};

export default ParticleField;
