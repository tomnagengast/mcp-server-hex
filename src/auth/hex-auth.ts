import { HexConfig, HexApiResponse, HexApiError } from '../types/index.js';
import { config, validateConfig } from '../utils/config.js';
import { logger } from '../utils/logger.js';

export class HexAuth {
  private config: HexConfig;
  private initialized = false;

  constructor() {
    this.config = config;
  }

  async initialize(): Promise<void> {
    try {
      validateConfig();
      await this.validateConnection();
      this.initialized = true;
      logger.info('Hex authentication initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Hex authentication:', error);
      throw error;
    }
  }

  private async validateConnection(): Promise<void> {
    try {
      const response = await this.makeRequest('/projects', {
        method: 'GET',
        params: { limit: 1 },
      });

      if (this.isApiError(response)) {
        throw new Error(`Authentication failed: ${response.error.message}`);
      }

      logger.debug('Hex API connection validated successfully');
    } catch (error) {
      if (error instanceof Error && error.message.includes('401')) {
        throw new Error(
          'Invalid Hex API token. Please check your HEX_API_TOKEN environment variable.'
        );
      }
      throw error;
    }
  }

  async makeRequest<T>(
    endpoint: string,
    options: {
      method: 'GET' | 'POST' | 'PUT' | 'DELETE';
      body?: unknown;
      params?: Record<string, string | number>;
    }
  ): Promise<HexApiResponse<T>> {
    if (!this.initialized) {
      throw new Error('Hex authentication not initialized. Call initialize() first.');
    }

    const url = new URL(endpoint, this.config.baseUrl);
    
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const requestOptions: RequestInit = {
      method: options.method,
      headers: {
        'Authorization': `Bearer ${this.config.apiToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(this.config.timeout),
    };

    if (options.body && options.method !== 'GET') {
      requestOptions.body = JSON.stringify(options.body);
    }

    logger.debug(`Making ${options.method} request to ${url.toString()}`);

    try {
      const response = await fetch(url.toString(), requestOptions);
      const responseData = await response.json();

      if (!response.ok) {
        logger.error(`API request failed with status ${response.status}:`, responseData);
        
        if (response.status === 429) {
          throw new Error(
            'Rate limit exceeded. Hex API allows 60 requests per minute. Please wait and try again.'
          );
        }
        
        if (response.status === 401) {
          throw new Error(
            'Authentication failed. Please check your HEX_API_TOKEN.'
          );
        }
        
        if (response.status >= 500) {
          throw new Error(
            'Hex API server error. Please try again later.'
          );
        }

        return responseData as HexApiError;
      }

      logger.debug(`API request successful:`, responseData);
      return responseData as T;
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new Error(`Request timeout after ${this.config.timeout}ms`);
      }
      throw error;
    }
  }

  isApiError(response: unknown): response is HexApiError {
    return (
      typeof response === 'object' &&
      response !== null &&
      'error' in response &&
      typeof (response as any).error === 'object' &&
      'code' in (response as any).error &&
      'message' in (response as any).error
    );
  }

  getConfig(): HexConfig {
    return { ...this.config };
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}