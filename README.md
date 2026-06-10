<<<<<<< HEAD
# Nikos-AI

A cognitive navigation system — not a chatbot, coach, or planner. It helps you think clearly, find the real constraint, separate feeling from fact, and take one useful step.

Built with **Next.js (App Router)** + the **OpenAI API**. Responses stream token-by-token.

## Setup

```bash
cd C:\Users\theon\OneDrive\Desktop\Skills\nikos-ai 
npm install
cp .env.local.example .env.local   # then add your OPENAI_API_KEY
npm run dev
```

Open http://localhost:3000.

## Configuration

| Variable         | Required | Default  | Notes                          |
| ---------------- | -------- | -------- | ------------------------------ |
| `OPENAI_API_KEY` | yes      | —        | Your OpenAI key.               |
| `OPENAI_MODEL`   | no       | `gpt-4o` | Any chat-completions model.    |

## How it works

- `lib/system-prompt.ts` — the Nikos-AI system prompt (its entire personality and rules).
- `app/api/chat/route.ts` — a streaming edge route. Injects the system prompt, keeps the last ~20 turns for context, streams the model's reply back as plain text. The API key never reaches the browser.
- `app/page.tsx` — a calm, single-column chat UI that streams responses into place.

## Notes

- The system prompt is deliberately strict (no filler, one insight/question/step at a time). If you want to tune its behavior, edit `lib/system-prompt.ts` — that's the only file that defines what Nikos *is*.
- `temperature` is set to `0.6` in the route for grounded-but-not-robotic replies.

## Build for production

```bash
npm run build
npm start
```
=======
My life navigator app/chatbot prototype
8e6a0c931f1f62fb6d17625197342c57021a37ef
=======

>>>>>>> 8e6a0c931f1f62fb6d17625197342c57021a37ef
