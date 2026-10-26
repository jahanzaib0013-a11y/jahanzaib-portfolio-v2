/**
 * InteractiveHeroBackground — WebGPU TSL Edition
 *
 * Uses Three.js WebGPU renderer with TSL (Three.js Shading Language) compute shaders.
 * Falls back to WebGL via react-three/fiber if WebGPU is unavailable.
 *
 * WebGPU path: GPU-side particle simulation via compute shaders (no CPU per-particle loop).
 * Fallback path: Standard R3F canvas with CPU-driven wave terrain.
 */

import { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { AdaptiveDpr, PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';

import { damp, useExitProgress } from './lib/motion';

// ─────────────────────────────────────────────────────────────────────────────
// FALLBACK: CPU-based wave terrain (WebGL, runs inside R3F <Canvas>)
// ─────────────────────────────────────────────────────────────────────────────
const createGlowTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(20, 19, 26, 0.85)');
  gradient.addColorStop(0.25, 'rgba(31, 58, 147, 0.45)');
  gradient.addColorStop(0.6, 'rgba(31, 58, 147, 0.12)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
};

const InteractiveTerrain = ({ exit }) => {
  const pointsRef = useRef();
  const { mouse, viewport, camera } = useThree();
  const ROWS = 55, COLS = 55, TOTAL = ROWS * COLS, SPACING = 0.55;
  const glowTexture = useMemo(() => createGlowTexture(), []);
  const { positions, initialPositions, colors } = useMemo(() => {
    const pos = new Float32Array(TOTAL * 3);
    const initial = new Float32Array(TOTAL * 3);
    const col = new Float32Array(TOTAL * 3);
    const c1 = new THREE.Color('#1f3a93');
    const c2 = new THREE.Color('#5a5766');
    const c3 = new THREE.Color('#a9a4b8');
    let idx = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = (c - COLS / 2) * SPACING;
        const z = (r - ROWS / 2) * SPACING;
        pos[idx * 3] = initial[idx * 3] = x;
        pos[idx * 3 + 1] = initial[idx * 3 + 1] = -2.8;
        pos[idx * 3 + 2] = initial[idx * 3 + 2] = z;
        const ratio = (r / ROWS) * 0.7 + (c / COLS) * 0.3;
        const mixed = c3.clone().lerp(c1, ratio).lerp(c2, Math.sin(r * 0.1) * 0.4);
        col[idx * 3] = mixed.r; col[idx * 3 + 1] = mixed.g; col[idx * 3 + 2] = mixed.b;
        idx++;
      }
    }
    return { positions: pos, initialPositions: initial, colors: col };
    // ROWS/COLS/TOTAL/SPACING are fixed layout constants — the buffers are
    // built exactly once, by design.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const ripplesRef = useRef([]);
  useEffect(() => {
    const handlePointerDown = (e) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      ripplesRef.current.push({
        x: normX * (viewport.width / 2), z: -normY * (viewport.height / 2),
        radius: 0, strength: 1.8, time: Date.now(),
      });
      if (ripplesRef.current.length > 5) ripplesRef.current.shift();
    };
    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [viewport]);
  const targetPointer = useRef(new THREE.Vector2(0, 0));
  const smoothPointer = useRef(new THREE.Vector2(0, 0));
  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const t = state.clock.getElapsedTime();
    const pos = pointsRef.current.geometry.attributes.position.array;
    const colAttr = pointsRef.current.geometry.attributes.color.array;
    targetPointer.current.set(mouse.x * (viewport.width * 0.8), -mouse.y * (viewport.height * 0.8));
    // Rate-based follow: identical feel at 30 fps and 120 fps.
    smoothPointer.current.lerp(targetPointer.current, 1 - Math.exp(-6 * delta));
    const mx = smoothPointer.current.x, mz = smoothPointer.current.y;
    ripplesRef.current.forEach((r) => { r.radius += delta * 7.5; r.strength *= 0.96; });
    ripplesRef.current = ripplesRef.current.filter((r) => r.strength > 0.05);
    for (let i = 0; i < TOTAL; i++) {
      const i3 = i * 3;
      const ix = initialPositions[i3], iz = initialPositions[i3 + 2];
      let wave = Math.sin(ix * 0.45 + t * 1.4) * 0.45 + Math.cos(iz * 0.35 + t * 1.1) * 0.45 + Math.sin((ix + iz) * 0.25 + t * 0.8) * 0.3;
      const dx = ix - mx, dz = iz - mz, distSq = dx * dx + dz * dz;
      if (distSq < 16) {
        const dist = Math.sqrt(distSq);
        const influence = Math.cos((dist / 4) * (Math.PI / 2));
        wave += influence * 1.4;
        colAttr[i3] = THREE.MathUtils.lerp(colors[i3], 0.122, influence * 0.9);
        colAttr[i3 + 1] = THREE.MathUtils.lerp(colors[i3 + 1], 0.227, influence * 0.9);
        colAttr[i3 + 2] = THREE.MathUtils.lerp(colors[i3 + 2], 0.576, influence * 0.9);
      } else {
        colAttr[i3] = colors[i3]; colAttr[i3 + 1] = colors[i3 + 1]; colAttr[i3 + 2] = colors[i3 + 2];
      }
      for (let r of ripplesRef.current) {
        const rdx = ix - r.x, rdz = iz - r.z;
        const rdist = Math.sqrt(rdx * rdx + rdz * rdz);
        const waveDist = Math.abs(rdist - r.radius);
        if (waveDist < 1.8) wave += Math.sin((1 - waveDist / 1.8) * Math.PI) * r.strength;
      }
      pos[i3 + 1] = initialPositions[i3 + 1] + wave;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.geometry.attributes.color.needsUpdate = true;
    // Cursor parallax plus a slow dolly back and lift as the hero hands off to the
    // page, so the terrain recedes instead of just scrolling out of frame.
    const p = exit?.current ?? 0;
    camera.position.x = damp(camera.position.x, mouse.x * 0.7, 3, delta);
    camera.position.y = damp(camera.position.y, 4 + mouse.y * 0.5 + p * 1.4, 3, delta);
    camera.position.z = damp(camera.position.z, 11 + p * 2.6, 3, delta);
    camera.lookAt(0, -1, 0);
  });
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach='attributes-position' count={TOTAL} array={positions} itemSize={3} />
        <bufferAttribute attach='attributes-color' count={TOTAL} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.2} map={glowTexture} vertexColors transparent opacity={0.5} depthWrite={false} blending={THREE.NormalBlending} sizeAttenuation />
    </points>
  );
};

const FloatingDust = () => {
  const count = 90;
  const ref = useRef();
  const { positions } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = Math.random() * 8 - 2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 16;
    }
    return { positions: pos };
  }, []);
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.y += delta * 0.03; });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach='attributes-position' count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.09} color='#a9a4b8' transparent opacity={0.45} depthWrite={false} blending={THREE.NormalBlending} />
    </points>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// WEBGPU PATH: Standalone canvas with TSL compute shaders
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The canvas' CSS box, measured from its wrapper.
 *
 * Never measure the canvas itself: setSize() writes inline width/height onto it, so
 * one zero measurement (a hidden tab, a mid-layout resize) would pin the element to
 * 0px and every later read would agree with it — a canvas that can never come back.
 * Returns null instead, and the caller keeps the last good size.
 */
const cssSize = (canvas) => {
  const box = (canvas.parentElement ?? canvas).getBoundingClientRect();
  return box.width > 0 && box.height > 0
    ? { w: Math.round(box.width), h: Math.round(box.height) }
    : null;
};

class WebGPUScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.clock = null;
    this.animationId = null;
    this.disposed = false;
    this.exit = 0;

    // TSL nodes (populated after init)
    this.positions = null;
    this.velocities = null;
    this.computeInit = null;
    this.computeUpdate = null;
    this.mouseUniform = null;
    this.deltaTimeUniform = null;
    this.timeUniform = null;
    this.clickPositionUniform = null;
    this.clickStrengthUniform = null;
    this.clickActive = null;
  }

  async init() {
    // Dynamic import — only available once three@latest is installed
    const THREE_GPU = await import('three/webgpu');
    const TSL = await import('three/tsl');

    const {
      Fn, uniform, float, vec3, color, fract, attribute, step,
      instancedArray, instanceIndex, hash, select
    } = TSL;

    const PARTICLE_COUNT = 8000;
    const SPACING = 0.55;
    const ROWS = 80, COLS = 100;

    // Storage buffers
    this.positions = instancedArray(PARTICLE_COUNT, 'vec3');
    this.velocities = instancedArray(PARTICLE_COUNT, 'vec3');
    const baseYBuffer = instancedArray(PARTICLE_COUNT, 'float');

    // Uniforms
    this.mouseUniform = uniform(new THREE_GPU.Vector3(0, 0, 0));
    this.deltaTimeUniform = uniform(0.0);
    this.timeUniform = uniform(0.0);
    this.clickPositionUniform = uniform(new THREE_GPU.Vector3(0, 0, 0));
    this.clickStrengthUniform = uniform(0.0);

    const mousePos = this.mouseUniform;
    const dt = this.deltaTimeUniform;
    const t = this.timeUniform;
    const clickPos = this.clickPositionUniform;
    const clickStr = this.clickStrengthUniform;

    // Init compute: scatter points into a wave grid
    this.computeInit = Fn(() => {
      const pos = this.positions.element(instanceIndex);
      const baseY = baseYBuffer.element(instanceIndex);

      const col = instanceIndex.mod(COLS).toFloat();
      const row = instanceIndex.div(COLS).toFloat();

      pos.x.assign(col.sub(COLS / 2).mul(SPACING * 0.8));
      pos.z.assign(row.sub(ROWS / 2).mul(SPACING * 0.8));

      // Gentle noise offset for organic look
      const noiseY = hash(instanceIndex).sub(0.5).mul(0.3);
      pos.y.assign(float(-2.8).add(noiseY));
      baseY.assign(pos.y);
    })().compute(PARTICLE_COUNT);

    // Update compute: wave physics + mouse + click ripple
    this.computeUpdate = Fn(() => {
      const pos = this.positions.element(instanceIndex);
      const vel = this.velocities.element(instanceIndex);
      const baseY = baseYBuffer.element(instanceIndex);

      const ix = pos.x;
      const iz = pos.z;

      // Animate wave (fully on GPU via TSL)
      const wave1 = ix.mul(0.45).add(t.mul(1.4)).sin().mul(0.45);
      const wave2 = iz.mul(0.35).add(t.mul(1.1)).cos().mul(0.45);
      const wave3 = ix.add(iz).mul(0.25).add(t.mul(0.8)).sin().mul(0.3);
      const baseWave = wave1.add(wave2).add(wave3);

      // Mouse proximity displacement
      const toMouse = vec3(ix.sub(mousePos.x), float(0), iz.sub(mousePos.z));
      const mouseDist = toMouse.length();
      const mouseInfluence = select(
        mouseDist.lessThan(4.0),
        float(1.0).sub(mouseDist.div(4.0)).mul(1.6),
        float(0.0)
      );

      // Click ripple wave
      // Click ripple: a ring whose radius is driven by the decaying click strength.
      const toCLick = vec3(ix.sub(clickPos.x), float(0), iz.sub(clickPos.z));
      const clickDist = toCLick.length();
      const rippleWidth = float(1.8);
      const distFromRing = clickDist.sub(clickStr.mul(12.0)).abs();
      const clickWave = select(
        distFromRing.lessThan(rippleWidth),
        float(1.0).sub(distFromRing.div(rippleWidth)).mul(1.4).mul(clickStr),
        float(0.0)
      );

      const targetY = baseY.add(baseWave).add(mouseInfluence).add(clickWave);

      // Spring toward target
      const springForce = targetY.sub(pos.y).mul(8.0);
      vel.y.addAssign(springForce.mul(dt));
      vel.y.mulAssign(float(1.0).sub(dt.mul(6.0))); // damping
      pos.y.addAssign(vel.y.mul(dt));
    })().compute(PARTICLE_COUNT);

    // Scene setup
    this.scene = new THREE_GPU.Scene();
    this.camera = new THREE_GPU.PerspectiveCamera(48, this.canvas.width / this.canvas.height, 0.1, 100);
    this.camera.position.set(0, 4.5, 11);
    this.camera.lookAt(0, -1, 0);

    this.renderer = new THREE_GPU.WebGPURenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    });
    // The swapchain is configured at init() from whatever the buffer holds, so it
    // has to be a real size before then — measured from the wrapper, never from the
    // canvas. updateStyle = false keeps three out of the element's inline styles.
    const size = cssSize(this.canvas) ?? { w: this.canvas.width, h: this.canvas.height };
    this.canvas.width = size.w;
    this.canvas.height = size.h;
    this.renderer.setSize(size.w, size.h, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    await this.renderer.init();

    // Init particles on GPU
    this.renderer.compute(this.computeInit);

    // ── Point cloud material using TSL ──────────────────────────────────────
    const geometry = new THREE_GPU.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE_GPU.Float32BufferAttribute(new Float32Array(PARTICLE_COUNT * 3), 3)
    );

    const material = new THREE_GPU.PointsNodeMaterial({ transparent: true, depthWrite: false });
    material.positionNode = this.positions.element(instanceIndex);
    material.sizeNode = float(5.0);

    // Ink-on-paper: graphite field that inks to blueprint blue under the cursor
    material.colorNode = Fn(() => {
      const pos = this.positions.element(instanceIndex);
      const ix = pos.x;
      const iz = pos.z;

      const toMouse = vec3(ix.sub(mousePos.x), float(0), iz.sub(mousePos.z));
      const mouseDist = toMouse.length();
      const t_cursor = select(mouseDist.lessThan(4.0), float(1.0).sub(mouseDist.div(4.0)), float(0.0));

      const baseColor = color(0xa9a4b8);
      const hotColor = color(0x1f3a93);
      return baseColor.mix(hotColor, t_cursor.mul(0.9));
    })();

    material.blending = THREE_GPU.NormalBlending;
    material.opacity = 0.62;

    const points = new THREE_GPU.Points(geometry, material);
    this.scene.add(points);

    // ── Ambient dust: one draw call, all motion in the vertex stage ─────────
    // Base positions live in a custom attribute so positionNode never reads back
    // into the built-in position it is defining.
    const DUST = 140;
    const dustGeo = new THREE_GPU.BufferGeometry();
    const dustBase = new Float32Array(DUST * 3);
    const dustSeed = new Float32Array(DUST);
    const dustScale = new Float32Array(DUST);
    for (let i = 0; i < DUST; i++) {
      dustBase[i * 3] = (Math.random() - 0.5) * 24;
      dustBase[i * 3 + 1] = Math.random() * 9;
      dustBase[i * 3 + 2] = (Math.random() - 0.5) * 18;
      dustSeed[i] = Math.random();
      dustScale[i] = 0.4 + Math.random() * 0.9;
    }
    dustGeo.setAttribute('position', new THREE_GPU.Float32BufferAttribute(new Float32Array(DUST * 3), 3));
    dustGeo.setAttribute('aBase', new THREE_GPU.Float32BufferAttribute(dustBase, 3));
    dustGeo.setAttribute('aSeed', new THREE_GPU.Float32BufferAttribute(dustSeed, 1));
    dustGeo.setAttribute('aScale', new THREE_GPU.Float32BufferAttribute(dustScale, 1));

    const dustMat = new THREE_GPU.PointsNodeMaterial({ transparent: true, depthWrite: false });

    // Slow rise with a fract() wrap through a 9-unit band, plus a per-mote sway.
    dustMat.positionNode = Fn(() => {
      const base = attribute('aBase', 'vec3');
      const seed = attribute('aSeed', 'float');
      const phase = fract(base.y.add(t.mul(0.06).add(seed.mul(9.0))).div(9.0));
      const sway = seed.mul(6.2831).add(t.mul(0.35)).sin().mul(0.35);
      return vec3(base.x.add(sway), phase.mul(9.0).sub(3), base.z);
    })();

    dustMat.sizeNode = Fn(() => attribute('aScale', 'float').mul(2.4))();

    // Fade at the band edges so motes dissolve instead of popping when they wrap.
    dustMat.opacityNode = Fn(() => {
      const base = attribute('aBase', 'vec3');
      const seed = attribute('aSeed', 'float');
      const phase = fract(base.y.add(t.mul(0.06).add(seed.mul(9.0))).div(9.0));
      return phase.mul(3.1416).sin().mul(0.42);
    })();

    dustMat.colorNode = Fn(() => {
      // Mostly graphite, a few motes inked blueprint so the field reads as brand, not noise.
      const seed = attribute('aSeed', 'float');
      return color(0xa9a4b8).mix(color(0x1f3a93), step(float(0.82), seed).mul(0.7));
    })();

    dustMat.blending = THREE_GPU.NormalBlending;

    this.scene.add(new THREE_GPU.Points(dustGeo, dustMat));

    // Ambient light
    const ambient = new THREE_GPU.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambient);

    this.clock = new THREE_GPU.Clock();
    this.renderer.setAnimationLoop(() => this._animate());
  }

  _animate() {
    if (this.disposed) return;
    const delta = Math.min(this.clock.getDelta(), 0.05);
    this.deltaTimeUniform.value = delta;
    this.timeUniform.value = this.clock.getElapsedTime();

    // Decay click strength
    if (this.clickStrengthUniform.value > 0.01) {
      this.clickStrengthUniform.value *= 0.97;
    }

    this.renderer.compute(this.computeUpdate);
    this.renderer.render(this.scene, this.camera);
  }

  setMouse(x, y) {
    if (this.mouseUniform) {
      this.mouseUniform.value.set(x, 0, y);
    }
  }

  triggerClick(x, y) {
    if (this.clickPositionUniform) {
      this.clickPositionUniform.value.set(x, 0, y);
      this.clickStrengthUniform.value = 1.0;
    }
  }

  /** 0..1 hero exit progress — dollies the rig back and lifts it as the section scrolls off. */
  setExit(p) {
    this.exit = p;
    if (!this.camera) return;
    this.camera.position.z = 11 + this.exit * 2.6;
    this.camera.position.y = 4.5 + this.exit * 1.6;
    this.camera.lookAt(0, -1, 0);
  }

  /** Stop the loop while the tab is hidden; a background GPU sim is pure waste. */
  setPaused(paused) {
    if (!this.renderer || this.disposed) return;
    this.renderer.setAnimationLoop(paused ? null : () => this._animate());
  }

  resize(w, h) {
    // A 0×0 swapchain is not a resize, it is a GPU error on every frame after it.
    if (!this.renderer || !this.camera || !(w > 0 && h > 0)) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    // updateStyle = false: the CSS classes own the box, three only owns the buffer.
    this.renderer.setSize(w, h, false);
  }

  dispose() {
    this.disposed = true;
    if (this.renderer) {
      this.renderer.setAnimationLoop(null);
      this.renderer.dispose();
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// WEBGPU CANVAS COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const WebGPUCanvas = () => {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // init() sizes the buffer itself, from the wrapper.
    const gpuScene = new WebGPUScene(canvas);
    sceneRef.current = gpuScene;

    // The camera rig only exists after init(), so the first measurement waits for it.
    let frame = 0;
    const measure = () => {
      frame = 0;
      const rect = canvas.getBoundingClientRect();
      const span = rect.height || window.innerHeight;
      gpuScene.setExit(Math.min(1, Math.max(0, -rect.top / span)));
    };
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(measure); };
    // A background GPU compute loop is pure waste — stop it when the tab hides.
    const onVisibility = () => gpuScene.setPaused(document.hidden);

    gpuScene.init()
      .then(() => { handleResize(); measure(); })
      .catch((err) => {
        console.warn('[WebGPU] Init failed:', err);
      });

    // Mouse tracking
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      const worldX = nx * 14;
      const worldZ = ny * 10;
      gpuScene.setMouse(worldX, worldZ);
    };

    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      gpuScene.triggerClick(nx * 14, ny * 10);
    };

    const handleResize = () => {
      const size = cssSize(canvas);
      if (size) gpuScene.resize(size.w, size.h);
    };

    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);
    window.addEventListener('resize', handleResize);
    // The window resize event misses a layout that changes without the window
    // changing — a sticky parent measured before it settled, for one. This does not.
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(handleResize) : null;
    if (canvas.parentElement) ro?.observe(canvas.parentElement);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      ro?.disconnect();
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      if (frame) window.cancelAnimationFrame(frame);
      gpuScene.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className='absolute inset-0 w-full h-full'
      style={{ display: 'block' }}
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT — auto-detects WebGPU availability
// ─────────────────────────────────────────────────────────────────────────────
export const InteractiveHeroBackground = () => {
  const [gpuMode, setGpuMode] = useState(null); // null = detecting, 'webgpu' | 'webgl'
  const wrapRef = useRef(null);
  const exit = useExitProgress(wrapRef);
  // WebGL path: stop the render loop while the tab is hidden.
  const [running, setRunning] = useState(true);

  useEffect(() => {
    const onVisibility = () => setRunning(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    const detect = async () => {
      try {
        if (!navigator.gpu) throw new Error('navigator.gpu not available');
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) throw new Error('No WebGPU adapter found');
        setGpuMode('webgpu');
      } catch {
        setGpuMode('webgl');
      }
    };
    detect();
  }, []);

  if (gpuMode === null) {
    // Still detecting — render nothing (prevents flash)
    return <div className='absolute inset-0 w-full h-full bg-paper' />;
  }

  return (
    <div ref={wrapRef} className='absolute inset-0 w-full h-full overflow-hidden pointer-events-auto'>
      {gpuMode === 'webgpu' ? (
        <WebGPUCanvas />
      ) : (
        <Canvas
          camera={{ position: [0, 4.5, 11], fov: 48 }}
          // 1.6 is plenty for a dot field; a 3x phone buffer buys nothing visible.
          dpr={[1, 1.6]}
          frameloop={running ? 'always' : 'never'}
          gl={{ antialias: true, alpha: true }}
          className='w-full h-full'
        >
          <ambientLight intensity={0.5} />
          <PerformanceMonitor ms={18} factor={1} />
          <AdaptiveDpr />
          <InteractiveTerrain exit={exit} />
          <FloatingDust />
        </Canvas>
      )}

      {/* Atmospheric ambient washes */}
      <div className='absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-blueprint/[0.07] blur-[150px] pointer-events-none' />
      <div className='absolute bottom-0 right-1/4 w-[550px] h-[550px] rounded-full bg-graphite/[0.06] blur-[150px] pointer-events-none' />

      {/* Renderer mode indicator */}
      <div className='absolute bottom-6 right-6 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-pill bg-surface/80 border border-rule font-mono text-eyebrow uppercase text-graphite pointer-events-none z-20'>
        <span className='w-1.5 h-1.5 rounded-full bg-blueprint animate-pulse' />
        {gpuMode === 'webgpu'
          ? 'WebGPU TSL · GPU compute · Move & click'
          : 'WebGL · Move mouse & click'}
      </div>
    </div>
  );
};

export default InteractiveHeroBackground;
