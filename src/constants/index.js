import {
    mobile,
    backend,
    creator,
    web,
    javascript,
    reactjs,
    redux,
    tailwind,
    nodejs,
    mongodb,
    git,
    figma,
    docker,
    typescript,
    nextjs,
    express,
    postgresql,
    InsightFlow,
    LittleLuxuries,
    AuraCover,
    Decorum,
    ElectricLove,
    AuraCoverVideo,
    DecorumVideo,
    ElectricLoveVideo,
    InsightFlowVideo,
    LittleLuxuriesVideo,
    threejs,
  } from "../assets";

  export const navLinks = [
    {
      id: "about",
      title: "About",
    },
    {
      id: "work",
      title: "Work",
    },
    {
      id: "contact",
      title: "Contact",
    },
  ];

  const services = [
    {
      title: "Full-Stack Developer",
      icon: web,
    },
    {
      title: "AI & LLM Integrations",
      icon: mobile,
    },
    {
      title: "Backend & API Developer",
      icon: backend,
    },
    {
      title: "Next.js & React Developer",
      icon: creator,
    },
  ];

  const technologies = [
    {
      name: "TypeScript",
      icon: typescript,
    },
    {
      name: "JavaScript",
      icon: javascript,
    },
    {
      name: "React JS",
      icon: reactjs,
    },
    {
      name: "Next JS",
      icon: nextjs,
    },
    {
      name: "Node JS",
      icon: nodejs,
    },
    {
      name: "Express",
      icon: express,
    },
    {
      name: "MongoDB",
      icon: mongodb,
    },
    {
      name: "PostgreSQL",
      icon: postgresql,
    },
    {
      name: "Redux Toolkit",
      icon: redux,
    },
    {
      name: "Tailwind CSS",
      icon: tailwind,
    },
    {
      name: "Docker",
      icon: docker,
    },
    {
      name: "git",
      icon: git,
    },
  ];

  const experiences = [
    {
      title: "React.js Developer",
      company_name: "?",
      icon:'',
      iconBg: "#383E56",
      date: "",
      points: [
        "",
      ],
    },
  ];

  const testimonials = [
    {
      testimonial:
        "",
      name: "",
      designation: "",
      company: "",
      image: "",
    },
  ];

  const projects = [
    {
      name: "AuraCover",
      category: "ai",
      highlights: [
        "Serving 1,200+ AI generations per month in production",
        "Prompt-engineered pipeline for consistent, structured cover output",
        "Next.js front-end with a serverless API layer on Vercel",
      ],
      description:
        "AI-powered SaaS generating custom cover content — serving 1,200+ AI generations per month in production. Next.js front-end, serverless API layer, and LLM integration with prompt engineering for consistent structured output.",
      tags: [
        { name: "nextjs", color: "blue-text-gradient" },
        { name: "ai-llm", color: "green-text-gradient" },
        { name: "serverless", color: "pink-text-gradient" },
      ],
      image: AuraCover,
      video: AuraCoverVideo,
      live_demo_link: "https://aura-cover-prod.vercel.app",
    },
    {
      name: "Decorum Vending",
      category: "payments",
      highlights: [
        "Penny-exact reconciliation across 360+ live transactions",
        "Nayax → AWS SQS → Lambda → Supabase Postgres ingestion pipeline",
        "Hardened with dead-letter queues and batch failure handling",
      ],
      description:
        "Payment-events ingestion pipeline (Nayax \u2192 AWS SQS \u2192 Lambda \u2192 Supabase Postgres) with penny-exact transaction reconciliation across 360+ transactions. Integrated Nayax, NMI, and Payter payment terminals, hardened with dead-letter queues and batch failure handling.",
      tags: [
        { name: "aws", color: "blue-text-gradient" },
        { name: "supabase", color: "green-text-gradient" },
        { name: "payments", color: "pink-text-gradient" },
      ],
      image: Decorum,
      video: DecorumVideo,
      live_demo_link: "https://refunds.decorumvending.co.uk",
    },
    {
      name: "Electric Love",
      category: "fullstack",
      highlights: [
        "Manages a 40-vehicle Tesla fleet in production",
        "Vehicle API integrations with a custom operations dashboard",
        "AI-powered driver onboarding with 4-step application flow",
      ],
      description:
        "Fleet-management SaaS platform managing a 40-vehicle Tesla fleet \u2014 integrating vehicle APIs with a custom operations dashboard for real-time fleet oversight.",
      tags: [
        { name: "react", color: "blue-text-gradient" },
        { name: "vehicle-apis", color: "green-text-gradient" },
        { name: "saas", color: "pink-text-gradient" },
      ],
      image: ElectricLove,
      video: ElectricLoveVideo,
      live_demo_link: "https://goelectriclove.com",
    },
    {
      name: "InsightFlow",
      category: "ai",
      highlights: [
        "RAG-based document intelligence with semantic search",
        "Upload, index, and query documents in natural language",
        "Type-safe Next.js + TypeScript workspace UI",
      ],
      description:
        "An analytics and insights dashboard that turns raw data into clear, actionable visualizations. Built with Next.js and TypeScript, deployed live on Vercel.",
      tags: [
        { name: "nextjs", color: "blue-text-gradient" },
        { name: "typescript", color: "green-text-gradient" },
        { name: "vercel", color: "pink-text-gradient" },
      ],
      image: InsightFlow,
      video: InsightFlowVideo,
      source_code_link: "https://github.com/jahanzaib0013-a11y/InsightFlow",
      live_demo_link: "https://insight-flow-ruby.vercel.app",
    },
    {
      name: "Little Luxuries",
      category: "fullstack",
      highlights: [
        "Full storefront: catalog, cart, and checkout flow",
        "Polished, responsive boutique UI with brand-consistent design",
        "Built with Next.js and TypeScript, deployed on Vercel",
      ],
      description:
        "A boutique e-commerce storefront with a polished shopping experience \u2014 product catalog, cart, and checkout flow. Built with Next.js and TypeScript, deployed live on Vercel.",
      tags: [
        { name: "nextjs", color: "blue-text-gradient" },
        { name: "typescript", color: "green-text-gradient" },
        { name: "e-commerce", color: "pink-text-gradient" },
      ],
      image: LittleLuxuries,
      video: LittleLuxuriesVideo,
      source_code_link: "https://github.com/jahanzaib0013-a11y/LittleLuxuries",
      live_demo_link: "https://little-luxuries.vercel.app",
    },
  ];

  export { services, technologies, experiences, testimonials, projects };
