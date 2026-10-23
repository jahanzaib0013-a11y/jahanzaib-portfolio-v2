# RAG in Production: What Actually Moved the Needle

![RAG in production](https://raw.githubusercontent.com/jahanzaib0013-a11y/dev-blog/main/assets/cover-rag.png)

Retrieval-augmented generation looks trivial in a tutorial: embed some documents, stuff the top matches into a prompt, ask the model. Then you point real users at it and discover that "the top matches" are often the *wrong* matches, the model answers confidently from nothing, and nobody can tell you whether it's actually any good.

I've built RAG into live products, and almost none of the wins came from the model. They came from the boring plumbing around it. Here's what actually mattered.

![RAG flow: index documents by chunking, embedding and storing; then retrieve wide, re-rank narrow, ground the LLM, and return an answer with citations](https://raw.githubusercontent.com/jahanzaib0013-a11y/dev-blog/main/assets/rag-flow.svg)

## Chunking is a product decision, not a default

The single biggest quality lever was **how I split documents**. Dumping fixed 1,000-character windows shreds tables mid-row and cuts sentences in half, and the model can't reason over a fragment it can't parse.

What worked: chunk on *structure* — headings, paragraphs, list boundaries — and keep a bit of overlap so a thought that spans a boundary survives in both pieces. I also attach lightweight metadata (source, section title) to each chunk. Retrieval quality jumped more from fixing chunking than from any embedding-model swap.

## Retrieval quality caps everything downstream

No prompt rescues a bad retrieval. If the right chunk isn't in the context window, the model is guessing — politely and fluently, which is worse than an error because it *looks* correct.

Two things helped most:

1. **Retrieve more, then filter.** Pull a wider candidate set, then re-rank down to the few genuinely relevant chunks instead of trusting the first vector-similarity pass.
2. **Watch what gets retrieved.** I log the chunks that fed each answer. When a response is wrong, the log almost always shows the retrieval was wrong first. You cannot debug what you can't see.

## Ground the model, then force it to admit ignorance

The dangerous failure mode isn't a wrong answer — it's a confident one built on nothing. So the instruction is explicit: **answer only from the provided context, and if the context doesn't contain the answer, say so.**

```
Answer using ONLY the context below. If the context does not contain
the answer, reply exactly: "I don't have enough information for that."
Do not use outside knowledge.
```

"I don't know" is a *feature*. A system that admits its limits earns the trust that a system which bluffs will eventually destroy in a single bad answer.

## Cite sources — it changes user behavior

Every answer returns the chunks it used. Beyond being honest, citations shift how people use the tool: instead of blindly trusting output, they *verify* — which is exactly the healthy relationship you want between a person and an AI feature. It also made my own debugging trivial, because the "why did it say that" is right there attached to the answer.

## You need evaluation or you're flying blind

The hardest lesson: **without evaluation, "better" is just a feeling.** I keep a small set of real questions with known-good answers and run it on every meaningful change. It's not fancy — a handful of cases, checked automatically — but it's the difference between "I think this prompt is better" and "this change improved 8 of my 20 cases and regressed 1." Ship on evidence, not vibes.

## The summary

- **Chunk on structure**, with overlap and metadata. This is where most of the quality lives.
- **Retrieve wide, re-rank narrow**, and *log every retrieval*.
- **Force grounding** and make "I don't know" a valid answer.
- **Return citations** — for honesty, for user trust, and for your own sanity.
- **Build an eval set early.** Without it you can't tell progress from noise.

RAG isn't hard because of the AI. It's hard because it's a retrieval system with a language model bolted on the end, and retrieval systems reward exactly the unglamorous engineering discipline that demos let you skip.

---

*I'm Jahanzaib, a full-stack AI developer. I build LLM features into real products and write about what survives contact with actual users.*
