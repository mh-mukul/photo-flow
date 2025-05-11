'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const LOGIN_COOKIE_NAME = 'admin-session';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const LoginSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export type LoginState = {
  errors?: {
    username?: string[];
    password?: string[];
    credentials?: string[];
  };
  message?: string | null;
};

export async function login(
  prevState: LoginState | undefined,
  formData: FormData
): Promise<LoginState> {
  const validatedFields = LoginSchema.safeParse({
    username: formData.get('username'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid input.',
    };
  }

  const { username, password } = validatedFields.data;

  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    console.error('Admin credentials are not set in environment variables.');
    return { message: 'Server configuration error. Please contact support.' };
  }

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // In a real app, generate a secure session token (e.g., JWT) and store it.
    // For this example, we set a simple session cookie.
    // The AUTH_COOKIE_SECRET should be used to sign/encrypt this for production.
    // For simplicity here, we're setting a basic value.
    cookies().set(LOGIN_COOKIE_NAME, 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
      sameSite: 'lax',
    });
  } else {
    return {
      errors: { credentials: ['Invalid username or password.'] },
      message: 'Login failed.',
    };
  }
  // Redirect must be outside of try/catch to not be caught by Next.js error handling for Server Actions
  // It will be caught and processed by the framework.
  redirect('/admin/photos');
}

export async function logout() {
  cookies().delete(LOGIN_COOKIE_NAME);
  redirect('/admin/login');
}

export async function isAuthenticated(): Promise<boolean> {
  const session = cookies().get(LOGIN_COOKIE_NAME);
  return !!session;
}
