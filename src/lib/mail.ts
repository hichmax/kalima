import nodemailer, { type Transporter } from "nodemailer";

/**
 * Envoi d'e-mails transactionnels (réinitialisation du mot de passe) par SMTP.
 * Fonctionne avec Gmail (mot de passe d'application), Brevo, Resend, Mailjet…
 * Variables : SMTP_HOST, SMTP_PORT (465 ou 587), SMTP_USER, SMTP_PASS, EMAIL_FROM.
 */

export const mailEnabled = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

let transporter: Transporter | null = null;
function transport() {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 465);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
}

const escape = (value: string) => value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function sendPasswordReset(to: string, name: string, url: string) {
  if (!mailEnabled) throw new Error("SMTP non configuré");
  const hello = name ? `Salam ${escape(name)},` : "Salam,";
  await transport().sendMail({
    from: process.env.EMAIL_FROM || `Kalima <${process.env.SMTP_USER}>`,
    to,
    subject: "Kalima : choisis un nouveau mot de passe",
    text: `${name ? `Salam ${name},` : "Salam,"}\n\nTu as demandé à changer ton mot de passe Kalima. Ouvre ce lien (valable une heure) :\n${url}\n\nSi ce n'est pas toi, ignore cet e-mail : rien ne change.\n\nKalima`,
    html: `<!doctype html><html lang="fr"><body style="margin:0;background:#120b2b;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#f3effa">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#1c1340;border-radius:24px;padding:32px;border:1px solid rgba(255,255,255,.12)">
<tr><td style="font-size:22px;font-weight:700;letter-spacing:-.02em;padding-bottom:6px">Kalima</td></tr>
<tr><td style="font-size:16px;line-height:1.6;color:rgba(243,239,250,.85)">${hello}<br><br>Tu as demandé à changer ton mot de passe. Le lien ci-dessous est valable <strong>une heure</strong>.</td></tr>
<tr><td style="padding:26px 0"><a href="${escape(url)}" style="display:inline-block;background:linear-gradient(180deg,#fffaff,#d9ccff);color:#1a1233;font-weight:700;text-decoration:none;padding:14px 26px;border-radius:999px">Choisir un nouveau mot de passe</a></td></tr>
<tr><td style="font-size:13px;line-height:1.6;color:rgba(243,239,250,.6)">Si ce n'est pas toi, ignore cet e-mail : rien ne change.</td></tr>
</table></td></tr></table></body></html>`,
  });
}
