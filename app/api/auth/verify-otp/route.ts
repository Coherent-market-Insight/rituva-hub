import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { errorResponse } from '@/lib/api-response';
import { verifyOTP } from '@/lib/otp';
import { generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = body;

    // Validation
    if (!email || !code) {
      return errorResponse('Email and OTP code are required', 400);
    }

    // Verify OTP
    const isValidOTP = await verifyOTP(email, code, 'signup');

    if (!isValidOTP) {
      return errorResponse('Invalid or expired verification code', 400);
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Mark user as verified
    const verifiedUser = await prisma.user.update({
      where: { id: user.id },
      data: { is_email_verified: true },
    });

    // Generate JWT token
    const token = generateToken(verifiedUser.id, verifiedUser.email, verifiedUser.role);

    // Set auth cookie
    await setAuthCookie(token);

    return NextResponse.json(
      {
        success: true,
        message: 'Email verified successfully',
        data: {
          user: {
            id: verifiedUser.id,
            email: verifiedUser.email,
            full_name: verifiedUser.full_name,
            is_email_verified: verifiedUser.is_email_verified,
          },
          token,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[VERIFY_OTP_ERROR]', error);
    return errorResponse('Internal server error', 500);
  }
}


