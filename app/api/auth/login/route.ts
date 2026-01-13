import { NextRequest } from 'next/server';
import bcryptjs from 'bcryptjs';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';
import { generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    // Handle special client credentials
    if (email === 'client@rituva.com' && password === 'client') {
      // Find or create client user
      let user = await prisma.user.findUnique({
        where: { email: 'client@rituva.com' },
      });

      if (!user) {
        // Create client user if doesn't exist
        const hashedPassword = await bcryptjs.hash('client', 10);
        user = await prisma.user.create({
          data: {
            email: 'client@rituva.com',
            password_hash: hashedPassword,
            full_name: 'Client',
            role: 'user',
            user_role: 'client',
            is_email_verified: true,
          },
        });
      } else {
        // Update existing user to ensure they have client role
        if (user.user_role !== 'client') {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { user_role: 'client' },
          });
        }
      }

      // Generate token
      const token = generateToken(user.id, user.email, user.role);

      // Set auth cookie
      await setAuthCookie(token);

      const response = successResponse(
        {
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            user_role: user.user_role,
          },
          token,
        },
        'Logged in successfully'
      );

      return response;
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return unauthorizedResponse('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcryptjs.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return unauthorizedResponse('Invalid credentials');
    }

    // Generate token
    const token = generateToken(user.id, user.email, user.role);

    // Set auth cookie
    await setAuthCookie(token);

    const response = successResponse(
      {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          user_role: user.user_role,
        },
        token,
      },
      'Logged in successfully'
    );

    return response;
  } catch (error) {
    console.error('[LOGIN]', error);
    return errorResponse('Internal server error', 500);
  }
}

