#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  CallToolResult,
  Tool,
  Resource,
} from '@modelcontextprotocol/sdk/types.js';
import { HexAuth } from './auth/hex-auth.js';
import { HexProjectTools } from './tools/project-tools.js';
import { HexExecutionTools } from './tools/execution-tools.js';
import { logger } from './utils/logger.js';
import { config } from './utils/config.js';

class HexMCPServer {
  private server: Server;
  private auth: HexAuth;
  private projectTools: HexProjectTools;
  private executionTools: HexExecutionTools;

  constructor() {
    this.server = new Server(
      {
        name: 'mcp-server-hex',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.auth = new HexAuth();
    this.projectTools = new HexProjectTools(this.auth);
    this.executionTools = new HexExecutionTools(this.auth);

    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools: Tool[] = [
        ...this.projectTools.getToolDefinitions(),
        ...this.executionTools.getToolDefinitions(),
      ];

      return {
        tools,
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        let result: CallToolResult;

        if (this.projectTools.canHandleTool(name)) {
          result = await this.projectTools.callTool(name, args || {});
        } else if (this.executionTools.canHandleTool(name)) {
          result = await this.executionTools.callTool(name, args || {});
        } else {
          throw new Error(`Unknown tool: ${name}`);
        }

        return result;
      } catch (error) {
        logger.error(`Error calling tool ${name}:`, error);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    });

    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [],
      };
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      throw new Error(`Resource not found: ${request.params.uri}`);
    });
  }

  async run(): Promise<void> {
    try {
      await this.auth.initialize();
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      logger.info('Hex MCP Server started successfully');
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

const server = new HexMCPServer();
server.run().catch((error) => {
  logger.error('Server error:', error);
  process.exit(1);
});