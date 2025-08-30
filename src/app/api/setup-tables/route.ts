import { NextResponse } from 'next/server';
import { createTablesIfNotExist } from '@/lib/db-schema';

export async function POST() {
  try {
    console.log('Setting up DynamoDB tables...');
    await createTablesIfNotExist();
    
    return NextResponse.json({ 
      success: true, 
      message: 'DynamoDB tables created successfully' 
    }, { status: 200 });
  } catch (error) {
    console.error('Error setting up tables:', error);
    return NextResponse.json(
      { error: 'Failed to create tables', details: error },
      { status: 500 }
    );
  }
}