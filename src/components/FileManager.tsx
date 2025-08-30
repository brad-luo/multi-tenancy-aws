'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Project, FileItem } from '@/types';
import { Upload, Download, FileIcon, Trash2 } from 'lucide-react';
import { LIMITS, canAddFile, isFileSizeValid, formatFileSize, UI_CONFIG } from '@/config/global-config';

interface FileManagerProps {
  project: Project;
  userId: string;
}

export default function FileManager({ project, userId }: FileManagerProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/files?userId=${userId}&workspaceId=${project.workspaceId}&projectId=${project.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  }, [project.id, project.workspaceId, userId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size
    if (!isFileSizeValid(file.size)) {
      alert(`File size exceeds the maximum allowed size of ${LIMITS.MAX_FILE_SIZE_MB}MB`);
      return;
    }

    // Check file count
    if (!canAddFile(files.length)) {
      alert(`Maximum file limit (${LIMITS.FILES_PER_PROJECT}) reached for this project`);
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('workspaceId', project.workspaceId);
    formData.append('projectId', project.id);

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setFiles(prev => [...prev, data.file]);
      } else {
        alert('Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileDownload = async (file: FileItem) => {
    try {
      const response = await fetch(
        `/api/files?userId=${userId}&workspaceId=${project.workspaceId}&projectId=${project.id}&action=download&key=${encodeURIComponent(file.key)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = file.name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert('Failed to generate download link');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error downloading file');
    }
  };

  const handleFileDelete = async (file: FileItem) => {
    if (!confirm(`Are you sure you want to delete "${file.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(
        `/api/files?userId=${userId}&workspaceId=${project.workspaceId}&projectId=${project.id}&key=${encodeURIComponent(file.key)}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        setFiles(prev => prev.filter(f => f.key !== file.key));
      } else {
        alert('Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error deleting file');
    }
  };


  if (loading) {
    return <div className="text-center">Loading files...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Files</h3>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || !canAddFile(files.length)}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload File'}
          </Button>
        </div>
      </div>

      {UI_CONFIG.SHOW_LIMITS.FILE_COUNT && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            Files: {files.length}/{LIMITS.FILES_PER_PROJECT} • Max size: {LIMITS.MAX_FILE_SIZE_MB}MB per file
          </p>
        </div>
      )}

      {!canAddFile(files.length) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            Maximum file limit reached ({LIMITS.FILES_PER_PROJECT}/{LIMITS.FILES_PER_PROJECT}) for this project. Delete a file to upload a new one.
          </p>
        </div>
      )}

      {files.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <FileIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No files uploaded yet</p>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || !canAddFile(files.length)}
          >
            Upload your first file
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <Card key={file.key}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)} • {new Date(file.lastModified).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFileDownload(file)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFileDelete(file)}
                      className="text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}