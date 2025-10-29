import { NextResponse } from 'next/server';
import { createDefaultAdmin } from '@/lib/auth/database-utils';

export async function POST() {
  try {
    await createDefaultAdmin();

    return NextResponse.json(
      {
        success: true,
        message: 'Database initialized successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to initialize database' },
      { status: 500 }
    );
  }
}