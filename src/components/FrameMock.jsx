/**
 * FrameMock — designed placeholder art, drawn in JSX instead of shipped as a
 * file. Three frames carry the house identity where a real screenshot or video
 * doesn't exist yet:
 *
 *   browser    a hairline app chrome with a seeded generative dashboard inside
 *   terminal   a night-colored console playing a deterministic trace
 *   blueprint  the drawing sheet itself: grid, nodes, connectors, dimension ticks
 *
 * Everything renders from the `seed` string, so re-renders never jump, and a
 * real asset later replaces the whole node with one line of data.
 */

// A tiny deterministic hash — no dependency, no randomness across renders.
const hash = (str, salt = 0) => {
  let h = 2166136261 ^ salt
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const rand = (str, salt) => (hash(str, salt) % 1000) / 1000

const Bars = ({ seed }) => (
  <div className='flex items-end gap-1.5 h-full'>
    {Array.from({ length: 9 }, (_, i) => (
      <span
        key={i}
        className={`w-2 rounded-sm ${i % 3 === 2 ? 'bg-blueprint/30' : 'bg-ink/10'}`}
        style={{ height: `${28 + rand(seed, i + 7) * 68}%` }}
      />
    ))}
  </div>
)

const BrowserMock = ({ seed, url }) => (
  <div className='h-full w-full flex flex-col bg-paper'>
    {/* Chrome */}
    <div className='flex items-center gap-3 px-4 h-9 border-b border-rule bg-surface shrink-0'>
      <span className='flex gap-1.5' aria-hidden='true'>
        <span className='w-2 h-2 rounded-full bg-rule' />
        <span className='w-2 h-2 rounded-full bg-rule' />
        <span className='w-2 h-2 rounded-full bg-rule' />
      </span>
      <span className='flex-1 truncate rounded-pill bg-paper border border-rule px-3 py-0.5 font-mono text-[0.625rem] text-mute'>
        {url ?? `${seed}.app`}
      </span>
    </div>
    {/* Seeded dashboard */}
    <div className='flex-1 grid grid-cols-[1fr_2fr] gap-3 p-4 min-h-0'>
      <div className='flex flex-col gap-2.5'>
        {[0, 1, 2].map((i) => (
          <div key={i} className='rounded-md bg-surface border border-rule p-2.5 flex-1'>
            <span className='block h-1.5 w-2/3 rounded-full bg-ink/10' />
            <span
              className='mt-2 block font-mono text-[0.625rem] text-blueprint/70 tabular-nums'
            >
              {Math.round(40 + rand(seed, i) * 950)}
              {['%', 'ms', 'rps'][i]}
            </span>
          </div>
        ))}
      </div>
      <div className='rounded-md bg-surface border border-rule p-3 flex flex-col min-h-0'>
        <span className='block h-1.5 w-1/3 rounded-full bg-ink/10 mb-2' />
        <div className='flex-1 min-h-0'>
          <Bars seed={seed} />
        </div>
      </div>
    </div>
  </div>
)

const TerminalMock = ({ seed, lines }) => {
  const trace = lines ?? [
    `POST /webhook  ${Math.round(120 + rand(seed, 1) * 240)}ms  ✓`,
    `enqueue sqs.fifo  dedup=${seed.slice(0, 6)}  ✓`,
    `lambda worker  batch=${Math.round(2 + rand(seed, 2) * 9)}  ✓`,
    `ledger.commit  penny-exact  ✓`,
    `recon nightly  drift 0.00%  ✓`,
  ]
  return (
    <div className='h-full w-full bg-night px-5 py-4 font-mono text-[0.6875rem] leading-relaxed overflow-hidden'>
      {trace.map((l, i) => (
        <p key={i} className='truncate'>
          <span className='text-night-ink/40 select-none'>$ </span>
          <span className={l.includes('✓') ? 'text-ok' : 'text-night-soft'}>{l}</span>
        </p>
      ))}
      <p className='text-night-accent'>
        $ <span className='caret-blink inline-block w-2 h-3 align-middle bg-night-accent/70' />
      </p>
    </div>
  )
}

const BlueprintMock = ({ seed }) => {
  // Four nodes on a 12×8 lattice, chained left-to-right.
  const nodes = Array.from({ length: 4 }, (_, i) => ({
    x: 12 + ((hash(seed, i) % 78) | 0) + i * 4,
    y: 14 + (hash(seed, i + 30) % 56),
  }))
  return (
    <svg viewBox='0 0 120 84' className='h-full w-full bg-paper' aria-hidden='true'>
      {/* Grid */}
      {Array.from({ length: 11 }, (_, i) => (
        <line key={`v${i}`} x1={10 + i * 10} y1='6' x2={10 + i * 10} y2='78' stroke='#1f3a93' strokeOpacity='0.08' strokeWidth='0.3' />
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <line key={`h${i}`} x1='6' y1={10 + i * 11} x2='114' y2={10 + i * 11} stroke='#1f3a93' strokeOpacity='0.08' strokeWidth='0.3' />
      ))}
      {/* Connectors */}
      {nodes.slice(1).map((n, i) => {
        const p = nodes[i]
        return (
          <path
            key={i}
            d={`M ${p.x} ${p.y} H ${(p.x + n.x) / 2} V ${n.y} H ${n.x}`}
            fill='none'
            stroke='#1f3a93'
            strokeOpacity='0.55'
            strokeWidth='0.5'
            strokeDasharray='2 1.4'
          />
        )
      })}
      {/* Nodes */}
      {nodes.map((n, i) => (
        <g key={i}>
          <rect x={n.x - 4} y={n.y - 3} width='8' height='6' fill='#eaeefb' stroke='#1f3a93' strokeWidth='0.45' rx='0.6' />
          <text x={n.x} y={n.y + 1} textAnchor='middle' fontFamily='IBM Plex Mono, monospace' fontSize='2.6' fill='#1f3a93'>
            {`0${i + 1}`}
          </text>
        </g>
      ))}
      {/* Dimension ticks, bottom-right like a drawing sheet */}
      <line x1='92' y1='80' x2='114' y2='80' stroke='#6e6b7b' strokeWidth='0.3' />
      <line x1='92' y1='79' x2='92' y2='81' stroke='#6e6b7b' strokeWidth='0.3' />
      <line x1='114' y1='79' x2='114' y2='81' stroke='#6e6b7b' strokeWidth='0.3' />
    </svg>
  )
}

const FrameMock = ({ variant = 'browser', seed = 'frame', url, lines, className = '' }) => (
  // The shell carries no chrome of its own — callers frame it (rounded/border)
  // or let it bleed, e.g. the wipe rows behind the About list.
  <div className={`aspect-[16/10] overflow-hidden ${className}`} role='img' aria-label={`${variant} concept frame`}>
    {variant === 'browser' && <BrowserMock seed={seed} url={url} />}
    {variant === 'terminal' && <TerminalMock seed={seed} lines={lines} />}
    {variant === 'blueprint' && <BlueprintMock seed={seed} />}
  </div>
)

export default FrameMock
