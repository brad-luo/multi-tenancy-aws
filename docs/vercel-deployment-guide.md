# Vercel Deployment Guide

This guide provides step-by-step instructions for deploying the Multi-Tenancy AWS project to Vercel.

## Prerequisites

- ✅ Vercel CLI installed and authenticated
- ✅ AWS account with DynamoDB and S3 access
- ✅ Project built and tested locally
- ✅ Environment variables configured

## Initial Deployment Setup

### 1. Project Initialization

You've already started the deployment process:

```bash
vercel
# ✅ Set up and deploy "multi-tenancy-aws"? yes
# ✅ Which scope? brad's projects
# ✅ Link to existing project? no
# ✅ Project name? multi-tenancy-aws
# ✅ Code directory? ./
```

### 2. Build Settings Configuration

Vercel should auto-detect your Next.js project. Verify these settings:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

## Environment Variables Setup

### 1. Required Environment Variables

Configure these in the Vercel dashboard or via CLI:

```bash
# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-southeast-2

# DynamoDB Table Names
DYNAMODB_USERS_TABLE=multi-tenancy-users-prod
DYNAMODB_WORKSPACES_TABLE=multi-tenancy-workspaces-prod
DYNAMODB_PROJECTS_TABLE=multi-tenancy-projects-prod

# S3 Configuration
S3_BUCKET_NAME=multi-tenancy-files-bucket-prod

# Application Settings
NEXTAUTH_SECRET=your_production_nextauth_secret
NEXTAUTH_URL=https://your-app.vercel.app
```

### 2. Setting Environment Variables via CLI

```bash
# Add environment variables
vercel env add AWS_ACCESS_KEY_ID
vercel env add AWS_SECRET_ACCESS_KEY
vercel env add AWS_REGION
vercel env add DYNAMODB_USERS_TABLE
vercel env add DYNAMODB_WORKSPACES_TABLE
vercel env add DYNAMODB_PROJECTS_TABLE
vercel env add S3_BUCKET_NAME
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL

# List all environment variables
vercel env ls

# Pull environment variables to local
vercel env pull .env.local
```

### 3. Environment Variables via Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project `multi-tenancy-aws`
3. Go to **Settings** → **Environment Variables**
4. Add each variable for **Production**, **Preview**, and **Development** environments

## AWS Resources Setup for Production

### 1. Create Production DynamoDB Tables

Create separate tables for production with different names:

```bash
# Call your setup API after deployment
curl -X POST https://your-app.vercel.app/api/setup-tables
```

Or use AWS CLI:

```bash
# Users table
aws dynamodb create-table \
  --table-name multi-tenancy-users-prod \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=username,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    IndexName=username-index,KeySchema=[{AttributeName=username,KeyType=HASH}],Projection={ProjectionType=ALL} \
  --billing-mode PAY_PER_REQUEST \
  --region ap-southeast-2

# Workspaces table
aws dynamodb create-table \
  --table-name multi-tenancy-workspaces-prod \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=userId,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    IndexName=userId-index,KeySchema=[{AttributeName=userId,KeyType=HASH}],Projection={ProjectionType=ALL} \
  --billing-mode PAY_PER_REQUEST \
  --region ap-southeast-2

# Projects table
aws dynamodb create-table \
  --table-name multi-tenancy-projects-prod \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=workspaceId,AttributeType=S \
    AttributeName=userId,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    IndexName=workspaceId-index,KeySchema=[{AttributeName=workspaceId,KeyType=HASH}],Projection={ProjectionType=ALL} \
    IndexName=userId-index,KeySchema=[{AttributeName=userId,KeyType=HASH}],Projection={ProjectionType=ALL} \
  --billing-mode PAY_PER_REQUEST \
  --region ap-southeast-2
```

### 2. Create Production S3 Bucket

```bash
# Create S3 bucket
aws s3 mb s3://multi-tenancy-files-bucket-prod --region ap-southeast-2

# Configure CORS for web uploads
aws s3api put-bucket-cors \
  --bucket multi-tenancy-files-bucket-prod \
  --cors-configuration file://cors.json
```

Create `cors.json`:

```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedOrigins": ["https://your-app.vercel.app"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

## Deployment Process

### 1. Initial Deployment

```bash
# Deploy to production
vercel --prod

# Or just deploy (will create preview first)
vercel
```

### 2. Subsequent Deployments

```bash
# Deploy to preview
vercel

# Promote preview to production
vercel --prod

# Or deploy directly to production
vercel --prod
```

### 3. Domain Configuration

```bash
# Add custom domain
vercel domains add yourdomain.com

# Add domain to project
vercel domains add yourdomain.com multi-tenancy-aws
```

## Vercel Configuration File

Create `vercel.json` for advanced configuration:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "env": {
    "AWS_REGION": "ap-southeast-2"
  },
  "build": {
    "env": {
      "NODE_ENV": "production"
    }
  },
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "regions": ["syd1"],
  "cleanUrls": true,
  "trailingSlash": false
}
```

## Security Considerations

### 1. Environment Variables Security

- ✅ Never commit `.env.local` to git
- ✅ Use different AWS resources for production vs development
- ✅ Rotate AWS access keys regularly
- ✅ Use least-privilege IAM policies

### 2. AWS IAM Policy

Create a minimal IAM policy for production:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Query",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:CreateTable",
        "dynamodb:DescribeTable"
      ],
      "Resource": [
        "arn:aws:dynamodb:ap-southeast-2:*:table/multi-tenancy-*-prod",
        "arn:aws:dynamodb:ap-southeast-2:*:table/multi-tenancy-*-prod/index/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "s3:CreateBucket",
        "s3:HeadBucket"
      ],
      "Resource": [
        "arn:aws:s3:::multi-tenancy-files-bucket-prod",
        "arn:aws:s3:::multi-tenancy-files-bucket-prod/*"
      ]
    }
  ]
}
```

## Post-Deployment Setup

### 1. Initialize Database Tables

```bash
# Call setup endpoint after deployment
curl -X POST https://your-app.vercel.app/api/setup-tables
curl -X POST https://your-app.vercel.app/api/setup-s3
```

### 2. Test the Deployment

1. **Visit your app**: `https://your-app.vercel.app`
2. **Test user registration**: Create a test account
3. **Test workspace creation**: Create a workspace
4. **Test project creation**: Create a project
5. **Test file upload**: Upload a test file

### 3. Monitor Deployment

```bash
# Check deployment status
vercel ls

# View deployment logs
vercel logs your-app.vercel.app

# Check function logs
vercel logs your-app.vercel.app --limit 100
```

## Troubleshooting

### Common Issues

#### 1. Environment Variables Not Found

**Symptoms**: API errors related to AWS configuration

**Solution**:
```bash
# Check environment variables
vercel env ls

# Re-add missing variables
vercel env add MISSING_VARIABLE_NAME
```

#### 2. AWS Permission Errors

**Symptoms**: 403 Forbidden errors from AWS

**Solutions**:
- Verify AWS credentials in environment variables
- Check IAM policy permissions
- Ensure AWS region matches configuration

#### 3. Database Connection Issues

**Symptoms**: DynamoDB ResourceNotFoundException

**Solutions**:
```bash
# Verify table names in environment variables
vercel env ls | grep DYNAMODB

# Create tables using setup endpoint
curl -X POST https://your-app.vercel.app/api/setup-tables
```

#### 4. File Upload Issues

**Symptoms**: S3 upload failures or CORS errors

**Solutions**:
- Check S3 bucket CORS configuration
- Verify S3 bucket permissions
- Ensure bucket region matches AWS_REGION

### Debug Commands

```bash
# View project details
vercel inspect your-app.vercel.app

# Check build logs
vercel logs --build

# Monitor real-time logs
vercel logs --follow

# Check function performance
vercel logs --function api/auth/login
```

## Performance Optimization

### 1. Vercel Function Configuration

```json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30,
      "memory": 512
    }
  }
}
```

### 2. Caching Strategy

```javascript
// In API routes
export const config = {
  api: {
    responseLimit: '8mb',
  },
}

// Add cache headers
return new Response(JSON.stringify(data), {
  headers: {
    'Cache-Control': 'public, max-age=300', // 5 minutes
  },
});
```

## Monitoring and Analytics

### 1. Vercel Analytics

Enable Vercel Analytics in your dashboard:
- Go to project settings
- Enable Analytics
- View performance metrics

### 2. AWS CloudWatch

Monitor AWS resources:
```bash
# View DynamoDB metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name ConsumedReadCapacityUnits \
  --dimensions Name=TableName,Value=multi-tenancy-users-prod
```

## CI/CD Integration

### 1. GitHub Integration

Connect your repository to Vercel:
1. Go to Vercel Dashboard
2. Import Git Repository
3. Connect to GitHub
4. Auto-deploy on push to main branch

### 2. Preview Deployments

- Every PR creates a preview deployment
- Test changes before merging
- Automatic preview URLs

## Cost Optimization

### 1. AWS Costs

- Use DynamoDB on-demand billing
- Monitor S3 storage usage
- Set up CloudWatch billing alerts

### 2. Vercel Costs

- Monitor function execution time
- Optimize bundle size
- Use edge caching effectively

## Backup and Disaster Recovery

### 1. Database Backups

```bash
# Enable DynamoDB point-in-time recovery
aws dynamodb put-backup --table-name multi-tenancy-users-prod
```

### 2. S3 Versioning

```bash
# Enable S3 versioning
aws s3api put-bucket-versioning \
  --bucket multi-tenancy-files-bucket-prod \
  --versioning-configuration Status=Enabled
```

This comprehensive guide covers all aspects of deploying your multi-tenancy AWS project to Vercel. Follow each section carefully for a successful deployment.