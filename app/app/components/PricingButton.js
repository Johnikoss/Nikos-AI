"use client";

export default function BuyButton() {
  const buy = async () => {
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
    });

    const data = await res.json();
    window.location.href = data.url;
  };

  return <button onClick={buy}>Buy Access</button>;
}