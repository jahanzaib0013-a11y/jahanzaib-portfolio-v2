import { memo, useEffect, useMemo, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'

import mascotUrl from '../../assets/models/mascot.glb'

/**
 * The mascot's plate: a small canvas that draws the GLB once and stops. The figure
 * itself never animates — his walk along the bottom edge is CSS — so frameloop is
 * 'demand': a static skinned mesh re-rendered at 60 Hz is the worst thing this
 * feature could do to a laptop.
 *
 * Two things here are not optional:
 *
 * 1. READ HIS BOUNDS BY HAND. Three caches the first bounding box it computes for a
 *    skinned mesh, and that one is in mesh-local space. measureFit drops the cache,
 *    forces a world-matrix pass and applies matrixWorld exactly once.
 *
 * 2. THE CAMERA LOOKS AT THE ORIGIN. R3F aims the default camera at (0,0,0), so the
 *    figure is lifted to be centred on the origin instead of standing on it.
 */

// Quantised + meshopt-compressed GLB, so the loader needs the decoder or the file
// fails to parse outright.
const loadGLB = (url) =>
  new Promise((resolve, reject) => {
    const loader = new GLTFLoader()
    loader.setMeshoptDecoder(MeshoptDecoder)
    loader.load(url, resolve, undefined, reject)
  })

// Height the figure is fitted to, in plate units. The frustum at camera z 3.2 and
// fov 30 is 1.715 tall, so 1.45 fills a 216px plate with air over his hair.
const TARGET_HEIGHT = 1.45

const CAMERA_Z = 3.2

// The asset is modelled looking down +x, so a quarter turn brings him round to face
// the camera. It goes on gltf.scene — the one ancestor every bone hangs under — which
// is what the skinning pass reads too, and what measureFit then measures with the turn
// already folded in. The file's own root carries an identity rotation, so nothing here
// has to be composed with anything authored.
const YAW = -Math.PI / 2

const measureFit = (scene) => {
  // updateMatrixWorld, not updateWorldMatrix: only the former reaches SkinnedMesh's
  // override, which is what puts the box in mesh-local space in the first place.
  scene.updateMatrixWorld(true)

  const box = new THREE.Box3()
  const local = new THREE.Box3()
  let measured = 0

  scene.traverse((obj) => {
    if (!obj.isSkinnedMesh) return
    obj.boundingBox = null // three caches it forever; force a fresh read
    obj.computeBoundingBox()
    local.copy(obj.boundingBox)
    local.applyMatrix4(obj.matrixWorld) // world space, exactly once
    box.union(local)
    measured += 1
  })

  // No skin in sight: fall back to the ordinary path, and say so in `measured`.
  if (!measured) box.setFromObject(scene)

  const size = box.getSize(new THREE.Vector3())
  const span = Math.max(size.x, size.y, size.z)

  return {
    scale: span > 0 ? TARGET_HEIGHT / span : 1,
    // The camera aims at the origin, so the middle of him goes there.
    lift: -(box.min.y + box.max.y) / 2,
    centerX: -(box.min.x + box.max.x) / 2,
    centerZ: -(box.min.z + box.max.z) / 2,
    measured,
    minY: Number(box.min.y.toFixed(4)),
    maxY: Number(box.max.y.toFixed(4)),
    spanX: Number(size.x.toFixed(4)),
    spanZ: Number(size.z.toFixed(4)),
  }
}

const MascotFigure = ({ gltf, fit, drawing }) => {
  const invalidate = useThree((s) => s.invalidate)
  const size = useThree((s) => s.size)

  // Demand mode draws nothing unless asked: the pixels change when the model arrives,
  // when the fit changes or when the canvas resizes. `drawing` is here because
  // invalidate() returns early while frameloop is still 'never'.
  useEffect(() => {
    invalidate()
  }, [gltf, fit, drawing, size, invalidate])

  return (
    <group scale={fit.scale}>
      <group position={[fit.centerX, fit.lift, fit.centerZ]}>
        <primitive object={gltf.scene} />
      </group>
    </group>
  )
}

const MascotCanvas = ({ onError }) => {
  const [gltf, setGltf] = useState(null)
  const [failed, setFailed] = useState(false)
  // A hidden tab cannot run rAF, so asking it for demand frames is wasted work.
  const [tabVisible, setTabVisible] = useState(true)

  useEffect(() => {
    let cancelled = false
    loadGLB(mascotUrl)
      .then((res) => {
        if (!cancelled) setGltf(res)
      })
      .catch((err) => {
        if (cancelled) return
        setFailed(true)
        onError?.(err)
      })
    return () => {
      cancelled = true
    }
  }, [onError])

  useEffect(() => {
    const onVisibility = () => setTabVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  const prepared = useMemo(() => {
    if (!gltf) return null

    gltf.scene.rotation.y = YAW
    const fit = measureFit(gltf.scene)

    let verts = 0
    let tris = 0
    gltf.scene.traverse((obj) => {
      if (!obj.isMesh) return
      // Culling would use the very box this file cannot trust three to compute.
      obj.frustumCulled = false
      const geo = obj.geometry
      const mat = obj.material
      verts += geo.attributes.position.count
      tris += (geo.index ? geo.index.count : geo.attributes.position.count) / 3
      if (mat.map) mat.map.colorSpace = THREE.SRGBColorSpace
      mat.needsUpdate = true
    })

    return { fit, stats: { verts, tris: Math.round(tris) } }
  }, [gltf])

  // DEV handshake, assertable without a rendered frame.
  const spec = useMemo(
    () =>
      prepared && {
        fit: {
          scale: Number(prepared.fit.scale.toFixed(4)),
          lift: Number(prepared.fit.lift.toFixed(4)),
          minY: prepared.fit.minY,
          maxY: prepared.fit.maxY,
          spanX: prepared.fit.spanX,
          spanZ: prepared.fit.spanZ,
          measured: prepared.fit.measured,
        },
        verts: prepared.stats.verts,
        tris: prepared.stats.tris,
        drawing: false,
      },
    [prepared],
  )

  const drawing = tabVisible && !!prepared

  useEffect(() => {
    if (!import.meta.env.DEV || !spec) return undefined
    window.__mascot3d = spec
    return () => {
      if (window.__mascot3d === spec) delete window.__mascot3d
    }
  }, [spec])

  useEffect(() => {
    if (spec) spec.drawing = drawing
  }, [spec, drawing])

  // Every hook above has to run on every render, so the failure exit comes last.
  if (failed) return null

  return (
    <div className='mascot-plate'>
      <Canvas
        frameloop={drawing ? 'demand' : 'never'}
        camera={{ position: [0, 0, CAMERA_Z], fov: 30 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
        // R3F forwards gl props to the renderer constructor, which ignores exposure,
        // so it has to be set here. His baked texture is darker than the hero's.
        onCreated={({ gl }) => {
          gl.toneMappingExposure = 1.25
        }}
        style={{ background: 'transparent' }}
      >
        {/* Same procedural studio wrap as the hero: no HDR download, rendered once. */}
        <Environment frames={1} resolution={128} background={false}>
          <Lightformer intensity={2.2} position={[0, 2, 4]} scale={[6, 3, 1]} color='#ffffff' />
          <Lightformer intensity={1.6} position={[4, 0, 2]} scale={[3, 4, 1]} color='#f2f0f7' />
          <Lightformer intensity={0.6} position={[-4, -1, 2]} scale={[3, 4, 1]} color='#dcd9e6' />
        </Environment>
        {/* Key / fill / rim on a front-facing subject: the key comes in high and to
            his right for a three-quarter model, the fill opens the shadow side, and
            the rim sits behind him to separate the hair from the page. */}
        <ambientLight intensity={0.45} />
        <hemisphereLight args={['#ffffff', '#c9c6d4', 0.6]} />
        <directionalLight position={[3.5, 3, 4]} intensity={2.4} />
        <directionalLight position={[-2.5, 0, 4]} intensity={0.9} color='#e8e6f0' />
        <directionalLight position={[-1, 2, -4]} intensity={1.2} color='#ffffff' />
        {prepared && <MascotFigure gltf={gltf} fit={prepared.fit} drawing={drawing} />}
      </Canvas>
    </div>
  )
}

export default memo(MascotCanvas)
