/**
 * Global configuration for the multi-tenant workspace system
 * This file contains all configurable limits and settings
 */

export const LIMITS = {
  // Workspace limits
  WORKSPACES_PER_USER: 10,
  
  // Project limits
  PROJECTS_PER_WORKSPACE: 10,
  
  // File limits
  FILES_PER_PROJECT: 5,
  MAX_FILE_SIZE_BYTES: 2 * 1024 * 1024, // 2MB
  MAX_FILE_SIZE_MB: 2,
} as const

export const UI_CONFIG = {
  // Display configuration for limits in the UI
  SHOW_LIMITS: {
    WORKSPACE_COUNT: true,
    PROJECT_COUNT: true,
    FILE_COUNT: true,
    FILE_SIZE: true,
  },
} as const

// Helper functions for working with limits
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const isFileSizeValid = (fileSizeBytes: number): boolean => {
  return fileSizeBytes <= LIMITS.MAX_FILE_SIZE_BYTES
}

export const canAddWorkspace = (currentCount: number): boolean => {
  return currentCount < LIMITS.WORKSPACES_PER_USER
}

export const canAddProject = (currentCount: number): boolean => {
  return currentCount < LIMITS.PROJECTS_PER_WORKSPACE
}

export const canAddFile = (currentCount: number): boolean => {
  return currentCount < LIMITS.FILES_PER_PROJECT
}