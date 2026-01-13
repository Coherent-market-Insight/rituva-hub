import { prisma } from './db';

/**
 * Generate a random 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP via email (currently logs to console in development)
 * In production, use: Resend, SendGrid, or Twilio SendGrid
 */
export async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  try {
    // For development, log to console
    console.log(`\n📧 OTP EMAIL SENT\n`);
    console.log(`To: ${email}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`Valid for 10 minutes\n`);

    // In production, you would use:
    // const response = await resend.emails.send({
    //   from: 'noreply@projecthub.app',
    //   to: email,
    //   subject: 'Project Hub - Verify Your Email',
    //   html: `
    //     <h2>Verify Your Email</h2>
    //     <p>Your verification code is:</p>
    //     <h1 style="letter-spacing: 5px; font-size: 32px;">${otp}</h1>
    //     <p>This code expires in 10 minutes.</p>
    //   `,
    // });

    return true;
  } catch (error) {
    console.error('[EMAIL_ERROR]', error);
    return false;
  }
}

/**
 * Create and send OTP for email verification
 */
export async function createAndSendOTP(email: string, purpose: string = 'signup'): Promise<string | null> {
  try {
    // Generate OTP code
    const code = generateOTP();

    // Calculate expiry (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Delete previous unused OTPs for this email
    await prisma.otp.deleteMany({
      where: {
        email,
        purpose,
        is_used: false,
      },
    });

    // Create OTP record
    const otp = await prisma.otp.create({
      data: {
        email,
        code,
        purpose,
        expires_at: expiresAt,
      },
    });

    // Send OTP email
    await sendOTPEmail(email, code);

    return otp.id;
  } catch (error) {
    console.error('[OTP_ERROR]', error);
    return null;
  }
}

/**
 * Verify OTP code
 */
export async function verifyOTP(email: string, code: string, purpose: string = 'signup'): Promise<boolean> {
  try {
    // Find valid OTP
    const otp = await prisma.otp.findFirst({
      where: {
        email,
        code,
        purpose,
        is_used: false,
        expires_at: {
          gt: new Date(), // Not expired
        },
      },
    });

    if (!otp) {
      return false;
    }

    // Mark OTP as used
    await prisma.otp.update({
      where: { id: otp.id },
      data: { is_used: true },
    });

    return true;
  } catch (error) {
    console.error('[OTP_VERIFY_ERROR]', error);
    return false;
  }
}

/**
 * Clean up expired OTPs (run periodically)
 */
export async function cleanupExpiredOTPs(): Promise<number> {
  try {
    const result = await prisma.otp.deleteMany({
      where: {
        expires_at: {
          lt: new Date(),
        },
      },
    });

    console.log(`[OTP_CLEANUP] Deleted ${result.count} expired OTPs`);
    return result.count;
  } catch (error) {
    console.error('[OTP_CLEANUP_ERROR]', error);
    return 0;
  }
}

