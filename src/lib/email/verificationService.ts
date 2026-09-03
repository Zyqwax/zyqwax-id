import { VerificationTokenType } from "@prisma/client";
import { prisma } from "@/lib/server/prisma";
import { sendEmail } from "./resend";
import { generateToken, hashToken, tokenExpiry } from "./verificationToken";
import { renderResetPasswordTemplate } from "./templates/resetPassword.template";
import { renderVerifyEmailTemplate } from "./templates/verifyEmail.template";

const appUrl = () => process.env.APP_ORIGIN;

// Kullanıcı için yeni email doğrulama token'ı oluşturur ve email gönderir.
export async function sendVerificationEmail(userId: string, email: string): Promise<void> {
  const token = generateToken();
  await prisma.verificationToken.deleteMany({ where: { userId, type: VerificationTokenType.EMAIL_VERIFY } });
  await prisma.verificationToken.create({
    data: {
      userId,
      type: VerificationTokenType.EMAIL_VERIFY,
      tokenHash: hashToken(token),
      expiresAt: tokenExpiry(VerificationTokenType.EMAIL_VERIFY),
    },
  });
  const verificationLink = `${appUrl()}/verify-email?token=${encodeURIComponent(token)}`;
  let html = "";
  renderVerifyEmailTemplate({ verificationLink }, (rendered) => {
    html = rendered;
  });
  await sendEmail(email, "Email adresini doğrula", html);
}

// Kullanıcı için parola sıfırlama token'ı oluşturur ve email gönderir.
export async function sendPasswordResetEmail(userId: string, email: string): Promise<void> {
  const token = generateToken();
  await prisma.verificationToken.deleteMany({ where: { userId, type: VerificationTokenType.PASSWORD_RESET } });
  await prisma.verificationToken.create({
    data: {
      userId,
      type: VerificationTokenType.PASSWORD_RESET,
      tokenHash: hashToken(token),
      expiresAt: tokenExpiry(VerificationTokenType.PASSWORD_RESET),
    },
  });
  const resetLink = `${appUrl()}/reset-password?token=${encodeURIComponent(token)}`;
  let html = "";
  renderResetPasswordTemplate({ resetLink }, (rendered) => {
    html = rendered;
  });
  await sendEmail(email, "Parolanı sıfırla", html);
}
