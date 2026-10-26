/**
 * Mascot GLB optimizer — build-time only, never shipped to the browser.
 *
 *     npm run mascot
 *
 * The Tripo auto-rig arrives at 8.2 MB. Measured from the file, not guessed:
 * a 5.29 MB normal map, a 2.28 MB baseColor, a 0.41 MB metallic-roughness map.
 * The first and last are invisible on a 240px character on a near-white page,
 * and the middle one only needs to match the sprite's device pixels. Dropping
 * two, shrinking one, lightening the mesh and re-emitting in the same
 * quantized + meshopt-compressed shape lands it at ~376 KB.
 *
 * What it deliberately does NOT do:
 *
 *  - Touch the skeleton. All 65 joint nodes stay. Skin indices are *node*
 *    indices, so pruning a bone would silently corrupt the skin — the weight
 *    comes from textures and triangles only.
 *  - Run prune(). It is one of those transforms that removes "unused" nodes,
 *    and an auto-rig's bone chain is exactly the kind of thing it can decide
 *    it does not need.
 *  - Add a native dependency. Everything here is JS or wasm, so the script
 *    survives a fresh clone on any machine.
 */

import { statSync } from 'node:fs'
import { NodeIO } from '@gltf-transform/core'
import { EXTMeshoptCompression, KHRMeshQuantization } from '@gltf-transform/extensions'
import { weld, simplify, meshopt } from '@gltf-transform/functions'
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer'
import { Jimp } from 'jimp'

// ── arguments ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2)

const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i === -1 ? fallback : args[i + 1]
}

const IN = flag('in', 'scripts/mascot-work/source.glb')
const OUT = flag('out', 'src/assets/models/mascot.glb')
const TEX = Number(flag('tex', 384))
const TRIS = Number(flag('tris', 8000))
const MAX_KB = Number(flag('max-kb', 500))

// ── helpers ──────────────────────────────────────────────────────────────────
const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`

/** Total triangles across every primitive, so the budget is measured, not guessed. */
const countTris = (doc) =>
  doc
    .getRoot()
    .listMeshes()
    .reduce(
      (total, mesh) =>
        total +
        mesh.listPrimitives().reduce((sum, prim) => {
          const indices = prim.getIndices()
          return sum + (indices ? indices.getCount() / 3 : 0)
        }, 0),
      0,
    )

const kbOf = (path) => {
  try {
    return statSync(path).size
  } catch {
    return 0
  }
}

// ── main ─────────────────────────────────────────────────────────────────────
// The three meshopt modules load their wasm lazily; using them before `ready`
// resolves throws, so all three are awaited up front.
await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready, MeshoptSimplifier.ready])

const io = new NodeIO()
  .registerExtensions([EXTMeshoptCompression, KHRMeshQuantization])
  .registerDependencies({
    'meshopt.decoder': MeshoptDecoder,
    'meshopt.encoder': MeshoptEncoder,
  })

const doc = await io.read(IN)
const root = doc.getRoot()

const inBytes = kbOf(IN)
const trisIn = countTris(doc)
const jointsIn = root.listNodes().filter((n) => n.getName().startsWith('mixamorig:')).length

console.log(`in     ${kb(inBytes)}  ${trisIn} tris  ${jointsIn} mixamorig joints  ${root.listAccessors().length} accessors`)
console.log(`       ${root.listAnimations().length} animation clip(s) — a run cycle is authored at runtime`)

// ── 1. textures ──────────────────────────────────────────────────────────────
// Drop the maps that cost 7.6 MB and buy nothing at this size, then stand the
// metallic-roughness map in with flat constants. Roughness 0.82 keeps the
// leather vest from reading as wet plastic once its ORM map is gone.
const dropped = []

for (const mat of root.listMaterials()) {
  for (const [label, getter, setter] of [
    ['normal', mat.getNormalTexture, mat.setNormalTexture],
    ['metallicRoughness', mat.getMetallicRoughnessTexture, mat.setMetallicRoughnessTexture],
    ['occlusion', mat.getOcclusionTexture, mat.setOcclusionTexture],
    ['emissive', mat.getEmissiveTexture, mat.setEmissiveTexture],
  ]) {
    const texture = getter.call(mat)
    if (!texture) continue
    setter.call(mat, null)
    // detach() would clear the material's reference but leave the image in
    // doc.listTextures() and therefore in the output. dispose() removes both
    // directions, which is the only way the 7.6 MB actually disappears.
    texture.dispose()
    dropped.push(label)
  }

  mat.setMetallicFactor(0)
  mat.setRoughnessFactor(0.82)

  const baseColor = mat.getBaseColorTexture()
  if (!baseColor) continue

  const image = baseColor.getImage()
  if (!image) continue

  const jimp = await Jimp.read(Buffer.from(image))
  const span = Math.max(jimp.width, jimp.height)

  if (span > TEX) {
    // Preserve aspect; a square atlas stays square, a strip stays a strip.
    const scale = TEX / span
    const w = Math.max(1, Math.round(jimp.width * scale))
    const h = Math.max(1, Math.round(jimp.height * scale))
    jimp.resize({ w, h })

    const encoded = await jimp.getBuffer('image/jpeg', { quality: 80 })
    baseColor.setImage(new Uint8Array(encoded))
    baseColor.setMimeType('image/jpeg')
    console.log(`baseColor ${jimp.width}x${jimp.height} -> ${kb(encoded.length)} (was ${kb(image.length)})`)
  } else {
    console.log(`baseColor ${span}px already within budget, left untouched`)
  }
}

console.log(`dropped ${dropped.length} texture map(s): ${dropped.join(', ') || 'none'}`)

// ── 2. geometry ──────────────────────────────────────────────────────────────
// weld() first: the simplifier needs an indexed, shared-vertex mesh, and Tripo
// exports split vertices per face. Simplification is attempted, not insisted
// on — a skinned mesh is a legitimate reason for the simplifier to refuse, and
// 18.7k triangles is survivable where 8 MB never was.
try {
  await doc.transform(
    weld(),
    simplify({
      simplifier: MeshoptSimplifier,
      ratio: Math.min(1, TRIS / Math.max(1, trisIn)),
      error: 0.001,
    }),
  )
  console.log(`simplified ${trisIn} -> ${countTris(doc)} tris`)
} catch (error) {
  console.warn(`simplify skipped (${error.message}) — shipping ${trisIn} tris`)
}

// ── 3. recompress ────────────────────────────────────────────────────────────
// meshopt() reorders and quantizes internally before encoding, which is what
// produced the extensionsRequired pair on the input file. Emitting the same
// shape keeps the runtime loader identical to the hero's.
await doc.transform(meshopt({ encoder: MeshoptEncoder, level: 'medium' }))

await io.write(OUT, doc)

const size = kbOf(OUT)
const trisOut = countTris(doc)

console.log(`out    ${kb(size)}  ${trisOut} tris  -> ${OUT}`)

if (size > MAX_KB * 1024) {
  console.error(`OVER BUDGET: ${kb(size)} exceeds ${MAX_KB} KB. Lower --tex or --tris.`)
  process.exit(1)
}

// Guard the one assumption every later task makes: the bones are all still there.
const jointsOut = doc.getRoot().listNodes().filter((n) => n.getName().startsWith('mixamorig:')).length
if (jointsOut !== jointsIn) {
  console.error(`BONE LOSS: ${jointsIn} -> ${jointsOut}. The skin would be corrupt.`)
  process.exit(1)
}

console.log(`ok — budget ${MAX_KB} KB, joints intact (${jointsOut})`)
