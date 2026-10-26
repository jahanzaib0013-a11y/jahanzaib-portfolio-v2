import insightflow from '../assets/thumbs/insightflow.png'
import auracover from '../assets/thumbs/auracover.png'
import decorum from '../assets/thumbs/decorum.png'
import littleluxuries from '../assets/thumbs/littleluxuries.png'
import coverLlm from '../assets/blog/cover-llm.png'
import coverPayments from '../assets/blog/cover-payments.png'
import jahanzaib from '../assets/jahanzaib.png'

import insightflowVideo from '../assets/videos/insightflow.webm'
import littleluxuriesVideo from '../assets/videos/littleluxuries.webm'

/**
 * Section plates for <ScrollStage />.
 *
 * `id` must match the SectionWrapper id of the section it sits behind.
 *
 * Three ways to feed a plate, in priority order — the component picks the best
 * available per stage and degrades on its own:
 *
 *   frameCount  Transition stills in public/stages/<id>/frame-001.webp … frame-NNN.webp
 *               (frameExt overrides the extension, default webp). Scroll position
 *               chooses the frame, so scrolling up rewinds the motion. Pipeline:
 *               still A + still B → video tool (Kling / Runway / Pika, first frame
 *               + last frame) → clip → cut it into stills:
 *                 ffmpeg -i clip.mp4 -vf "fps=4,scale=1152:-2" -c:v libwebp \
 *                        -quality 60 "public/stages/<id>/frame-%03d.webp"
 *               A few dozen wide stills scrub smoother than any seek and need no
 *               decoder, which is why the first section uses this mode.
 *   video       A single clip. Wide screens scrub it through currentTime; narrow
 *               ones loop it instead — the recorded product demos already in the
 *               repo work here today.
 *   poster      A still plate with a slow progress-driven zoom. Always the fallback,
 *               and the only mode on reduced-motion or save-data screens.
 *
 *   pxPerFrame  Sequence plates only: the scroll budget one frame gets. The scrub
 *               distance is derived from it — (frameCount - 1) * pxPerFrame — so the
 *               stills can never be spread over a distance shorter than they need.
 *               At 100px one mouse notch advances exactly one frame; below that a
 *               notch skips frames the clip was generated to show.
 *
 *   scrubPx     Optional (non-sequence plates): pixels of scroll the plate runs
 *               over. Shorter than the section means the plate finishes early and
 *               holds on its last frame, so a little scroll moves the whole picture.
 *
 *               With a crossfading renderer (the hero's <TheaterScreen />) a notch
 *               may span several frames: the playhead eases through every one of
 *               them and blends between neighbours, so a smaller budget is smoother,
 *               not skippier.
 *
 *   leadPx      Sequence plates with a pin: scroll that holds the block on frame
 *               one before the film starts — the house lights going down.
 *
 *   tailPx      Sequence plates with a pin: extra scroll that holds the block still
 *               after the last frame lands, before the section lets go. The pin
 *               distance is always lead + scrub + tail, so the sequence can never
 *               outrun the hold or be cut short by it. The hero derives its tail
 *               from three beats instead:
 *                 washPx  the closing frame blurs and whitens while the lights
 *                         come back up and the copy turns dark again;
 *                 cardPx  the 3D specimen card arrives;
 *                 holdPx  nothing moves — a moment to play with the card before
 *                         the page carries on.
 *
 *   veil        How much paper sits between this plate and the copy, 0–1. The
 *               default 0.78 is tuned for dense sections; a plate that has been
 *               generated for the page earns a thinner veil, because a sequence
 *               nobody can see is worse than no sequence at all.
 *
 *   pin         Optional remote still (a Pinterest i.pinimg.com URL) used instead of
 *               `poster`, requested with referrerPolicy="no-referrer" and silently
 *               replaced by `poster` if the hotlink ever 403s or expires. Keep the
 *               rights with the file: this is a public career portfolio.
 */
const PLATES = [
  {
    // The hero is the one plate the reader watches instead of reads past, so it is
    // the only one that is pinned: the opening screen holds while the house lights
    // go down, the film runs, and the lights come back up — then it lets go.
    id: 'hero',
    caption: 'Studio · generated sequence',
    poster: jahanzaib,
    pin: '',
    // The Grok clip at its native rate: every one of its 145 frames (6.04 s at
    // 24 fps, 752×416), never upscaled — the source has no more detail to give.
    // <TheaterScreen /> crossfades neighbours, so the scrub is continuous between
    // frames as well as across them.
    frameCount: 145,
    frameWidth: 752,
    frameHeight: 416,
    pxPerFrame: 20,
    leadPx: 220,
    washPx: 320,
    cardPx: 260,
    holdPx: 1000,
    veil: 0.62,
  },
  {
    id: 'about',
    caption: 'Engineering focus · portrait plate',
    poster: jahanzaib,
    pin: '',
    frameCount: 0,
  },
  {
    id: 'architecture',
    caption: 'InsightFlow · system walkthrough',
    poster: insightflow,
    pin: '',
    video: insightflowVideo,
    frameCount: 0,
  },
  {
    id: 'tech',
    caption: 'AuraCover · interface study',
    poster: auracover,
    pin: '',
    frameCount: 0,
  },
  {
    id: 'experience',
    caption: 'Decorum · field plate',
    poster: decorum,
    pin: '',
    frameCount: 0,
  },
  {
    id: 'work',
    caption: 'LittleLuxuries · recorded demo',
    poster: littleluxuries,
    pin: '',
    video: littleluxuriesVideo,
    frameCount: 0,
  },
  {
    id: 'blog',
    caption: 'Writing · cover plate',
    poster: coverLlm,
    pin: '',
    frameCount: 0,
  },
  {
    id: 'contact',
    caption: 'Closing · payments cover',
    poster: coverPayments,
    pin: '',
    frameCount: 0,
  },
]

/**
 * `scrubPx` and `pinPx` are derived, not authored. A sequence gets one frame per
 * `pxPerFrame`, and the hold gets that distance plus a tail on the closing frame —
 * so the number of stills on disk and the scroll they live in can never drift apart
 * when a clip is re-cut with a different frame count.
 *
 * 100px is roughly one mouse notch in Chrome. A renderer that only swaps stills needs
 * that much per frame or a notch skips one; the crossfading theater does not, since
 * it eases through and blends every frame a notch covers.
 */
const withDistances = (plate) => {
  if (!plate.pxPerFrame) return plate
  const scrubPx = (plate.frameCount - 1) * plate.pxPerFrame
  const leadPx = plate.leadPx ?? 0
  const tailPx =
    plate.tailPx ?? (plate.washPx ?? 0) + (plate.cardPx ?? 0) + (plate.holdPx ?? 0)
  return { ...plate, leadPx, scrubPx, tailPx, pinPx: leadPx + scrubPx + tailPx }
}

export const stagePlates = PLATES.map(withDistances)

export default stagePlates
