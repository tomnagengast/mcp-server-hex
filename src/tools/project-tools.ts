import { Tool, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { HexAuth } from '../auth/hex-auth.js';
import { 
  HexProject, 
  HexProjectListResponse, 
  HexPaginationOptions,
  HexPresignedUrlRequest,
  HexPresignedUrlResponse
} from '../types/index.js';
import { logger } from '../utils/logger.js';

export class HexProjectTools {
  constructor(private auth: HexAuth) {}

  getToolDefinitions(): Tool[] {
    return [
      {
        name: 'hex_list_projects',
        description: 'List all viewable projects in the Hex workspace',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Maximum number of projects to return (1-100)',
              minimum: 1,
              maximum: 100,
              default: 20,
            },
            after: {
              type: 'string',
              description: 'Pagination cursor for retrieving next page of results',
            },
          },
        },
      },
      {
        name: 'hex_get_project',
        description: 'Get detailed information about a specific Hex project',
        inputSchema: {
          type: 'object',
          properties: {
            project_id: {
              type: 'string',
              description: 'The unique identifier of the project',
            },
          },
          required: ['project_id'],
        },
      },
      {
        name: 'hex_create_presigned_url',
        description: 'Create a presigned URL for embedding a Hex project',
        inputSchema: {
          type: 'object',
          properties: {
            project_id: {
              type: 'string',
              description: 'The unique identifier of the project',
            },
            theme: {
              type: 'string',
              enum: ['light', 'dark'],
              description: 'Theme for the embedded project',
              default: 'light',
            },
            hide_header: {
              type: 'boolean',
              description: 'Whether to hide the header in the embedded view',
              default: false,
            },
            hide_controls: {
              type: 'boolean',
              description: 'Whether to hide controls in the embedded view',
              default: false,
            },
            fullscreen: {
              type: 'boolean',
              description: 'Whether to display in fullscreen mode',
              default: false,
            },
            input_params: {
              type: 'object',
              description: 'Input parameters to pass to the project',
            },
          },
          required: ['project_id'],
        },
      },
    ];
  }

  canHandleTool(name: string): boolean {
    return ['hex_list_projects', 'hex_get_project', 'hex_create_presigned_url'].includes(name);
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<CallToolResult> {
    switch (name) {
      case 'hex_list_projects':
        return this.listProjects(args);
      case 'hex_get_project':
        return this.getProject(args);
      case 'hex_create_presigned_url':
        return this.createPresignedUrl(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  private async listProjects(args: Record<string, unknown>): Promise<CallToolResult> {
    try {
      const options: HexPaginationOptions = {
        limit: typeof args.limit === 'number' ? args.limit : 20,
      };
      
      if (typeof args.after === 'string') {
        options.after = args.after;
      }

      logger.debug('Listing projects with options:', options);

      const response = await this.auth.makeRequest<HexProjectListResponse>('/projects', {
        method: 'GET',
        params: {
          ...(options.limit && { limit: options.limit }),
          ...(options.after && { after: options.after }),
        },
      });

      if (this.auth.isApiError(response)) {
        throw new Error(response.error.message);
      }

      const projects = response.projects || [];
      const summary = `Found ${projects.length} project${projects.length !== 1 ? 's' : ''}`;
      
      let content = `${summary}\n\n`;
      
      if (projects.length === 0) {
        content += 'No projects found in this workspace.';
      } else {
        projects.forEach((project, index) => {
          content += `${index + 1}. **${project.name}** (${project.projectId})\n`;
          content += `   Status: ${project.status}\n`;
          content += `   Visibility: ${project.visibility}\n`;
          content += `   Author: ${project.author.name} (${project.author.email})\n`;
          content += `   Updated: ${new Date(project.updatedAt).toLocaleString()}\n`;
          if (project.description) {
            content += `   Description: ${project.description}\n`;
          }
          if (project.tags && project.tags.length > 0) {
            content += `   Tags: ${project.tags.join(', ')}\n`;
          }
          content += '\n';
        });

        if (response.hasMore) {
          content += `\n*Note: There are more projects available. Use the 'after' parameter with value '${response.nextCursor}' to get the next page.*`;
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: content,
          },
        ],
      };
    } catch (error) {
      logger.error('Error listing projects:', error);
      throw error;
    }
  }

  private async getProject(args: Record<string, unknown>): Promise<CallToolResult> {
    try {
      const projectId = args.project_id;
      if (typeof projectId !== 'string') {
        throw new Error('project_id must be a string');
      }

      logger.debug('Getting project details for:', projectId);

      const response = await this.auth.makeRequest<HexProject>(`/projects/${projectId}`, {
        method: 'GET',
      });

      if (this.auth.isApiError(response)) {
        throw new Error(response.error.message);
      }

      const project = response;
      let content = `# ${project.name}\n\n`;
      content += `**Project ID:** ${project.projectId}\n`;
      content += `**Status:** ${project.status}\n`;
      content += `**Visibility:** ${project.visibility}\n`;
      content += `**Author:** ${project.author.name} (${project.author.email})\n`;
      content += `**Workspace:** ${project.workspace.name}\n`;
      content += `**Created:** ${new Date(project.createdAt).toLocaleString()}\n`;
      content += `**Updated:** ${new Date(project.updatedAt).toLocaleString()}\n`;
      
      if (project.description) {
        content += `\n**Description:**\n${project.description}\n`;
      }
      
      if (project.tags && project.tags.length > 0) {
        content += `\n**Tags:** ${project.tags.join(', ')}\n`;
      }

      return {
        content: [
          {
            type: 'text',
            text: content,
          },
        ],
      };
    } catch (error) {
      logger.error('Error getting project:', error);
      throw error;
    }
  }

  private async createPresignedUrl(args: Record<string, unknown>): Promise<CallToolResult> {
    try {
      const projectId = args.project_id;
      if (typeof projectId !== 'string') {
        throw new Error('project_id must be a string');
      }

      const requestBody: HexPresignedUrlRequest = {
        projectId,
        theme: typeof args.theme === 'string' ? args.theme as 'light' | 'dark' : 'light',
        hideHeader: typeof args.hide_header === 'boolean' ? args.hide_header : false,
        hideControls: typeof args.hide_controls === 'boolean' ? args.hide_controls : false,
        fullscreen: typeof args.fullscreen === 'boolean' ? args.fullscreen : false,
      };

      if (args.input_params && typeof args.input_params === 'object') {
        requestBody.inputParams = args.input_params as Record<string, unknown>;
      }

      logger.debug('Creating presigned URL for project:', projectId);

      const response = await this.auth.makeRequest<HexPresignedUrlResponse>('/presigned-urls', {
        method: 'POST',
        body: requestBody,
      });

      if (this.auth.isApiError(response)) {
        throw new Error(response.error.message);
      }

      const content = `**Presigned URL Created Successfully**\n\n`;
      const urlContent = `**URL:** ${response.url}\n`;
      const expiresContent = `**Expires:** ${new Date(response.expiresAt).toLocaleString()}\n\n`;
      const configContent = `**Configuration:**\n`;
      const themeContent = `- Theme: ${requestBody.theme}\n`;
      const headerContent = `- Hide Header: ${requestBody.hideHeader}\n`;
      const controlsContent = `- Hide Controls: ${requestBody.hideControls}\n`;
      const fullscreenContent = `- Fullscreen: ${requestBody.fullscreen}\n`;
      
      let paramsContent = '';
      if (requestBody.inputParams) {
        paramsContent = `- Input Parameters: ${JSON.stringify(requestBody.inputParams, null, 2)}\n`;
      }

      return {
        content: [
          {
            type: 'text',
            text: content + urlContent + expiresContent + configContent + themeContent + headerContent + controlsContent + fullscreenContent + paramsContent,
          },
        ],
      };
    } catch (error) {
      logger.error('Error creating presigned URL:', error);
      throw error;
    }
  }
}