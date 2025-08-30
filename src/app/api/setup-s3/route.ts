import { NextResponse } from 'next/server';
import { CreateBucketCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { s3Client, S3_BUCKET } from '@/lib/aws-config';

export async function POST() {
  try {
    console.log(`Checking if S3 bucket ${S3_BUCKET} exists...`);
    
    // Check if bucket already exists
    try {
      await s3Client.send(new HeadBucketCommand({
        Bucket: S3_BUCKET,
      }));
      
      return NextResponse.json({ 
        success: true, 
        message: `S3 bucket ${S3_BUCKET} already exists` 
      }, { status: 200 });
    } catch {
      // Bucket doesn't exist, create it
      console.log(`Creating S3 bucket ${S3_BUCKET}...`);
      
      await s3Client.send(new CreateBucketCommand({
        Bucket: S3_BUCKET,
        CreateBucketConfiguration: {
          LocationConstraint: 'ap-southeast-2'
        }
      }));
      
      return NextResponse.json({ 
        success: true, 
        message: `S3 bucket ${S3_BUCKET} created successfully` 
      }, { status: 200 });
    }
  } catch (error) {
    console.error('Error setting up S3 bucket:', error);
    return NextResponse.json(
      { error: 'Failed to create S3 bucket', details: error },
      { status: 500 }
    );
  }
}