import structured from '../blog/structured-llm-output.md?raw'
import payments from '../blog/payment-pipeline-aws.md?raw'
import rag from '../blog/rag-in-production.md?raw'
import coverLlm from '../assets/blog/cover-llm.png'
import coverPayments from '../assets/blog/cover-payments.png'
import coverRag from '../assets/blog/cover-rag.png'

const REPO = 'https://github.com/jahanzaib0013-a11y/dev-blog/blob/main/posts'

export const blogs = [
  {
    slug: 'structured-llm-output',
    title: 'How I Get Reliable Structured Output from LLMs',
    excerpt:
      'The demo always works and request number forty always breaks. Schema contracts, structured mode, and validate-and-retry — how I made LLM output boringly reliable in production.',
    date: 'Jul 2026',
    readTime: '5 min read',
    tag: 'AI / LLMs',
    cover: coverLlm,
    content: structured,
    url: `${REPO}/structured-llm-output.md`,
  },
  {
    slug: 'payment-pipeline-aws',
    title: 'Building a Penny-Exact Payment Pipeline on AWS',
    excerpt:
      'Money is the one domain where “close enough” is a bug report. Nayax → SQS → Lambda → Postgres, idempotency, integer money math, and dead-letter queues that balance to the penny.',
    date: 'Jul 2026',
    readTime: '6 min read',
    tag: 'Backend / AWS',
    cover: coverPayments,
    content: payments,
    url: `${REPO}/payment-pipeline-aws.md`,
  },
  {
    slug: 'rag-in-production',
    title: 'RAG in Production: What Actually Moved the Needle',
    excerpt:
      'Almost none of the wins came from the model. Structure-aware chunking, retrieve-wide-re-rank-narrow, grounding, citations, and why you need an eval set before you ship.',
    date: 'Jul 2026',
    readTime: '6 min read',
    tag: 'AI / LLMs',
    cover: coverRag,
    content: rag,
    url: `${REPO}/rag-in-production.md`,
  },
]
