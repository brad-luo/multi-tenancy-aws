# Multi-Tenancy AWS Implementation

## Overview

This project implements a multi-tenant workspace and project management system using Next.js, AWS DynamoDB, and AWS S3. Users can create multiple workspaces, manage projects within those workspaces, and upload/download files for each project.

## Architecture

### Tech Stack
- **Frontend**: Next.js 15 with React 19
- **Backend**: Next.js API Routes
- **Database**: AWS DynamoDB
- **File Storage**: AWS S3 (ap-southeast-2 region)
- **Authentication**: Custom username/password system
- **UI**: shadcn/ui components with Tailwind CSS

### Database Schema

#### Users Table
- Primary Key: `id` (string)
- Global Secondary Index: `username-index`
- Fields: id, username, password (hashed), email (optional), createdAt, updatedAt

#### Workspaces Table
- Primary Key: `id` (string)
- Global Secondary Index: `userId-index`
- Fields: id, name, description (optional), userId, createdAt, updatedAt
- Limit: Configurable (default: 10 workspaces per user)

#### Projects Table
- Primary Key: `id` (string)
- Global Secondary Indexes: `workspaceId-index`, `userId-index`
- Fields: id, name, description (optional), workspaceId, userId, createdAt, updatedAt
- Limit: Configurable (default: 10 projects per workspace)

### File Storage Structure

Files are stored in S3 with the following key structure:
```
users/{userId}/workspaces/{workspaceId}/projects/{projectId}/{fileName}
```

This ensures proper isolation between users, workspaces, and projects.

## Features Implemented

### 1. Authentication System
- **Registration**: Create new user accounts with username/password
- **Login**: Authenticate users with credentials
- **Session Management**: Client-side session storage with React Context
- **Password Security**: Passwords are hashed using bcryptjs (salt rounds: 12)

### 2. Workspace Management
- **Create Workspace**: Users can create up to 10 workspaces
- **List Workspaces**: View all workspaces owned by the user
- **Workspace Selection**: Navigate to workspace to view projects
- **Access Control**: Users can only access their own workspaces

### 3. Project Management
- **Create Project**: Users can create up to 10 projects per workspace
- **List Projects**: View all projects within a workspace
- **Project Selection**: Navigate to project to manage files
- **Access Control**: Projects are isolated by workspace and user

### 4. File Management
- **File Upload**: Upload files to project-specific S3 locations with size and count limits
- **File Listing**: View all files within a project
- **File Download**: Generate pre-signed URLs for secure file downloads
- **Access Control**: Files are isolated by user/workspace/project hierarchy
- **File Limits**: Configurable limits for file count per project and file size
- **Validation**: Client and server-side validation for file limits

### 5. User Interface
- **Responsive Design**: Works on desktop and mobile devices
- **Loading States**: Proper loading indicators for all operations
- **Error Handling**: User-friendly error messages
- **Navigation**: Intuitive breadcrumb-style navigation between levels

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate user

### Workspaces
- `GET /api/workspaces?userId={id}` - Get user's workspaces
- `POST /api/workspaces` - Create new workspace

### Projects
- `GET /api/projects?workspaceId={id}` - Get workspace's projects
- `POST /api/projects` - Create new project

### Files
- `GET /api/files?userId={id}&workspaceId={id}&projectId={id}` - List project files
- `GET /api/files?...&action=download&key={key}` - Get download URL
- `POST /api/files/upload` - Upload file to project

## Environment Variables

Required environment variables (stored in `.env.local`):

```bash
# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-southeast-2

# DynamoDB Table Names
DYNAMODB_USERS_TABLE=multi-tenancy-users
DYNAMODB_WORKSPACES_TABLE=multi-tenancy-workspaces
DYNAMODB_PROJECTS_TABLE=multi-tenancy-projects

# S3 Configuration
S3_BUCKET_NAME=multi-tenancy-files-bucket
```

## Security Features

1. **User Isolation**: Complete separation of user data
2. **Workspace Isolation**: Users can only access their own workspaces
3. **Project Isolation**: Projects are scoped to workspaces and users
4. **File Isolation**: S3 keys enforce user/workspace/project hierarchy
5. **Password Security**: Bcrypt hashing with high salt rounds
6. **Pre-signed URLs**: Secure, time-limited file access (1 hour expiry)
7. **Input Validation**: All API endpoints validate required parameters
8. **Error Handling**: Proper error responses without information leakage

## Usage Limits

All limits are configurable via `src/config/global-config.ts`:

- **Workspaces per user**: 10 (default, configurable)
- **Projects per workspace**: 10 (default, configurable)  
- **Files per project**: 5 (default, configurable)
- **File size limit**: 2MB per file (default, configurable)
- **File download URLs**: 1-hour expiry

### Configuration System

The application uses a centralized configuration system that allows easy modification of all limits:

```typescript
// src/config/global-config.ts
export const LIMITS = {
  WORKSPACES_PER_USER: 10,
  PROJECTS_PER_WORKSPACE: 10,
  FILES_PER_PROJECT: 5,
  MAX_FILE_SIZE_BYTES: 2 * 1024 * 1024, // 2MB
  MAX_FILE_SIZE_MB: 2,
} as const
```

The UI automatically displays current limits to users and enforces them both client-side and server-side.

## Development

### Setup
1. Install dependencies: `npm install`
2. Configure environment variables in `.env.local`
3. Ensure AWS credentials and S3 bucket are set up
4. Run development server: `npm run dev`

### Build
- Development: `npm run dev`
- Production build: `npm run build`
- Linting: `npm run lint`

### Deployment
The application is ready for deployment on Vercel or any Next.js-compatible platform. Ensure all environment variables are properly configured in the deployment environment.

## Future Enhancements

1. **OAuth Integration**: The authentication system is designed to easily accommodate OAuth providers
2. **File Previews**: Add support for previewing common file types
3. **File Deletion**: Implement file deletion functionality
4. **Workspace Sharing**: Add ability to share workspaces between users
5. **Advanced Permissions**: Role-based access control within workspaces
6. **File Versioning**: Support for multiple versions of the same file
7. **Audit Logging**: Track user actions for compliance and debugging