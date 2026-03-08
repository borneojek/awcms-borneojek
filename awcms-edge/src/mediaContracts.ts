export interface UploadSessionRequest {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

export interface UploadSessionResponse {
  sessionId: string;
  uploadUrl: string;
  expiresAt: string;
  storageKey: string;
}

export interface CompleteSessionRequest {
  sessionId: string;
}

export interface MediaObjectResponse {
  id: string;
  fileName: string;
  url: string; // The presigned GET url or public URL
}

export const MEDIA_ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  BAD_REQUEST: 'BAD_REQUEST',
  SERVER_ERROR: 'SERVER_ERROR'
} as const;

export function generateStorageKey(tenantId: string, fileName: string): string {
  const timestamp = Date.now();
  const safeName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  return `tenants/${tenantId}/${timestamp}_${safeName}`;
}
