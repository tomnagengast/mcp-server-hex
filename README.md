# MCP Server for Hex

A Model Context Protocol (MCP) server that provides seamless integration with [Hex](https://hex.tech), the modern analytics platform. This server enables Claude and other AI assistants to interact with your Hex projects, run analyses, and manage your data workflows.

## Features

### Project Management
- **List Projects**: Browse all accessible projects in your Hex workspace
- **Get Project Details**: Retrieve comprehensive information about specific projects
- **Create Presigned URLs**: Generate embeddable URLs for sharing Hex projects

### Project Execution
- **Run Projects**: Execute Hex projects with custom input parameters
- **Monitor Runs**: Check the status and progress of project executions
- **Cancel Runs**: Stop long-running or stuck project executions
- **Run History**: View execution history and past results

### Advanced Features
- **Rate Limit Handling**: Automatic retry and error handling for API limits
- **Comprehensive Logging**: Debug-friendly logging for troubleshooting
- **Type Safety**: Full TypeScript support with detailed type definitions
- **Error Recovery**: Robust error handling with user-friendly messages

## Installation

### From NPM (Recommended)

```bash
npx github:tomnagengast/mcp-server-hex
```

### From Source

```bash
git clone https://github.com/tomnagengast/mcp-server-hex.git
cd mcp-server-hex
npm install
npm run build
npm start
```

## Configuration

### Environment Variables

Create a `.env` file in your project root:

```bash
# Required: Your Hex API token
HEX_API_TOKEN=your_hex_api_token_here

# Optional: Hex API base URL (defaults to https://app.hex.tech/api/v1)
HEX_API_BASE_URL=https://app.hex.tech/api/v1

# Optional: Request timeout in milliseconds (defaults to 30000)
HEX_REQUEST_TIMEOUT=30000

# Optional: Enable debug logging (defaults to false)
HEX_DEBUG=true
```

### Getting a Hex API Token

1. Log in to your Hex workspace
2. Go to **Settings** → **API Tokens**
3. Click **Create Token**
4. Choose between:
   - **Personal Access Token**: Time-limited, tied to your user account
   - **Workspace Token**: Can be configured to never expire, tied to the workspace
5. Copy the token and add it to your `.env` file

### Claude Desktop Configuration

Add this to your Claude Desktop configuration file:

#### Using NPX (Recommended)
```json
{
  "mcpServers": {
    "hex": {
      "command": "npx",
      "args": ["github:tomnagengast/mcp-server-hex"],
      "env": {
        "HEX_API_TOKEN": "your_hex_api_token_here"
      }
    }
  }
}
```

#### Using Local Installation
```json
{
  "mcpServers": {
    "hex": {
      "command": "node",
      "args": ["path/to/mcp-server-hex/dist/index.js"],
      "env": {
        "HEX_API_TOKEN": "your_hex_api_token_here"
      }
    }
  }
}
```

## Available Tools

### Project Management Tools

#### `hex_list_projects`
List all viewable projects in your Hex workspace.

**Parameters:**
- `limit` (optional): Maximum number of projects to return (1-100, default: 20)
- `after` (optional): Pagination cursor for next page of results

#### `hex_get_project`
Get detailed information about a specific project.

**Parameters:**
- `project_id` (required): The unique identifier of the project

#### `hex_create_presigned_url`
Create a presigned URL for embedding a Hex project.

**Parameters:**
- `project_id` (required): The unique identifier of the project
- `theme` (optional): Theme for embedded view (`light` or `dark`, default: `light`)
- `hide_header` (optional): Hide header in embedded view (default: `false`)
- `hide_controls` (optional): Hide controls in embedded view (default: `false`)
- `fullscreen` (optional): Display in fullscreen mode (default: `false`)
- `input_params` (optional): Input parameters to pass to the project

### Project Execution Tools

#### `hex_run_project`
Trigger execution of a Hex project.

**Parameters:**
- `project_id` (required): The unique identifier of the project
- `input_params` (optional): Input parameters to pass to the project
- `update_published_results` (optional): Update published app results cache (default: `false`)
- `use_cached_sql_results` (optional): Use cached SQL query results (default: `true`)
- `notification_config` (optional): Configure completion notifications

#### `hex_get_run_status`
Check the status of a specific project run.

**Parameters:**
- `project_id` (required): The unique identifier of the project
- `run_id` (required): The unique identifier of the run

#### `hex_cancel_run`
Cancel an ongoing project run.

**Parameters:**
- `project_id` (required): The unique identifier of the project
- `run_id` (required): The unique identifier of the run

#### `hex_get_project_runs`
Get run history for a specific project.

**Parameters:**
- `project_id` (required): The unique identifier of the project
- `limit` (optional): Maximum number of runs to return (1-100, default: 10)
- `status` (optional): Filter runs by status (`PENDING`, `RUNNING`, `SUCCESS`, `ERROR`, `CANCELLED`)

## Usage Examples

### Basic Project Management
```
List all my Hex projects
```

### Running Analytics
```
Run the sales dashboard project with updated data for Q4 2024
```

### Monitoring Executions
```
Check the status of the customer analysis run that started 10 minutes ago
```

### Creating Shareable Links
```
Create an embedded URL for the revenue dashboard with dark theme
```

## Rate Limits & Best Practices

- **API Rate Limit**: 60 requests per minute
- **Concurrent Kernels**: Maximum 25 running simultaneously
- **Project Runs**: Maximum 20 project run requests per minute

### Best Practices
- Use cached SQL results when possible to improve performance
- Monitor long-running projects to avoid resource waste
- Use pagination for large project lists
- Set appropriate timeouts for your use case

## Error Handling

The server provides comprehensive error handling for common scenarios:

- **Authentication Errors**: Clear messages for invalid API tokens
- **Rate Limiting**: Automatic detection with retry suggestions
- **Network Issues**: Timeout handling with configurable limits
- **API Errors**: User-friendly error messages from Hex API responses

## Development

### Prerequisites
- Node.js 18+
- TypeScript 5+
- Hex workspace with API access

### Building from Source
```bash
git clone https://github.com/tomnagengast/mcp-server-hex.git
cd mcp-server-hex
npm install
npm run build
```

### Running in Development
```bash
npm run dev
```

### Testing
```bash
npm test
```

### Linting
```bash
npm run lint
npm run typecheck
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/tomnagengast/mcp-server-hex/issues)
- **Documentation**: [Hex API Documentation](https://learn.hex.tech/docs/api/api-overview)
- **MCP Documentation**: [Model Context Protocol](https://github.com/modelcontextprotocol/typescript-sdk)

## Changelog

### v1.0.0
- Initial release
- Full Hex API integration
- Project management and execution tools
- Comprehensive error handling and logging
- TypeScript support with detailed types
