import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { titre, theme, description } = body ?? {};

    const apiKey = process.env.RESEND_API_KEY;
    const adminEmails = process.env.ADMIN_EMAILS || "";

    if (!apiKey || !adminEmails) {
      console.warn("Email de notification non envoyé : RESEND_API_KEY ou ADMIN_EMAILS manquant.");
      return NextResponse.json({ ok: false, reason: "missing_env" }, { status: 200 });
    }

    const recipients = adminEmails
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    if (recipients.length === 0) {
      console.warn("Email de notification non envoyé : ADMIN_EMAILS vide.");
      return NextResponse.json({ ok: false, reason: "no_recipients" }, { status: 200 });
    }

    const subject = `[Préfecture] Nouvelle question: ${theme || "Sans thème"}`;
    const content = `
Nouvelle question soumise :

- Thème : ${theme || "Non précisé"}
- Description : ${description || "—"}

Connectez-vous à la Préfecture pour répondre et publier.
`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "prefecture@fase.app",
        to: recipients,
        subject,
        text: content,
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error("Envoi email Resend échoué:", txt);
      return NextResponse.json({ ok: false, error: "resend_failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erreur notify-new-question:", err);
    return NextResponse.json({ ok: false, error: "unexpected" }, { status: 500 });
  }
}

