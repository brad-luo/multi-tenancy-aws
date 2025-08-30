import { 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand, 
  DeleteObjectsCommand,
  ListObjectsV2Command
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, S3_BUCKET } from './aws-config';
import { FileItem } from '@/types';
import { getProjectById } from './project';
import { LIMITS, canAddFile, isFileSizeValid } from '@/config/global-config';

// S3 object structure: users/{userId}/workspaces/{workspaceId}/projects/{projectId}/{fileName}
export function generateS3Key(userId: string, workspaceId: string, projectId: string, fileName: string): string {
  return `users/${userId}/workspaces/${workspaceId}/projects/${projectId}/${fileName}`;
}

export async function uploadFile(
  file: File,
  userId: string,
  workspaceId: string,
  projectId: string
): Promise<FileItem | null> {
  try {
    // Verify project ownership
    const project = await getProjectById(projectId);
    if (!project || project.userId !== userId || project.workspaceId !== workspaceId) {
      throw new Error('Project not found or access denied');
    }

    // Check file size limit
    if (!isFileSizeValid(file.size)) {
      throw new Error(`File size exceeds the maximum allowed size of ${LIMITS.MAX_FILE_SIZE_MB}MB`);
    }

    // Check file count limit
    const existingFiles = await listProjectFiles(userId, workspaceId, projectId);
    if (!canAddFile(existingFiles.length)) {
      throw new Error(`Maximum file limit (${LIMITS.FILES_PER_PROJECT}) reached for this project`);
    }

    const key = generateS3Key(userId, workspaceId, projectId, file.name);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await s3Client.send(new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      Metadata: {
        originalName: file.name,
        userId,
        workspaceId,
        projectId,
      },
    }));

    const fileItem: FileItem = {
      key,
      name: file.name,
      size: file.size,
      lastModified: new Date().toISOString(),
      projectId,
      workspaceId,
      userId,
    };

    return fileItem;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
}

export async function getFileDownloadUrl(
  key: string,
  userId: string,
  workspaceId: string,
  projectId: string
): Promise<string | null> {
  try {
    // Verify project ownership
    const project = await getProjectById(projectId);
    if (!project || project.userId !== userId || project.workspaceId !== workspaceId) {
      throw new Error('Project not found or access denied');
    }

    // Verify the key belongs to this user/workspace/project
    const expectedPrefix = `users/${userId}/workspaces/${workspaceId}/projects/${projectId}/`;
    if (!key.startsWith(expectedPrefix)) {
      throw new Error('Access denied: Invalid file key');
    }

    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });

    // Generate a signed URL that expires in 1 hour
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return signedUrl;
  } catch (error) {
    console.error('Error getting file download URL:', error);
    return null;
  }
}

export async function deleteFile(
  key: string,
  userId: string,
  workspaceId: string,
  projectId: string
): Promise<boolean> {
  try {
    // Verify project ownership
    const project = await getProjectById(projectId);
    if (!project || project.userId !== userId || project.workspaceId !== workspaceId) {
      throw new Error('Project not found or access denied');
    }

    // Verify the key belongs to this user/workspace/project
    const expectedPrefix = `users/${userId}/workspaces/${workspaceId}/projects/${projectId}/`;
    if (!key.startsWith(expectedPrefix)) {
      throw new Error('Access denied: Invalid file key');
    }

    await s3Client.send(new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    }));

    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

export async function listProjectFiles(
  userId: string,
  workspaceId: string,
  projectId: string
): Promise<FileItem[]> {
  try {
    // Verify project ownership
    const project = await getProjectById(projectId);
    if (!project || project.userId !== userId || project.workspaceId !== workspaceId) {
      throw new Error('Project not found or access denied');
    }

    const prefix = `users/${userId}/workspaces/${workspaceId}/projects/${projectId}/`;
    
    const result = await s3Client.send(new ListObjectsV2Command({
      Bucket: S3_BUCKET,
      Prefix: prefix,
    }));

    if (!result.Contents) {
      return [];
    }

    const files: FileItem[] = result.Contents.map(obj => {
      const fileName = obj.Key?.replace(prefix, '') || '';
      return {
        key: obj.Key || '',
        name: fileName,
        size: obj.Size || 0,
        lastModified: obj.LastModified?.toISOString() || new Date().toISOString(),
        projectId,
        workspaceId,
        userId,
      };
    });

    return files;
  } catch (error) {
    console.error('Error listing project files:', error);
    return [];
  }
}

export async function getFileUploadUrl(
  fileName: string,
  userId: string,
  workspaceId: string,
  projectId: string,
  contentType?: string
): Promise<{ uploadUrl: string; key: string } | null> {
  try {
    // Verify project ownership
    const project = await getProjectById(projectId);
    if (!project || project.userId !== userId || project.workspaceId !== workspaceId) {
      throw new Error('Project not found or access denied');
    }

    const key = generateS3Key(userId, workspaceId, projectId, fileName);
    
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: contentType,
      Metadata: {
        originalName: fileName,
        userId,
        workspaceId,
        projectId,
      },
    });

    // Generate a signed URL that expires in 1 hour
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    return { uploadUrl, key };
  } catch (error) {
    console.error('Error getting file upload URL:', error);
    return null;
  }
}

export async function deleteProjectFiles(
  userId: string,
  workspaceId: string,
  projectId: string
): Promise<boolean> {
  try {
    const prefix = `users/${userId}/workspaces/${workspaceId}/projects/${projectId}/`;
    let continuationToken: string | undefined;
    let hasMoreObjects = true;

    while (hasMoreObjects) {
      const listResult = await s3Client.send(new ListObjectsV2Command({
        Bucket: S3_BUCKET,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      }));

      if (!listResult.Contents || listResult.Contents.length === 0) {
        break;
      }

      const objectsToDelete = listResult.Contents.map(obj => ({ Key: obj.Key! }));
      
      await s3Client.send(new DeleteObjectsCommand({
        Bucket: S3_BUCKET,
        Delete: {
          Objects: objectsToDelete,
          Quiet: true,
        },
      }));

      hasMoreObjects = listResult.IsTruncated || false;
      continuationToken = listResult.NextContinuationToken;
    }

    return true;
  } catch (error) {
    console.error('Error deleting project files:', error);
    return false;
  }
}

export async function deleteWorkspaceFiles(
  userId: string,
  workspaceId: string
): Promise<boolean> {
  try {
    const prefix = `users/${userId}/workspaces/${workspaceId}/`;
    let continuationToken: string | undefined;
    let hasMoreObjects = true;

    while (hasMoreObjects) {
      const listResult = await s3Client.send(new ListObjectsV2Command({
        Bucket: S3_BUCKET,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      }));

      if (!listResult.Contents || listResult.Contents.length === 0) {
        break;
      }

      const objectsToDelete = listResult.Contents.map(obj => ({ Key: obj.Key! }));
      
      await s3Client.send(new DeleteObjectsCommand({
        Bucket: S3_BUCKET,
        Delete: {
          Objects: objectsToDelete,
          Quiet: true,
        },
      }));

      hasMoreObjects = listResult.IsTruncated || false;
      continuationToken = listResult.NextContinuationToken;
    }

    return true;
  } catch (error) {
    console.error('Error deleting workspace files:', error);
    return false;
  }
}