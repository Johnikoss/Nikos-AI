import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-05-27.dahlia",
});

// The paid plans shown in the pricing modal. Prices are defined here in cents,
// so you don't have to create Products/Prices in the Stripe dashboard first.
const PLANS = {
  plus: { name: "Nikos AI — Plus", amount: 1200 }, // $12 / month
  pro: { name: "Nikos AI — Pro", amount: 2900 }, // $29 / month
} as const;

type PlanId = keyof typeof PLANS;

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured (missing STRIPE_SECRET_KEY)." },
        { status: 500 }
      );
    }

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
