import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionWrapper } from '../hoc';
import SectionHead from './SectionHead';
import Reveal from './Reveal';
import CountUp from './CountUp';

const ARCHITECTURES = [
  {
    id: 'rag',
    title: 'Production RAG Pipeline',
    tag: 'AI / Vector DB',
    description: 'High-precision retrieval-augmented generation with semantic re-ranking and grounded citations.',
    metrics: [
      { label: 'Retrieval Precision', val: '94.2%' },
      { label: 'Avg Latency', val: '240ms' },
      { label: 'Chunking Strategy', val: 'Recursive 512t' },
    ],
    nodes: [
      { step: '01', title: 'Doc Ingestion', desc: 'Recursive token chunking & metadata enrichment', badge: 'FastAPI' },
      { step: '02', title: 'Vector Embeddings', desc: 'Text-embedding-3-small (1536 dims)', badge: 'OpenAI' },
      { step: '03', title: 'Hybrid Retrieval', desc: 'Dense vector + BM25 keyword search', badge: 'pgvector / Supabase' },
      { step: '04', title: 'Cross-Encoder Re-rank', desc: 'Top 50 filtered down to Top 5 most relevant', badge: 'Cohere' },
      { step: '05', title: 'Grounded Synthesis', desc: 'Strict anti-hallucination prompt with inline citations', badge: 'Claude 3.5 Sonnet' },
    ],
  },
  {
    id: 'payments',
    title: 'Penny-Exact Payment Pipeline',
    tag: 'Fintech / AWS Architecture',
    description: 'Zero-drop financial transaction pipeline handling unattended vending machines and automated daily reconciliation.',
    metrics: [
      { label: 'Transaction Loss', val: '0.00%' },
      { label: 'Reconciliation', val: 'Automated 24h' },
      { label: 'Throughput', val: '100% Idempotent' },
    ],
    nodes: [
      { step: '01', title: 'Terminal Webhook', desc: 'Signed telemetry payload from Nayax & NMI machines', badge: 'Nayax VPOS' },
      { step: '02', title: 'SQS FIFO Queue', desc: 'Guaranteed order, deduplication ID, DLQ fallback', badge: 'AWS SQS' },
      { step: '03', title: 'Lambda Processor', desc: 'Idempotent worker with exponential backoff retry', badge: 'AWS Lambda' },
      { step: '04', title: 'PostgreSQL ACID Ledger', desc: 'Strict double-entry ledger with row-level locks', badge: 'Postgres RLS' },
      { step: '05', title: 'Nightly Recon Run', desc: 'Bank statement vs ledger automated balance match', badge: 'Cron Worker' },
    ],
  },
  {
    id: 'structured-llm',
    title: 'Reliable Structured LLM Output',
    tag: 'Reliability Engineering',
    description: 'Zero-schema-drift JSON generation using compile-time Zod contracts and self-correcting validation loops.',
    metrics: [
      { label: 'Schema Drift', val: '0.0%' },
      { label: 'Self-Correction Rate', val: '99.4%' },
      { label: 'Contract Safety', val: 'TypeScript / Zod' },
    ],
    nodes: [
      { step: '01', title: 'Zod Contract', desc: 'Strict JSON schema definitions with runtime boundaries', badge: 'TypeScript' },
      { step: '02', title: 'Grammar Enforcement', desc: 'JSON Mode / Structured Tool Call constraints', badge: 'OpenAI / Anthropic' },
      { step: '03', title: 'Validation Gate', desc: 'Parse & validate response against strict Zod type', badge: 'Zod Parse' },
      { step: '04', title: 'Auto-Retry Loop', desc: 'Feeds parse error diff back to LLM for instant self-fix', badge: 'Healing Loop' },
      { step: '05', title: 'Downstream Consumer', desc: '100% typed, safe payload piped straight to database', badge: 'Production Ready' },
    ],
  },
];

const IconPlay = () => (
  <svg width='14' height='14' viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'>
    <path d='M8 5v14l11-7z' />
  </svg>
);

// A metric like '94.2%' or '240ms' counts up; 'Recursive 512t' stays a string.
const NUMERIC = /^([\d,]+)(\.(\d+))?(.*)$/;
const parseMetric = (val) => {
  const m = NUMERIC.exec(val);
  if (!m) return null;
  const num = Number(m[1].replace(/,/g, ''));
  if (!Number.isFinite(num)) return null;
  return {
    value: num,
    decimals: m[3]?.length ?? 0,
    suffix: m[4] ?? '',
    locale: m[1].includes(','),
  };
};

const Metric = ({ val }) => {
  const n = parseMetric(val);
  if (!n) return <span className='font-display text-stat text-ink tabular-nums'>{val}</span>;
  return (
    <CountUp
      value={n.value}
      decimals={n.decimals}
      suffix={n.suffix}
      format={n.locale ? (v) => Math.round(v).toLocaleString('en-US') : undefined}
      className='font-display text-stat text-ink'
    />
  );
};

const ArchitectureShowcase = () => {
  const [activeArch, setActiveArch] = useState(ARCHITECTURES[0]);
  const [animating, setAnimating] = useState(false);
  const [activeStep, setActiveStep] = useState(null);

  const runSimulation = () => {
    if (animating) return;
    setAnimating(true);
    let step = 0;
    const interval = setInterval(() => {
      setActiveStep(step);
      step++;
      if (step > activeArch.nodes.length) {
        clearInterval(interval);
        setTimeout(() => {
          setAnimating(false);
          setActiveStep(null);
        }, 700);
      }
    }, 450);
  };

  const selectArch = (arch) => {
    setActiveArch(arch);
    setActiveStep(null);
    setAnimating(false);
  };

  return (
    <>
      <Reveal mask={false} y={14} duration={0.7}>
        <SectionHead
          index='02'
          title='System architecture'
          meta='How I build'
          blurb="Production AI isn't just calling APIs — it's resilient data pipelines, strict schema enforcement and zero-loss financial ledgers. Pick a flow and run the execution trace."
        />
      </Reveal>

      <Reveal mask={false} y={14} duration={0.7} delay={0.08}>
        <div role='tablist' aria-label='Architecture examples' className='flex flex-wrap gap-x-8'>
        {ARCHITECTURES.map((arch) => {
          const isActive = arch.id === activeArch.id;
          return (
            <button
              key={arch.id}
              role='tab'
              aria-selected={isActive}
              onClick={() => selectArch(arch)}
              className={`relative py-3 font-mono text-eyebrow uppercase transition-colors duration-200 cursor-pointer ${
                isActive ? 'text-blueprint' : 'text-mute hover:text-ink'
              }`}
            >
              {arch.title}
              <span
                className={`absolute left-0 -bottom-px h-px w-full origin-left bg-blueprint transition-transform duration-300 ease-out ${
                  isActive ? 'scale-x-100' : 'scale-x-0'
                }`}
              />
            </button>
          );
        })}
        </div>
      </Reveal>

      <AnimatePresence mode='wait'>
        <motion.div
          key={activeArch.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className='mt-10'
        >
          <div className='flex flex-wrap items-start justify-between gap-x-10 gap-y-5'>
            <div className='max-w-2xl'>
              <h3 className='font-display text-h3 text-ink'>{activeArch.title}</h3>
              <p className='mt-1.5 font-mono text-eyebrow uppercase text-blueprint'>{activeArch.tag}</p>
              <p className='mt-4 text-body text-graphite'>{activeArch.description}</p>
            </div>

            <button
              onClick={runSimulation}
              disabled={animating}
              className='shrink-0 flex items-center gap-2.5 px-6 h-11 rounded-pill bg-ink text-white text-label font-medium transition-colors duration-200 hover:bg-blueprint active:scale-[0.98] disabled:bg-graphite disabled:cursor-progress cursor-pointer'
            >
              <IconPlay />
              {/* While the trace runs the label itself shimmers — the button is
                  busy, not dead. Same words, brighter while processing. */}
              <span className={animating ? 'shimmer-label' : undefined}>
                {animating ? 'Tracing execution' : 'Run execution trace'}
              </span>
            </button>
          </div>

          <dl className='mt-10 grid grid-cols-1 sm:grid-cols-3 gap-y-6'>
            {activeArch.metrics.map((metric) => (
              <div key={metric.label} className='pt-5 border-t border-rule'>
                <dt className='font-mono text-eyebrow uppercase text-mute'>{metric.label}</dt>
                <dd className='mt-2'>
                  <Metric val={metric.val} />
                </dd>
              </div>
            ))}
          </dl>

          <p className='mt-12 font-mono text-eyebrow uppercase text-mute'>Execution nodes</p>

          {/* The trace rail: one hairline the playhead runs along while the
              cards light up under it. Idle = empty; done = full for a beat. */}
          <div className='mt-4 h-px w-full bg-rule relative overflow-hidden'>
            <span
              className='absolute inset-y-0 left-0 w-full origin-left bg-blueprint transition-transform duration-300 ease-out'
              style={{
                transform: `scaleX(${
                  activeStep === null ? 0 : Math.min(1, (activeStep + 1) / activeArch.nodes.length)
                })`,
              }}
              aria-hidden='true'
            />
          </div>

          <div className='mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-rule border border-rule rounded-card overflow-hidden'>
            {activeArch.nodes.map((node, index) => {
              const isCurrent = animating && activeStep === index;
              const isPassed = activeStep !== null && activeStep > index;

              return (
                <div
                  key={node.step}
                  className={`flex flex-col justify-between p-5 transition-[background-color,box-shadow] duration-300 ${
                    isCurrent ? 'bg-blueprint-soft shadow-[inset_0_0_0_1px_#1f3a93]' : isPassed ? 'bg-paper' : 'bg-surface'
                  }`}
                >
                  <div>
                    <div className='flex items-center justify-between gap-3 mb-3'>
                      <span className={`font-mono text-eyebrow ${isCurrent || isPassed ? 'text-blueprint' : 'text-mute'}`}>
                        {node.step}
                      </span>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        isCurrent ? 'bg-blueprint' : isPassed ? 'bg-ok' : 'bg-rule'
                      }`} />
                    </div>
                    <h4 className='text-[0.9375rem] font-medium text-ink leading-snug'>{node.title}</h4>
                    <p className='mt-2 text-caption text-graphite leading-relaxed'>{node.desc}</p>
                  </div>
                  <p className='mt-4 pt-3 border-t border-rule font-mono text-eyebrow uppercase text-mute truncate' title={node.badge}>
                    {node.badge}
                  </p>
                </div>
              );
            })}
          </div>

          <p className='sr-only' role='status'>
            {animating && activeStep !== null
              ? `Node ${activeArch.nodes[Math.min(activeStep, activeArch.nodes.length - 1)].step} processing`
              : 'Trace idle'}
          </p>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default SectionWrapper(ArchitectureShowcase, 'architecture');
