import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || "Architext <noreply@architext.pro>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://architext.pro";

export async function sendVerificationEmail({ to, url }: { to: string; url: string }) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Verify your email — Architext",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 16px;">Welcome to Architext</h1>
        <p style="font-size: 16px; color: #555; line-height: 1.5; margin-bottom: 24px;">
          Click the button below to verify your email address and start designing your architecture.
        </p>
        <a href="${url}" style="display: inline-block; background: #18181b; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;">
          Verify email
        </a>
        <p style="font-size: 13px; color: #999; margin-top: 32px; line-height: 1.5;">
          If you didn't create an account on Architext, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendProjectShareEmail({
  to,
  fromName,
  projectName,
  hasAccount,
}: {
  to: string;
  fromName: string;
  projectName: string;
  hasAccount: boolean;
}) {
  const ctaUrl = hasAccount ? `${APP_URL}/projects` : `${APP_URL}/signup`;
  const ctaLabel = hasAccount ? "View in Architext" : "Create account to accept";
  const ctaLabelEs = hasAccount ? "Ver en Architext" : "Crea tu cuenta para aceptar";

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `${fromName} shared a project with you — Architext`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 8px;">Project shared with you</h1>
        <p style="font-size: 16px; color: #555; line-height: 1.5; margin-bottom: 24px;">
          <strong>${fromName}</strong> has shared the project <strong>"${projectName}"</strong> with you on Architext.
          ${hasAccount ? "You can accept it from your dashboard." : "Create a free account to get your copy."}
        </p>
        <a href="${ctaUrl}" style="display: inline-block; background: #18181b; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;">
          ${ctaLabel}
        </a>
        <p style="font-size: 13px; color: #999; margin-top: 32px; line-height: 1.5;">
          If you don't recognize this sender, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}
