import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';
import { successResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    await clearAuthCookie();
    return successResponse(null, 'Logged out successfully');
  } catch (error) {
    console.error('[LOGOUT]', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

