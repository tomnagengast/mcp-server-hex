import { config as dotenvConfig } from 'dotenv';
import { HexConfig } from '../types/index.js';

dotenvConfig();

export const config: HexConfig = {
  apiToken: process.env.HEX_API_TOKEN || '',
  baseUrl: process.env.HEX_API_BASE_URL || 'https://app.hex.tech/api/v1',
  timeout: parseInt(process.env.HEX_REQUEST_TIMEOUT || '30000', 10),
  debug: process.env.HEX_DEBUG === 'true',
};

export function validateConfig(): void {
  if (!config.apiToken) {
    throw new Error(
      'HEX_API_TOKEN environment variable is required. ' +
      'Please set it in your .env file or environment variables.'
    );
  }

  if (!config.baseUrl) {
    throw new Error(
      'HEX_API_BASE_URL environment variable is required. ' +
      'Please set it in your .env file or environment variables.'
    );
  }

  if (config.timeout < 1000) {
    throw new Error(
      'HEX_REQUEST_TIMEOUT must be at least 1000ms (1 second)'
    );
  }
}