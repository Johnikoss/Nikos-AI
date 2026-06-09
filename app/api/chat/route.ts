import OpenAI from "openai";
import { buildSystemPrompt } from "@/lib/system-prompt";
import type { ModeId } from "@/lib/modes";

export const runtime = "nodejs";

type ClientMessage = { role: "user" | "assistant"; content: string };

const MODEL = process.env.OPENAI_MODEL || "gpt-4o";

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: "OPENAI_API_KEY is not set. Copy .env.local.example to .env.local and add your key." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let messages: ClientMessage[];
  let mode: ModeId = "navigate";
  let memory = "";
  try {
    const body = await req.json();
    messages = Array.isArray(body?.messages) ? body.messages : [];
    if (typeof body?.mode === "string") mode = body.mode as ModeId;
    if (typeof body?.memory === "string") memory = body.memory.slice(0, 4000);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Keep only valid, recent turns to bound context.
  const history = messages
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-20);

  if (history.length === 0) {
    return new Response(JSON.stringify({ error: "No messages provided." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      stream: true,
      temperature: 0.6,
      messages: [
        { role: "system", content: buildSystemPrompt({ mode, memory }) },
        ...history.map((m) => ({ role: m.role, content: m.content })),
      ],
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) controller.enqueue(encoder.encode(delta));
          }
        } catch (err) {
          controller.enqueue(
            encoder.encode("\n\n[stream interrupted: " + (err as Error).message + "]")
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
