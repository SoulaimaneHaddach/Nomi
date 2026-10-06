import nodemailer from "nodemailer";

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const host = process.env.SMTP_HOST;
  if (!host) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMTP_HOST must be configured in production");
    }

    console.info(`Password reset link for ${email}: ${resetUrl}`);
    return;
  }

  const port = Number(process.env.SMTP_PORT ?? 587);
  const secure = process.env.SMTP_SECURE === "true";
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    ...(user && password ? { auth: { user, pass: password } } : {}),
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? "Nomi <no-reply@example.com>",
    to: email,
    subject: "Reset your Nomi password",
    text: `Use this link to reset your password. It expires in 30 minutes:\n\n${resetUrl}\n\nIf you didn't request this, you can ignore this email.`,
    html: `<p>Use this link to reset your Nomi password. It expires in 30 minutes:</p><p><a href="${resetUrl}">Reset password</a></p><p>If you didn't request this, you can ignore this email.</p>`,
  });
}
