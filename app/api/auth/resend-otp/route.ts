import { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from '@/lib/api-response';
import { createAndSendOTP } from '@/lib/otp';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validation
    if (!email) {
      return errorResponse('Email is required', 400);
    }

    // Send new OTP
    const otpId = await createAndSendOTP(email, 'signup');

    if (!otpId) {
      return errorResponse('Failed to send verification email', 500);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Verification code sent to your email',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[RESEND_OTP_ERROR]', error);
    return errorResponse('Internal server error', 500);
  }
}

