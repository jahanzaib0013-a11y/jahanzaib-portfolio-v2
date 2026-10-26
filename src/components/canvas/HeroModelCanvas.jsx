import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  AdaptiveDpr,
  Center,
  Environment,
  Lightformer,
  PerformanceMonitor,
} from '@react-three/drei'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'

import { damp, useExitProgress, useWindowPointer } from './lib/motion'
import heroAvatarUrl from '../../assets/models/hero-avatar.glb'

// Facing of the scan, in radians. The Tripo export is authored facing +X, so a
// quarter turn to the right brings the nose around to the camera at +Z.
const BASE_YAW = -Math.PI / 2

// How far the head tracks the cursor. Kept inside ~±22° of the authored facing,
// so the back of the scan can never swing into view however the pointer moves.
const FOLLOW_YAW = 0.38
const FOLLOW_PITCH = 0.22
const FOLLOW_RATE = 5.5

// Scroll exit choreography: the plate dollies back and turns a few degrees as the
// hero leaves the viewport, so the section hands off instead of just scrolling away.
const EXIT_DOLLY = 1.0
const EXIT_LIFT = 0.45
const EXIT_TURN = 0.3

const REVEAL_SECONDS = 1.15

// Quantised + meshopt-compressed GLB, so the stock GLTFLoader needs the decoder wired in.
const loadGLB = (url) =>
  new Promise((resolve, reject) => {
    const loader = new GLTFLoader()
    loader.setMeshoptDecoder(MeshoptDecoder)
    loader.load(url, resolve, undefined, reject)
  })

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)

const Avatar = ({ gltf, reducedMotion, exit, onSpecs }) => {
  const group = useRef()
  const pointer = useWindowPointer()
  const gl = useThree((state) => state.gl)

  // Clipping planes live in world space, so the reveal window is measured off the
  // framed scene; the wireframe is stored in group-local space so it turns with
  // the head instead of sitting around it.
  const bounds = useRef({ min: -1.2, max: 1.2 })
  const clip = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), 0), [])
  const reveal = useRef(reducedMotion ? 1 : 0)
  const startedAt = useRef(null)
  const scanRef = useRef()
  const wireframe = useRef()

  // Normalise scale: Tripo exports vary in size, fit whatever arrives to the plate.
  const scale = useMemo(() => {
    const box = new THREE.Box3().setFromObject(gltf.scene)
    const size = box.getSize(new THREE.Vector3())
    const span = Math.max(size.x, size.y, size.z)
    return span > 0 ? 2.4 / span : 1
  }, [gltf])

  // Hairline construction box + the rectangle that rides the cut while building.
  const wireBox = useMemo(() => new THREE.Box3Helper(new THREE.Box3(), new THREE.Color('#1f3a93')), [])
  const scanGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(4 * 3), 3))
    return geometry
  }, [])

  useEffect(() => {
    let verts = 0
    let tris = 0
    let texture = 0
    gltf.scene.traverse((obj) => {
      if (!obj.isMesh) return
      const mat = obj.material
      const geo = obj.geometry
      verts += geo.attributes.position.count
      tris += (geo.index ? geo.index.count : geo.attributes.position.count) / 3
      // Base colour is authored in sRGB; the rest of the material reads the
      // procedural studio wrap below so metallic areas don't render black.
      if (mat.map) {
        mat.map.colorSpace = THREE.SRGBColorSpace
        texture = Math.max(texture, mat.map.image?.width || 0)
      }
      mat.envMapIntensity = 0.9
      mat.clippingPlanes = reducedMotion ? [] : [clip]
      mat.needsUpdate = true
    })
    onSpecs?.({ verts, tris, texture })
  }, [gltf, clip, onSpecs, reducedMotion])

  // The hero film ends by handing the stage to this card; re-run the build so its
  // entrance is the scan assembling itself again, not a card that was always there.
  useEffect(() => {
    if (reducedMotion) return
    const rescan = () => {
      if (reveal.current < 1) return
      gltf.scene.traverse((obj) => {
        if (obj.isMesh) obj.material.clippingPlanes = [clip]
      })
      reveal.current = 0
      startedAt.current = null
    }
    window.addEventListener('hero:rescan', rescan)
    return () => window.removeEventListener('hero:rescan', rescan)
  }, [gltf, clip, reducedMotion])

  useEffect(() => {
    gl.localClippingEnabled = true
    return () => {
      gl.localClippingEnabled = false
    }
  }, [gl])

  // The cut window and the wireframe are measured on the first rendered frame,
  // not in an effect: that is the first moment the group scale, <Center>'s
  // re-centring and every parent matrixWorld are guaranteed to be current — and
  // the pose is still exactly at rotation 0, so world box ÷ scale is the local box.
  const measured = useRef(false)
  const measure = () => {
    const g = group.current
    g.updateMatrixWorld(true)
    const world = new THREE.Box3().setFromObject(gltf.scene)
    bounds.current = { min: world.min.y - 0.05, max: world.max.y + 0.05 }
    wireBox.box.min.copy(world.min).divideScalar(scale)
    wireBox.box.max.copy(world.max).divideScalar(scale)
    wireBox.material.transparent = true
    wireBox.material.depthWrite = false
    wireBox.material.opacity = 0
    wireBox.updateMatrixWorld(true)
    measured.current = true

    if (import.meta.env.DEV) {
      // Handshake for headless checks: reveal progress, the cut window and the wire
      // frame opacity, without needing a screenshot.
      window.__hero = { reveal, bounds, wireBox, clip, scale, world }
    }
  }

  useFrame((state, delta) => {
    if (!group.current) return
    if (!measured.current) measure()
    const dt = Math.min(delta, 0.05)
    const g = group.current

    // ── build reveal ────────────────────────────────────────────────────────
    if (reveal.current < 1) {
      if (startedAt.current === null) startedAt.current = state.clock.elapsedTime
      const t = Math.min(1, (state.clock.elapsedTime - startedAt.current) / REVEAL_SECONDS)
      reveal.current = reducedMotion ? 1 : easeOutCubic(t)
      if (reveal.current >= 1) {
        // Finished: drop the clip so the completed scan renders clean.
        g.traverse((obj) => {
          if (obj.isMesh) obj.material.clippingPlanes = []
        })
      }
    }
    const cutY = THREE.MathUtils.lerp(bounds.current.min, bounds.current.max, reveal.current)
    clip.constant = cutY

    if (scanRef.current) {
      const building = reveal.current < 1
      scanRef.current.visible = building
      if (building) {
        // Footprint shrinks as the cut climbs the bust.
        const half = THREE.MathUtils.lerp(0.95, 0.25, reveal.current)
        const attr = scanRef.current.geometry.attributes.position
        attr.setXYZ(0, -half, 0, -half * 0.7)
        attr.setXYZ(1, half, 0, -half * 0.7)
        attr.setXYZ(2, half, 0, half * 0.7)
        attr.setXYZ(3, -half, 0, half * 0.7)
        attr.needsUpdate = true
        scanRef.current.position.y = cutY / scale
        scanRef.current.material.opacity = 0.6 * (1 - reveal.current)
      }
    }

    if (wireBox.material) {
      wireBox.material.opacity = damp(wireBox.material.opacity, reveal.current >= 1 ? 0.15 : 0, 3, dt)
      wireBox.visible = wireBox.material.opacity > 0.01
    }

    // ── pose ───────────────────────────────────────────────────────────────
    const p = exit.current
    const sway = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.5) * 0.04
    const targetYaw =
      BASE_YAW + (reducedMotion ? 0 : pointer.current.x * FOLLOW_YAW) + sway + p * EXIT_TURN
    const targetPitch = reducedMotion ? 0 : pointer.current.y * FOLLOW_PITCH
    g.rotation.y = damp(g.rotation.y, targetYaw, FOLLOW_RATE, dt)
    g.rotation.x = damp(g.rotation.x, targetPitch, FOLLOW_RATE, dt)

    const cam = state.camera
    cam.position.z = damp(cam.position.z, 5 + p * EXIT_DOLLY, 4, dt)
    cam.position.y = damp(cam.position.y, p * EXIT_LIFT, 4, dt)
  })

  return (
    <group ref={group} scale={scale}>
      <Center>
        <primitive object={gltf.scene} />
      </Center>
      <primitive ref={wireframe} object={wireBox} />
      <lineLoop ref={scanRef} geometry={scanGeometry} visible={false}>
        <lineBasicMaterial color='#1f3a93' transparent opacity={0.6} depthWrite={false} />
      </lineLoop>
    </group>
  )
}

const HeroModelCanvas = ({ reducedMotion = false, onError, onSpecs }) => {
  const [gltf, setGltf] = useState(null)
  const [failed, setFailed] = useState(false)
  const plateRef = useRef(null)
  const exit = useExitProgress(plateRef)

  useEffect(() => {
    let cancelled = false
    loadGLB(heroAvatarUrl)
      .then((res) => { if (!cancelled) setGltf(res) })
      .catch((err) => {
        if (cancelled) return
        setFailed(true)
        onError?.(err)
      })
    return () => { cancelled = true }
  }, [onError])

  if (failed) return null

  return (
    <div ref={plateRef} className='relative w-full aspect-square'>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 34 }}
        // Upper bound on resolution; AdaptiveDpr drops below it if frames slip.
        dpr={[1, 1.75]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'low-power',
          // Keeps the buffer readable for in-dev frame inspection; off in production.
          preserveDrawingBuffer: !!import.meta.env.DEV,
        }}
        style={{ background: 'transparent' }}
      >
        {/* Procedural studio wrap — no HDR download, rendered once. */}
        <Environment frames={1} resolution={128} background={false}>
          <Lightformer intensity={2.4} position={[0, 2, 4]} scale={[6, 3, 1]} color='#ffffff' />
          <Lightformer intensity={1.1} position={[-4, 0, 2]} scale={[3, 4, 1]} color='#e8e6f0' />
          <Lightformer intensity={0.8} position={[4, -1, 2]} scale={[3, 4, 1]} color='#dcd9e6' />
        </Environment>
        <ambientLight intensity={0.55} />
        <hemisphereLight args={['#ffffff', '#c9c6d4', 0.7]} />
        <directionalLight position={[2.5, 3, 4]} intensity={1.35} />
        <directionalLight position={[-3, -1, -2]} intensity={0.4} />
        {/* Frame-time watchdog: ~18 ms budget, then shed resolution instead of stuttering. */}
        <PerformanceMonitor ms={18} factor={1} />
        <AdaptiveDpr />
        {gltf && <Avatar gltf={gltf} reducedMotion={reducedMotion} exit={exit} onSpecs={onSpecs} />}
      </Canvas>
    </div>
  )
}

export default HeroModelCanvas
