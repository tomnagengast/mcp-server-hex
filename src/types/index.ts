export interface HexConfig {
  apiToken: string;
  baseUrl: string;
  timeout: number;
  debug: boolean;
}

export interface HexProject {
  projectId: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'DRAFT';
  createdAt: string;
  updatedAt: string;
  author: {
    userId: string;
    name: string;
    email: string;
  };
  workspace: {
    workspaceId: string;
    name: string;
  };
  visibility: 'PUBLIC' | 'PRIVATE' | 'WORKSPACE';
  tags?: string[];
}

export interface HexProjectListResponse {
  projects: HexProject[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface HexProjectRun {
  runId: string;
  projectId: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'ERROR' | 'CANCELLED';
  startedAt: string;
  completedAt?: string;
  executionTime?: number;
  inputParams?: Record<string, unknown>;
  outputParams?: Record<string, unknown>;
  errorMessage?: string;
  triggeredBy: {
    userId: string;
    name: string;
    email: string;
  };
}

export interface HexRunProjectRequest {
  projectId: string;
  inputParams?: Record<string, unknown>;
  updatePublishedResults?: boolean;
  useCachedSqlResults?: boolean;
  notificationConfig?: {
    onSuccess?: boolean;
    onFailure?: boolean;
    emails?: string[];
  };
}

export interface HexRunProjectResponse {
  runId: string;
  status: 'PENDING' | 'RUNNING';
  startedAt: string;
}

export interface HexPresignedUrlRequest {
  projectId: string;
  theme?: 'light' | 'dark';
  hideHeader?: boolean;
  hideControls?: boolean;
  fullscreen?: boolean;
  inputParams?: Record<string, unknown>;
}

export interface HexPresignedUrlResponse {
  url: string;
  expiresAt: string;
}

export interface HexApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface HexPaginationOptions {
  limit?: number;
  after?: string;
}

export type HexApiResponse<T> = T | HexApiError;