import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

// The Stripe SDK isn't compatible with the Edge runtime — run on Node.
export const runtime = "nodejs";

// The paid plans shown in the pricing modal. Prices are defined here in cents,
// so you don't have to create Products/Prices in the Stripe dashboard first.
const PLANS = {
  plus: { name: "Niko AI — Plus", amount: 1200 }, // $12 / month
  pro: { name: "Niko AI — Pro", amount: 2900 }, // $29 / month
} as const;

type PlanId = keyof typeof PLANS;

export async function POST(req: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { error: "Stripe is not configured (missing STRIPE_SECRET_KEY)." },
        { status: 500 }
      );
    }

    // Construct Stripe lazily, inside the handler. Doing it at module scope runs
    // during `next build` (page-data collection), where the env var may be
    // missing — that throws and fails the build.
    const stripe = new Stripe(secretKey, { apiVersion: "2026-05-27.dahlia" });

    const { plan, email } = (await req.json().catch(() => ({}))) as {
      plan?: string;
      email?: string;
    };

    const selected = PLANS[plan as PlanId];
    if (!selected) {
      return NextResponse.json(
        { error: `Unknown plan "${plan ?? ""}".` },
        { status: 400 }
      );
    }

    // Build the return URLs from the request origin so this works both locally
    // and on Vercel — no hardcoded localhost.
    const origin =
      req.headers.get("origin") ?? process.env.APP_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email || undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: selected.amount,
            recurring: { interval: "month" },
            product_data: { name: selected.name },
          },
        },
      ],
      success_url: `${origin}/app?upgraded=1`,
      cancel_url: `${origin}/app`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("create-checkout-session error:", err);
    const message =
      err instanceof Error ? err.message : "Could not start checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
