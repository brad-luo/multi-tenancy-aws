import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/auth';
import { createTablesIfNotExist } from '@/lib/db-schema';

export async function POST(request: NextRequest) {
  try {
    // Ensure tables exist
    await createTablesIfNotExist();

    const { username, password, email } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const user = await createUser(username, password, email);

    if (!user) {
      return NextResponse.json(
        { error: 'Username already exists or registration failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('Register API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}