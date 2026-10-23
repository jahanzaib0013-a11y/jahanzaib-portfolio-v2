# How I Get Reliable Structured Output from LLMs (and Stop Fighting JSON)

![Reliable structured output from LLMs](https://raw.githubusercontent.com/jahanzaib0013-a11y/dev-blog/main/assets/cover-llm.png)

When I first started wiring language models into production features, the demo always worked and the tenth real request always broke. The model would return a friendly sentence wrapped around the JSON I asked for, or trail off mid-object, or invent a field name I never defined. On AuraCover — an AI SaaS that now serves 1,200+ generations a month — I couldn't ship "usually valid." The API layer needed structured output *every* time.

Here's the approach that got me from flaky to boringly reliable.

## 1. Ask for the schema, not "JSON"

"Return JSON" is a wish. A schema is a contract. I describe the exact shape and, more importantly, give the model an example of a *correct* response and a *wrong* one.

```
You return ONLY a JSON object matching this shape:
{ "title": string, "mood": "calm" | "energetic" | "dark", "tags": string[] }

Correct: {"title":"Neon Drift","mood":"energetic","tags":["synthwave","night"]}
Wrong (do not do this): Here's your cover! {"title": ...}
```

The "wrong" example does more work than three paragraphs of instructions. Models pattern-match, so show them the pattern you want them to avoid.

## 2. Use the platform's structured mode

Most providers now support a real structured-output or tool-calling mode that constrains generation to a schema. When it's available, use it — it eliminates the "chatty preamble" class of bugs entirely. Prompt phrasing is your fallback for models or endpoints that don't have it, not your first line of defense.

## 3. Validate at the boundary, always

I never trust the string that comes back. It gets parsed and validated against a schema before anything downstream touches it. If validation fails, I don't crash — I retry with the parser error fed back into the prompt:

```
Your previous response failed validation: "tags" must be an array of strings.
Return a corrected JSON object only.
```

One targeted retry fixes the large majority of failures, because the model gets to see exactly what it did wrong. Two retries covers almost everything else. Past that, I fail loudly rather than silently serving garbage.

![The validate-and-retry loop](https://raw.githubusercontent.com/jahanzaib0013-a11y/dev-blog/main/assets/retry-loop.svg)

## 4. Make temperature match the job

Creative copy wants a warm temperature. Structured extraction wants a cold one. I run the *same* request at different temperatures depending on whether I'm asking the model to invent or to organize. Lowering temperature for the structuring step alone removed a whole category of "it got creative with the field names" bugs.

## 5. Keep prompts in version control, not in strings

The moment prompts became real product logic, I moved them out of inline template literals and into versioned files with a tiny bit of templating. Now a prompt change is a diff I can review and roll back, not a mystery deploy. This sounds obvious; almost nobody does it early enough.

## What actually moved the needle

If I had to keep only two of these, it would be **validate-and-retry-with-the-error** and **show a wrong example**. Together they turned a feature that worked in the demo into one that works at 3am on request number 40,000, which is the only kind of "works" that counts in production.

The uncomfortable truth is that LLM reliability isn't really a prompting problem — it's a systems problem. The model is one component that occasionally returns bad data, exactly like a flaky third-party API. Treat it that way — validate its output, retry on failure, fail loudly when you must — and it stops being scary.

---

*I'm Jahanzaib, a full-stack AI developer. I build AI-powered web apps end to end and write about the parts that only show up once real users arrive.*
