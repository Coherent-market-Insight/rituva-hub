import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function successResponse<T>(data: T, message?: string) {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    } as ApiResponse<T>,
    { status: 200 }
  );
}

export function errorResponse(error: string, status: number = 400) {
  return NextResponse.json(
    {
      success: false,
      error,
    } as ApiResponse,
    { status }
  );
}

export function createdResponse<T>(data: T, message?: string) {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    } as ApiResponse<T>,
    { status: 201 }
  );
}

export function unauthorizedResponse(message: string = 'Unauthorized') {
  return NextResponse.json(
    {
      success: false,
      error: message,
    } as ApiResponse,
    { status: 401 }
  );
}

export function forbiddenResponse(message: string = 'Forbidden') {
  return NextResponse.json(
    {
      success: false,
      error: message,
    } as ApiResponse,
    { status: 403 }
  );
}

export function notFoundResponse(message: string = 'Not found') {
  return NextResponse.json(
    {
      success: false,
      error: message,
    } as ApiResponse,
    { status: 404 }
  );
}

