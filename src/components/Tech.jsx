import { useState } from 'react';
import { motion } from 'framer-motion';

import { SectionWrapper } from '../hoc';
import SectionHead from './SectionHead';
import Reveal from './Reveal';
import {
  AwsIcon, ClaudeIcon, DockerIcon, ExpressIcon, FramerIcon, GitIcon, MongodbIcon,
  NextjsIcon, NodejsIcon, OllamaIcon, PostgresIcon, ReactIcon, SupabaseIcon,
  TailwindIcon, ThreejsIcon, TypescriptIcon,
} from './icons/TechLogos';

const TECH_CATEGORIES = [
  {
    label: 'AI & LLM',
    category: 'AI & LLM architecture',
    meta: 'Core focus',
    description: 'Retrieval pipelines, autonomous tool-calling agents, and deterministic schema enforcement.',
    skills: [
      { name: 'RAG pipelines', detail: 'Hybrid vector + BM25 retrieval', logos: [] },
      { name: 'OpenAI & Claude APIs', detail: 'Function calling, structured output', logos: [ClaudeIcon] },
      { name: 'Ollama / local LLMs', detail: 'Private on-premise inference', logos: [OllamaIcon] },
      { name: 'Prompt design', detail: 'Few-shot and chain-of-thought', logos: [] },
      { name: 'Autonomous agents', detail: 'Stateful multi-step execution', logos: [] },
      { name: 'Vector databases', detail: 'pgvector and Pinecone indexes', logos: [] },
    ],
  },
  {
    label: 'Backend',
    category: 'Backend & cloud infrastructure',
    meta: 'Distributed systems',
    description: 'Event-driven microservices, FIFO messaging queues, and automated financial ledgers.',
    skills: [
      { name: 'Node.js & Express', detail: 'High-throughput REST and webhooks', logos: [NodejsIcon, ExpressIcon] },
      { name: 'AWS SQS & Lambda', detail: 'Zero-loss FIFO message queues', logos: [AwsIcon] },
      { name: 'PostgreSQL & Supabase', detail: 'ACID transactions and secure RLS', logos: [PostgresIcon, SupabaseIcon] },
      { name: 'Payment gateways', detail: 'Nayax VPOS and NMI telemetry', logos: [] },
      { name: 'MongoDB', detail: 'Document store and caching', logos: [MongodbIcon] },
      { name: 'Docker & Git', detail: 'Containerisation and CI/CD', logos: [DockerIcon, GitIcon] },
    ],
  },
  {
    label: 'Frontend',
    category: 'Frontend & reactive UI',
    meta: 'Client systems',
    description: 'Type-safe client applications with motion, WebGL and bespoke design systems.',
    skills: [
      { name: 'TypeScript', detail: 'Strict types and Zod contracts', logos: [TypescriptIcon] },
      { name: 'React 18 / 19', detail: 'Concurrent mode, server actions', logos: [ReactIcon] },
      { name: 'Next.js App Router', detail: 'SSR, SSG and edge caching', logos: [NextjsIcon] },
      { name: 'Tailwind CSS', detail: 'Token-driven design systems', logos: [TailwindIcon] },
      { name: 'Three.js & R3F', detail: 'WebGL and WebGPU canvases', logos: [ThreejsIcon] },
      { name: 'Framer Motion', detail: 'Spring physics, layout transitions', logos: [FramerIcon] },
    ],
  },
];

// One row, shared by both layouts, so the desktop spread and the mobile tab
// panel can never drift apart. The index number only shows itself on hover —
// the list reads clean until you run your cursor across it.
const SkillRow = ({ skill, n }) => (
  <li className='group relative flex gap-3 py-4 border-t border-rule'>
    <span
      aria-hidden='true'
      className='absolute -left-8 top-4 font-mono text-eyebrow text-mute opacity-0 transition-opacity duration-200 group-hover:opacity-100 hidden lg:block tabular-nums'
    >
      {String(n).padStart(2, '0')}
    </span>
    {/* A fixed gutter rather than a per-row width: one mark, two marks or none
        all leave the text starting at the same x, so the rows that name no
        product with a logo read as part of the column instead of a different
        kind of row. Monochrome by inheritance -- whatever colour the label
        carries, the mark carries too. */}
    <span className='flex w-10 shrink-0 items-start gap-1 pt-[3px] text-mute transition-colors duration-200 group-hover:text-blueprint'>
      {skill.logos.map((Logo, i) => (
        <Logo key={i} size={skill.logos.length > 1 ? 15 : 16} />
      ))}
    </span>
    <div className='min-w-0'>
      <h4 className='text-[0.9375rem] font-medium text-ink transition-all duration-200 ease-out group-hover:translate-x-1 group-hover:text-blueprint'>
        {skill.name}
      </h4>
      <p className='mt-1 text-caption text-mute leading-snug transition-colors duration-200 group-hover:text-graphite'>
        {skill.detail}
      </p>
    </div>
  </li>
);

const Tech = () => {
  const [activeTab, setActiveTab] = useState(0);
  const active = TECH_CATEGORIES[activeTab];

  return (
    <>
      <SectionHead
        index='03'
        title='Technical stack'
        meta='Production-proven'
        blurb='The stack I ship with, chosen for performance, fault tolerance and honest abstraction cost.'
      />

      {/* Mobile: tabs keep the section one column tall. */}
      <div role='tablist' aria-label='Technology categories' className='flex flex-wrap border-b border-rule lg:hidden'>
        {TECH_CATEGORIES.map((cat, idx) => {
          const isActive = activeTab === idx;
          return (
            <button
              key={cat.label}
              role='tab'
              type='button'
              aria-selected={isActive}
              onClick={() => setActiveTab(idx)}
              className={`relative -mb-px px-5 py-3.5 font-mono text-eyebrow uppercase transition-colors duration-200 cursor-pointer ${
                isActive ? 'text-ink' : 'text-mute hover:text-graphite'
              }`}
            >
              {cat.label}
              <span
                className={`absolute left-0 -bottom-px h-px w-full origin-left transition-transform duration-200 ease-out ${
                  isActive ? 'scale-x-100 bg-blueprint' : 'scale-x-0 bg-rule'
                }`}
                aria-hidden='true'
              />
            </button>
          );
        })}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        role='tabpanel'
        className='pt-8 lg:hidden'
      >
        <div className='flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2'>
          <h3 className='font-display text-h3 text-ink'>{active.category}</h3>
          <span className='font-mono text-eyebrow uppercase text-blueprint'>{active.meta}</span>
        </div>
        <p className='mt-2 text-caption text-graphite max-w-measure'>{active.description}</p>

        <ul className='mt-8'>
          {active.skills.map((skill, i) => (
            <SkillRow key={skill.name} skill={skill} n={activeTab * 6 + i + 1} />
          ))}
        </ul>
      </motion.div>

      {/* Desktop: the whole stack at once, three editorial columns. You read
          the breadth without clicking through it — the tab bar would hide it. */}
      <div className='hidden lg:grid lg:grid-cols-3 gap-x-14 pt-10'>
        {TECH_CATEGORIES.map((cat, ci) => (
          <Reveal key={cat.label} mask={false} y={18} duration={0.8} delay={ci * 0.08}>
            <div>
              <div className='flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1'>
                <h3 className='font-display text-h3 text-ink'>{cat.category}</h3>
                <span className='font-mono text-eyebrow uppercase text-blueprint'>{cat.meta}</span>
              </div>
              <p className='mt-2 text-caption text-graphite'>{cat.description}</p>
              <ul className='mt-6 ml-8'>
                {cat.skills.map((skill, i) => (
                  <SkillRow key={skill.name} skill={skill} n={ci * 6 + i + 1} />
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </>
  );
};

export default SectionWrapper(Tech, 'tech');
