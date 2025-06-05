import { Tool, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { HexAuth } from '../auth/hex-auth.js';
import { 
  HexProjectRun, 
  HexRunProjectRequest, 
  HexRunProjectResponse 
} from '../types/index.js';
import { logger } from '../utils/logger.js';

export class HexExecutionTools {
  constructor(private auth: HexAuth) {}

  getToolDefinitions(): Tool[] {
    return [
      {
        name: 'hex_run_project',
        description: 'Trigger execution of a Hex project with optional input parameters',
        inputSchema: {
          type: 'object',
          properties: {
            project_id: {
              type: 'string',
              description: 'The unique identifier of the project to run',
            },
            input_params: {
              type: 'object',
              description: 'Input parameters to pass to the project',
            },
            update_published_results: {
              type: 'boolean',
              description: 'Whether to update published app results cache',
              default: false,
            },
            use_cached_sql_results: {
              type: 'boolean',
              description: 'Whether to use cached SQL query results for performance',
              default: true,
            },
            notification_config: {
              type: 'object',
              description: 'Notification configuration for run completion',
              properties: {
                on_success: {
                  type: 'boolean',
                  description: 'Send notification on successful completion',
                  default: false,
                },
                on_failure: {
                  type: 'boolean',
                  description: 'Send notification on failure',
                  default: true,
                },
                emails: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Email addresses to notify',
                },
              },
            },
          },
          required: ['project_id'],
        },
      },
      {
        name: 'hex_get_run_status',
        description: 'Get the status and details of a specific project run',
        inputSchema: {
          type: 'object',
          properties: {
            project_id: {
              type: 'string',
              description: 'The unique identifier of the project',
            },
            run_id: {
              type: 'string',
              description: 'The unique identifier of the run',
            },
          },
          required: ['project_id', 'run_id'],
        },
      },
      {
        name: 'hex_cancel_run',
        description: 'Cancel an ongoing project run',
        inputSchema: {
          type: 'object',
          properties: {
            project_id: {
              type: 'string',
              description: 'The unique identifier of the project',
            },
            run_id: {
              type: 'string',
              description: 'The unique identifier of the run to cancel',
            },
          },
          required: ['project_id', 'run_id'],
        },
      },
      {
        name: 'hex_get_project_runs',
        description: 'Get the run history for a specific project',
        inputSchema: {
          type: 'object',
          properties: {
            project_id: {
              type: 'string',
              description: 'The unique identifier of the project',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of runs to return (1-100)',
              minimum: 1,
              maximum: 100,
              default: 10,
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'RUNNING', 'SUCCESS', 'ERROR', 'CANCELLED'],
              description: 'Filter runs by status',
            },
          },
          required: ['project_id'],
        },
      },
    ];
  }

  canHandleTool(name: string): boolean {
    return [
      'hex_run_project',
      'hex_get_run_status', 
      'hex_cancel_run',
      'hex_get_project_runs'
    ].includes(name);
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<CallToolResult> {
    switch (name) {
      case 'hex_run_project':
        return this.runProject(args);
      case 'hex_get_run_status':
        return this.getRunStatus(args);
      case 'hex_cancel_run':
        return this.cancelRun(args);
      case 'hex_get_project_runs':
        return this.getProjectRuns(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  private async runProject(args: Record<string, unknown>): Promise<CallToolResult> {
    try {
      const projectId = args.project_id;
      if (typeof projectId !== 'string') {
        throw new Error('project_id must be a string');
      }

      const requestBody: HexRunProjectRequest = {
        projectId,
      };

      if (args.input_params && typeof args.input_params === 'object') {
        requestBody.inputParams = args.input_params as Record<string, unknown>;
      }

      if (typeof args.update_published_results === 'boolean') {
        requestBody.updatePublishedResults = args.update_published_results;
      }

      if (typeof args.use_cached_sql_results === 'boolean') {
        requestBody.useCachedSqlResults = args.use_cached_sql_results;
      }

      if (args.notification_config && typeof args.notification_config === 'object') {
        requestBody.notificationConfig = args.notification_config as any;
      }

      logger.debug('Running project:', projectId);

      const response = await this.auth.makeRequest<HexRunProjectResponse>(`/projects/${projectId}/runs`, {
        method: 'POST',
        body: requestBody,
      });

      if (this.auth.isApiError(response)) {
        throw new Error(response.error.message);
      }

      let content = `**Project Run Started Successfully**\n\n`;
      content += `**Project ID:** ${projectId}\n`;
      content += `**Run ID:** ${response.runId}\n`;
      content += `**Status:** ${response.status}\n`;
      content += `**Started At:** ${new Date(response.startedAt).toLocaleString()}\n\n`;
      
      if (requestBody.inputParams) {
        content += `**Input Parameters:**\n\`\`\`json\n${JSON.stringify(requestBody.inputParams, null, 2)}\n\`\`\`\n\n`;
      }

      content += `*Use \`hex_get_run_status\` with project_id="${projectId}" and run_id="${response.runId}" to check the progress.*`;

      return {
        content: [
          {
            type: 'text',
            text: content,
          },
        ],
      };
    } catch (error) {
      logger.error('Error running project:', error);
      throw error;
    }
  }

  private async getRunStatus(args: Record<string, unknown>): Promise<CallToolResult> {
    try {
      const projectId = args.project_id;
      const runId = args.run_id;
      
      if (typeof projectId !== 'string') {
        throw new Error('project_id must be a string');
      }
      if (typeof runId !== 'string') {
        throw new Error('run_id must be a string');
      }

      logger.debug('Getting run status for:', { projectId, runId });

      const response = await this.auth.makeRequest<HexProjectRun>(`/projects/${projectId}/runs/${runId}`, {
        method: 'GET',
      });

      if (this.auth.isApiError(response)) {
        throw new Error(response.error.message);
      }

      const run = response;
      let content = `**Project Run Status**\n\n`;
      content += `**Project ID:** ${run.projectId}\n`;
      content += `**Run ID:** ${run.runId}\n`;
      content += `**Status:** ${run.status}\n`;
      content += `**Started At:** ${new Date(run.startedAt).toLocaleString()}\n`;
      
      if (run.completedAt) {
        content += `**Completed At:** ${new Date(run.completedAt).toLocaleString()}\n`;
      }
      
      if (run.executionTime) {
        content += `**Execution Time:** ${Math.round(run.executionTime / 1000)} seconds\n`;
      }
      
      content += `**Triggered By:** ${run.triggeredBy.name} (${run.triggeredBy.email})\n\n`;

      if (run.status === 'SUCCESS') {
        content += `✅ **Run completed successfully!**\n`;
        if (run.outputParams) {
          content += `\n**Output Parameters:**\n\`\`\`json\n${JSON.stringify(run.outputParams, null, 2)}\n\`\`\`\n`;
        }
      } else if (run.status === 'ERROR') {
        content += `❌ **Run failed with error:**\n${run.errorMessage || 'Unknown error'}\n`;
      } else if (run.status === 'CANCELLED') {
        content += `🛑 **Run was cancelled**\n`;
      } else if (run.status === 'RUNNING') {
        content += `⏳ **Run is currently in progress...**\n`;
      } else if (run.status === 'PENDING') {
        content += `⏱️ **Run is pending execution...**\n`;
      }

      if (run.inputParams) {
        content += `\n**Input Parameters:**\n\`\`\`json\n${JSON.stringify(run.inputParams, null, 2)}\n\`\`\`\n`;
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
      logger.error('Error getting run status:', error);
      throw error;
    }
  }

  private async cancelRun(args: Record<string, unknown>): Promise<CallToolResult> {
    try {
      const projectId = args.project_id;
      const runId = args.run_id;
      
      if (typeof projectId !== 'string') {
        throw new Error('project_id must be a string');
      }
      if (typeof runId !== 'string') {
        throw new Error('run_id must be a string');
      }

      logger.debug('Cancelling run:', { projectId, runId });

      const response = await this.auth.makeRequest(`/projects/${projectId}/runs/${runId}/cancel`, {
        method: 'POST',
      });

      if (this.auth.isApiError(response)) {
        throw new Error(response.error.message);
      }

      const content = `**Run Cancelled Successfully**\n\n` +
        `**Project ID:** ${projectId}\n` +
        `**Run ID:** ${runId}\n\n` +
        `The run has been cancelled and will stop execution.`;

      return {
        content: [
          {
            type: 'text',
            text: content,
          },
        ],
      };
    } catch (error) {
      logger.error('Error cancelling run:', error);
      throw error;
    }
  }

  private async getProjectRuns(args: Record<string, unknown>): Promise<CallToolResult> {
    try {
      const projectId = args.project_id;
      if (typeof projectId !== 'string') {
        throw new Error('project_id must be a string');
      }

      const params: Record<string, string | number> = {};
      
      if (typeof args.limit === 'number') {
        params.limit = args.limit;
      }
      
      if (typeof args.status === 'string') {
        params.status = args.status;
      }

      logger.debug('Getting project runs for:', projectId);

      const response = await this.auth.makeRequest<{ runs: HexProjectRun[] }>(`/projects/${projectId}/runs`, {
        method: 'GET',
        params,
      });

      if (this.auth.isApiError(response)) {
        throw new Error(response.error.message);
      }

      const runs = response.runs || [];
      let content = `**Project Run History**\n\n`;
      content += `**Project ID:** ${projectId}\n`;
      content += `**Total Runs:** ${runs.length}\n\n`;

      if (runs.length === 0) {
        content += 'No runs found for this project.';
      } else {
        runs.forEach((run, index) => {
          const statusEmoji = {
            'SUCCESS': '✅',
            'ERROR': '❌',
            'CANCELLED': '🛑',
            'RUNNING': '⏳',
            'PENDING': '⏱️',
          }[run.status] || '❓';

          content += `${index + 1}. ${statusEmoji} **${run.status}** (${run.runId})\n`;
          content += `   Started: ${new Date(run.startedAt).toLocaleString()}\n`;
          
          if (run.completedAt) {
            content += `   Completed: ${new Date(run.completedAt).toLocaleString()}\n`;
          }
          
          if (run.executionTime) {
            content += `   Duration: ${Math.round(run.executionTime / 1000)} seconds\n`;
          }
          
          content += `   Triggered by: ${run.triggeredBy.name}\n`;
          
          if (run.errorMessage) {
            content += `   Error: ${run.errorMessage}\n`;
          }
          
          content += '\n';
        });
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
      logger.error('Error getting project runs:', error);
      throw error;
    }
  }
}