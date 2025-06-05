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
      {
        name: 'hex_search_projects',
        description: 'Search and filter projects by name, description, tags, or author',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query to match against project name, description, or tags',
            },
            author: {
              type: 'string',
              description: 'Filter by author name or email',
            },
            status: {
              type: 'string',
              enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
              description: 'Filter by project status',
            },
            visibility: {
              type: 'string',
              enum: ['PUBLIC', 'PRIVATE', 'WORKSPACE'],
              description: 'Filter by project visibility',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Filter by specific tags (any project with any of these tags)',
            },
            updated_after: {
              type: 'string',
              description: 'Filter projects updated after this date (ISO 8601 format)',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of projects to return (1-100)',
              minimum: 1,
              maximum: 100,
              default: 20,
            },
          },
        },
      },
      {
        name: 'hex_export_project_data',
        description: 'Generate export URLs or download project results data',
        inputSchema: {
          type: 'object',
          properties: {
            project_id: {
              type: 'string',
              description: 'The unique identifier of the project',
            },
            format: {
              type: 'string',
              enum: ['csv', 'json', 'parquet', 'excel'],
              description: 'Export format for the data',
              default: 'csv',
            },
            include_metadata: {
              type: 'boolean',
              description: 'Include project metadata in the export',
              default: true,
            },
            run_id: {
              type: 'string',
              description: 'Specific run ID to export data from (optional, uses latest successful run if not provided)',
            },
          },
          required: ['project_id'],
        },
      },
      {
        name: 'hex_bulk_run_projects',
        description: 'Run multiple projects in parallel or sequence for batch analysis',
        inputSchema: {
          type: 'object',
          properties: {
            project_configs: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  project_id: { type: 'string' },
                  input_params: { type: 'object' },
                  use_cached_sql_results: { type: 'boolean', default: true },
                },
                required: ['project_id'],
              },
              description: 'Array of project configurations to run',
            },
            execution_mode: {
              type: 'string',
              enum: ['parallel', 'sequential'],
              description: 'Whether to run projects in parallel or sequentially',
              default: 'parallel',
            },
            max_concurrent: {
              type: 'number',
              description: 'Maximum number of concurrent runs (only for parallel mode)',
              minimum: 1,
              maximum: 10,
              default: 5,
            },
            stop_on_error: {
              type: 'boolean',
              description: 'Stop execution if any project fails (only for sequential mode)',
              default: false,
            },
          },
          required: ['project_configs'],
        },
      },
      {
        name: 'hex_get_project_summary',
        description: 'Get a comprehensive summary of multiple projects including status, last run info, and key metrics',
        inputSchema: {
          type: 'object',
          properties: {
            project_ids: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of project IDs to summarize',
            },
            include_run_history: {
              type: 'boolean',
              description: 'Include recent run history for each project',
              default: true,
            },
            include_performance_metrics: {
              type: 'boolean',
              description: 'Include performance metrics like average runtime',
              default: false,
            },
          },
          required: ['project_ids'],
        },
      },
    ];
  }

  canHandleTool(name: string): boolean {
    return [
      'hex_list_projects', 
      'hex_get_project', 
      'hex_create_presigned_url',
      'hex_search_projects',
      'hex_export_project_data',
      'hex_bulk_run_projects',
      'hex_get_project_summary'
    ].includes(name);
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<CallToolResult> {
    switch (name) {
      case 'hex_list_projects':
        return this.listProjects(args);
      case 'hex_get_project':
        return this.getProject(args);
      case 'hex_create_presigned_url':
        return this.createPresignedUrl(args);
      case 'hex_search_projects':
        return this.searchProjects(args);
      case 'hex_export_project_data':
        return this.exportProjectData(args);
      case 'hex_bulk_run_projects':
        return this.bulkRunProjects(args);
      case 'hex_get_project_summary':
        return this.getProjectSummary(args);
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

  private async searchProjects(args: Record<string, unknown>): Promise<CallToolResult> {
    try {
      const allProjects = await this.getAllProjects();
      let filteredProjects = allProjects;

      if (typeof args.query === 'string' && args.query.trim()) {
        const query = args.query.toLowerCase();
        filteredProjects = filteredProjects.filter(project => 
          project.name.toLowerCase().includes(query) ||
          (project.description && project.description.toLowerCase().includes(query)) ||
          (project.tags && project.tags.some(tag => tag.toLowerCase().includes(query)))
        );
      }

      if (typeof args.author === 'string') {
        const author = args.author.toLowerCase();
        filteredProjects = filteredProjects.filter(project => 
          project.author.name.toLowerCase().includes(author) ||
          project.author.email.toLowerCase().includes(author)
        );
      }

      if (typeof args.status === 'string') {
        filteredProjects = filteredProjects.filter(project => project.status === args.status);
      }

      if (typeof args.visibility === 'string') {
        filteredProjects = filteredProjects.filter(project => project.visibility === args.visibility);
      }

      if (Array.isArray(args.tags)) {
        const searchTags = args.tags as string[];
        filteredProjects = filteredProjects.filter(project => 
          project.tags && project.tags.some((tag: string) => searchTags.includes(tag))
        );
      }

      if (typeof args.updated_after === 'string') {
        const afterDate = new Date(args.updated_after);
        filteredProjects = filteredProjects.filter(project => 
          new Date(project.updatedAt) > afterDate
        );
      }

      const limit = typeof args.limit === 'number' ? args.limit : 20;
      const results = filteredProjects.slice(0, limit);

      let content = `**Search Results**\n\n`;
      content += `Found ${results.length} project${results.length !== 1 ? 's' : ''} `;
      if (filteredProjects.length > results.length) {
        content += `(showing first ${results.length} of ${filteredProjects.length} total)`;
      }
      content += '\n\n';

      if (results.length === 0) {
        content += 'No projects match your search criteria.';
      } else {
        results.forEach((project, index) => {
          content += `${index + 1}. **${project.name}** (${project.projectId})\n`;
          content += `   Status: ${project.status} | Visibility: ${project.visibility}\n`;
          content += `   Author: ${project.author.name}\n`;
          content += `   Updated: ${new Date(project.updatedAt).toLocaleString()}\n`;
          if (project.description) {
            content += `   Description: ${project.description}\n`;
          }
          if (project.tags && project.tags.length > 0) {
            content += `   Tags: ${project.tags.join(', ')}\n`;
          }
          content += '\n';
        });
      }

      return {
        content: [{ type: 'text', text: content }],
      };
    } catch (error) {
      logger.error('Error searching projects:', error);
      throw error;
    }
  }

  private async exportProjectData(args: Record<string, unknown>): Promise<CallToolResult> {
    try {
      const projectId = args.project_id;
      if (typeof projectId !== 'string') {
        throw new Error('project_id must be a string');
      }

      const format = (args.format as string) || 'csv';
      const includeMetadata = args.include_metadata !== false;
      const runId = args.run_id as string;

      let content = `**Data Export Request**\n\n`;
      content += `**Project ID:** ${projectId}\n`;
      content += `**Format:** ${format}\n`;
      content += `**Include Metadata:** ${includeMetadata}\n`;
      
      if (runId) {
        content += `**Run ID:** ${runId}\n`;
      } else {
        content += `**Run:** Latest successful run\n`;
      }

      content += '\n**Note:** This is a simulated export function. In a full implementation, this would:\n';
      content += `1. Retrieve the project run results\n`;
      content += `2. Format the data as ${format.toUpperCase()}\n`;
      content += `3. Generate a download URL or return the formatted data\n`;
      content += `4. Include project metadata if requested\n\n`;
      content += `For actual data export, you would need to use Hex's specific export APIs or run the project and retrieve its output parameters.`;

      return {
        content: [{ type: 'text', text: content }],
      };
    } catch (error) {
      logger.error('Error exporting project data:', error);
      throw error;
    }
  }

  private async bulkRunProjects(args: Record<string, unknown>): Promise<CallToolResult> {
    try {
      const projectConfigs = args.project_configs as Array<{
        project_id: string;
        input_params?: Record<string, unknown>;
        use_cached_sql_results?: boolean;
      }>;

      if (!Array.isArray(projectConfigs) || projectConfigs.length === 0) {
        throw new Error('project_configs must be a non-empty array');
      }

      const executionMode = (args.execution_mode as string) || 'parallel';
      const maxConcurrent = (args.max_concurrent as number) || 5;
      const stopOnError = args.stop_on_error !== false;

      let content = `**Bulk Project Execution**\n\n`;
      content += `**Projects to Run:** ${projectConfigs.length}\n`;
      content += `**Execution Mode:** ${executionMode}\n`;
      
      if (executionMode === 'parallel') {
        content += `**Max Concurrent:** ${maxConcurrent}\n`;
      } else {
        content += `**Stop on Error:** ${stopOnError}\n`;
      }
      
      content += '\n**Project Configuration:**\n';
      
      projectConfigs.forEach((config, index) => {
        content += `${index + 1}. Project: ${config.project_id}\n`;
        if (config.input_params) {
          content += `   Input Params: ${Object.keys(config.input_params).length} parameters\n`;
        }
        content += `   Use Cache: ${config.use_cached_sql_results !== false}\n`;
      });

      content += '\n**Note:** This is a simulated bulk execution function. In a full implementation, this would:\n';
      content += `1. Execute projects ${executionMode === 'parallel' ? 'in parallel' : 'sequentially'}\n`;
      content += `2. Monitor progress and handle failures\n`;
      content += `3. Return aggregated results and status\n`;
      content += `4. Respect rate limits and concurrent execution limits\n\n`;
      content += `Use individual \`hex_run_project\` calls for actual project execution.`;

      return {
        content: [{ type: 'text', text: content }],
      };
    } catch (error) {
      logger.error('Error in bulk run projects:', error);
      throw error;
    }
  }

  private async getProjectSummary(args: Record<string, unknown>): Promise<CallToolResult> {
    try {
      const projectIds = args.project_ids as string[];
      if (!Array.isArray(projectIds) || projectIds.length === 0) {
        throw new Error('project_ids must be a non-empty array');
      }

      const includeRunHistory = args.include_run_history !== false;
      const includePerformanceMetrics = args.include_performance_metrics === true;

      let content = `**Project Summary Report**\n\n`;
      content += `**Projects Analyzed:** ${projectIds.length}\n`;
      content += `**Include Run History:** ${includeRunHistory}\n`;
      content += `**Include Performance Metrics:** ${includePerformanceMetrics}\n\n`;

      for (let i = 0; i < projectIds.length; i++) {
        const projectId = projectIds[i];
        try {
          const project = await this.auth.makeRequest<HexProject>(`/projects/${projectId}`, {
            method: 'GET',
          });

          if (this.auth.isApiError(project)) {
            content += `${i + 1}. **${projectId}** - Error: ${project.error.message}\n\n`;
            continue;
          }

          content += `${i + 1}. **${project.name}** (${project.projectId})\n`;
          content += `   Status: ${project.status} | Visibility: ${project.visibility}\n`;
          content += `   Author: ${project.author.name}\n`;
          content += `   Updated: ${new Date(project.updatedAt).toLocaleString()}\n`;

          if (includeRunHistory) {
            try {
              const runs = await this.auth.makeRequest<{ runs: any[] }>(`/projects/${projectId}/runs`, {
                method: 'GET',
                params: { limit: 5 },
              });

              if (!this.auth.isApiError(runs)) {
                const recentRuns = runs.runs || [];
                content += `   Recent Runs: ${recentRuns.length} (showing last 5)\n`;
                
                recentRuns.forEach((run: any) => {
                  const statusEmoji: Record<string, string> = {
                    'SUCCESS': '✅',
                    'ERROR': '❌',
                    'CANCELLED': '🛑',
                    'RUNNING': '⏳',
                    'PENDING': '⏱️',
                  };
                  
                  content += `     ${statusEmoji[run.status] || '❓'} ${run.status} - ${new Date(run.startedAt).toLocaleDateString()}\n`;
                });
              }
            } catch (runError) {
              content += `   Run History: Unable to fetch\n`;
            }
          }

          if (includePerformanceMetrics) {
            content += `   Performance: [Metrics would be calculated from run history]\n`;
          }

          content += '\n';
        } catch (error) {
          content += `${i + 1}. **${projectId}** - Error fetching project details\n\n`;
        }
      }

      return {
        content: [{ type: 'text', text: content }],
      };
    } catch (error) {
      logger.error('Error getting project summary:', error);
      throw error;
    }
  }

  private async getAllProjects(): Promise<HexProject[]> {
    const allProjects: HexProject[] = [];
    let after: string | undefined;
    
    do {
      const response = await this.auth.makeRequest<HexProjectListResponse>('/projects', {
        method: 'GET',
        params: {
          limit: 100,
          ...(after && { after }),
        },
      });

      if (this.auth.isApiError(response)) {
        throw new Error(response.error.message);
      }

      allProjects.push(...(response.projects || []));
      after = response.hasMore ? response.nextCursor : undefined;
    } while (after);

    return allProjects;
  }
}