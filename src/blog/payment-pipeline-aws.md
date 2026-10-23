# Building a Penny-Exact Payment Pipeline on AWS

![A penny-exact payment pipeline on AWS](https://raw.githubusercontent.com/jahanzaib0013-a11y/dev-blog/main/assets/cover-payments.png)

Money is the one domain where "eventually consistent" and "close enough" are not acceptable answers. On the Decorum Vending project I built a pipeline that ingests payment events from vending terminals and reconciles them against our own records — and it has to balance to the penny across hundreds of transactions, every day, without a human checking.

Here's how the pieces fit together, and the three mistakes that would have quietly cost real money if I hadn't caught them.

## The shape of the pipeline

```
Nayax terminal  →  webhook  →  AWS SQS  →  Lambda  →  Supabase (Postgres)
```

Every payment terminal event hits a webhook, lands on an **SQS queue**, and is processed by a **Lambda** that normalizes it and writes to Postgres. The queue is the important part: it decouples "an event happened" from "we successfully recorded it," so a slow database or a deploy never drops a transaction on the floor.

![Payment pipeline architecture: Nayax to SQS to Lambda to Postgres, with a dead-letter queue and nightly reconciliation](https://raw.githubusercontent.com/jahanzaib0013-a11y/dev-blog/main/assets/payment-pipeline.svg)

## Mistake 1: assuming events arrive once

They don't. Terminals retry. Gateways replay. Your own queue guarantees *at-least-once* delivery, which means you *will* see the same payment twice. If your handler just inserts a row, you've now double-counted revenue.

The fix is **idempotency**: every event carries a stable provider transaction ID, and that column has a unique constraint. Processing becomes an upsert keyed on that ID. The second copy of an event updates the same row instead of creating a new one. Reconciliation only works because inserting twice is a no-op.

## Mistake 2: doing money math in floating point

`0.1 + 0.2` is not `0.3`, and that tiny error compounds the instant you sum a day's transactions. I store every amount in **integer minor units** — pence, not pounds — and only format to a decimal at the very edge, for display. All arithmetic happens in integers. "Penny-exact" is impossible any other way; floats guarantee you'll be off by a cent eventually, and with money a cent is a bug report.

## Mistake 3: no plan for the events that fail

Some events are malformed. Some reference terminals that don't exist yet. If a bad message can't be processed, you don't want it retrying forever and blocking the queue, and you *really* don't want it silently vanishing.

That's what a **dead-letter queue** is for. After a few failed attempts, SQS moves the message to a DLQ where it waits for inspection instead of spinning. I also batch failures so one poison message doesn't fail an entire batch of good ones. The DLQ became my early-warning system — anything landing there is a signal that reality changed and my assumptions need updating.

## Reconciliation is the proof

The pipeline isn't "done" because rows are being written. It's done when a nightly job can sum our recorded transactions, compare against the provider's totals, and get **zero difference**. That reconciliation step is the whole point — it's the automated proof that idempotency held, the integer math balanced, and nothing died in a corner.

When the numbers match every morning without anyone looking, that's not luck. It's idempotency + integer money + dead-letter queues doing exactly what they're designed to do.

## Takeaways

- **Idempotency isn't optional** in any at-least-once system — design for duplicates from day one.
- **Never touch money with floats.** Integers all the way; format only for humans.
- **A dead-letter queue is a monitoring tool**, not just error handling — watch it.
- **Reconciliation is the test that matters.** If it balances automatically, the pipeline is trustworthy.

---

*I'm Jahanzaib, a full-stack AI developer who also spends a lot of time in the unglamorous, high-stakes world of payment integrations. I write about building software that holds up under real users and real money.*
