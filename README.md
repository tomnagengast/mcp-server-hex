# MCP Server for Hex

A Model Context Protocol (MCP) server that provides seamless integration with [Hex](https://hex.tech), the modern analytics platform. This server enables Claude and other AI assistants to interact with your Hex projects, run analyses, and manage your data workflows.

## Features

### Project Management
- **List Projects**: Browse all accessible projects in your Hex workspace
- **Get Project Details**: Retrieve comprehensive information about specific projects
- **Create Presigned URLs**: Generate embeddable URLs for sharing Hex projects
- **Advanced Search**: Find projects by name, description, tags, author, status, or date filters
- **Project Summary**: Get comprehensive overviews of multiple projects with run history and metrics

### Project Execution
- **Run Projects**: Execute Hex projects with custom input parameters
- **Monitor Runs**: Check the status and progress of project executions
- **Cancel Runs**: Stop long-running or stuck project executions
- **Run History**: View execution history and past results
- **Bulk Operations**: Run multiple projects in parallel or sequence for batch analysis
- **Active Run Monitoring**: Real-time monitoring of all running and pending executions
- **Project Scheduling**: Schedule projects to run at specific times or with recurring schedules

### Data & Analytics
- **Data Export**: Export project results in multiple formats (CSV, JSON, Parquet, Excel)
- **Execution Analytics**: Performance metrics and trends analysis over time
- **Workspace Analytics**: Comprehensive analytics across all projects and users
- **Performance Monitoring**: Track runtime trends, success rates, and usage patterns

### Advanced Features
- **Rate Limit Handling**: Automatic retry and error handling for API limits
- **Comprehensive Logging**: Debug-friendly logging for troubleshooting
- **Type Safety**: Full TypeScript support with detailed type definitions
- **Error Recovery**: Robust error handling with user-friendly messages
- **Batch Processing**: Efficient handling of multiple operations with configurable concurrency
- **Smart Filtering**: Advanced search capabilities with multiple criteria combinations

## Tools Overview

This MCP server provides **14 comprehensive tools** designed specifically for data analysts and Hex power users:

**Project Management (7 tools):**
- `hex_list_projects` - Browse workspace projects with pagination
- `hex_get_project` - Get detailed project information
- `hex_search_projects` - Advanced search and filtering
- `hex_create_presigned_url` - Generate embeddable URLs
- `hex_export_project_data` - Export results in multiple formats
- `hex_bulk_run_projects` - Batch project execution
- `hex_get_project_summary` - Multi-project analysis reports

**Project Execution (7 tools):**
- `hex_run_project` - Execute projects with parameters
- `hex_get_run_status` - Check execution status
- `hex_cancel_run` - Stop running executions
- `hex_get_project_runs` - View run history
- `hex_get_execution_analytics` - Performance metrics and trends
- `hex_monitor_active_runs` - Real-time run monitoring
- `hex_schedule_project_run` - Schedule recurring executions

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

#### `hex_search_projects`
Search and filter projects by name, description, tags, or author.

**Parameters:**
- `query` (optional): Search query to match against project name, description, or tags
- `author` (optional): Filter by author name or email
- `status` (optional): Filter by project status (`DRAFT`, `PUBLISHED`, `ARCHIVED`)
- `visibility` (optional): Filter by project visibility (`PUBLIC`, `PRIVATE`, `WORKSPACE`)
- `tags` (optional): Array of tags to filter by (projects with any of these tags)
- `updated_after` (optional): Filter projects updated after this date (ISO 8601 format)
- `limit` (optional): Maximum number of projects to return (1-100, default: 20)

#### `hex_export_project_data`
Generate export URLs or download project results data.

**Parameters:**
- `project_id` (required): The unique identifier of the project
- `format` (optional): Export format (`csv`, `json`, `parquet`, `excel`, default: `csv`)
- `include_metadata` (optional): Include project metadata in export (default: `true`)
- `run_id` (optional): Specific run ID to export data from (uses latest successful run if not provided)

#### `hex_bulk_run_projects`
Run multiple projects in parallel or sequence for batch analysis.

**Parameters:**
- `project_configs` (required): Array of project configurations with `project_id`, optional `input_params`, and `use_cached_sql_results`
- `execution_mode` (optional): `parallel` or `sequential` execution (default: `parallel`)
- `max_concurrent` (optional): Maximum concurrent runs for parallel mode (1-10, default: 5)
- `stop_on_error` (optional): Stop execution if any project fails in sequential mode (default: `false`)

#### `hex_get_project_summary`
Get a comprehensive summary of multiple projects including status, run history, and metrics.

**Parameters:**
- `project_ids` (required): Array of project IDs to summarize
- `include_run_history` (optional): Include recent run history for each project (default: `true`)
- `include_performance_metrics` (optional): Include performance metrics like average runtime (default: `false`)

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

#### `hex_get_execution_analytics`
Get analytics and performance metrics for project executions.

**Parameters:**
- `project_id` (optional): The unique identifier of the project (omit for workspace-wide analytics)
- `time_range` (optional): Time range for analytics (`24h`, `7d`, `30d`, `90d`, default: `7d`)
- `include_failed_runs` (optional): Include failed runs in analytics (default: `true`)
- `group_by` (optional): How to group analytics data (`day`, `week`, `month`, `project`, `user`, default: `day`)

#### `hex_monitor_active_runs`
Monitor all currently active (running or pending) project executions.

**Parameters:**
- `include_pending` (optional): Include pending runs in monitoring (default: `true`)
- `show_progress` (optional): Show detailed progress information where available (default: `false`)
- `auto_refresh` (optional): Indicate if this is for auto-refresh monitoring (default: `false`)

#### `hex_schedule_project_run`
Schedule a project to run at a specific time or with a recurring schedule.

**Parameters:**
- `project_id` (required): The unique identifier of the project
- `scheduled_time` (required): When to run (ISO 8601 format for "once", time for recurring)
- `schedule_type` (optional): Type of schedule (`once`, `daily`, `weekly`, `monthly`, default: `once`)
- `input_params` (optional): Input parameters to pass to the project
- `timezone` (optional): Timezone for scheduled execution (default: `UTC`)
- `notification_config` (optional): Notification configuration for scheduled runs

## Usage Examples

### Basic Project Management
```
List all my Hex projects
```

### Advanced Project Search
```
Search for projects tagged with "sales" created by john@company.com
```

### Running Analytics
```
Run the sales dashboard project with updated data for Q4 2024
```

### Batch Operations
```
Run multiple quarterly reports in parallel with different parameters
```

### Monitoring Executions
```
Check the status of the customer analysis run that started 10 minutes ago
```

### Execution Analytics
```
Show me execution analytics for the last 30 days grouped by project
```

### Active Run Monitoring
```
Monitor all currently running projects and show progress details
```

### Data Export
```
Export the latest results from the revenue dashboard as CSV with metadata
```

### Project Scheduling
```
Schedule the daily report to run every morning at 9 AM EST
```

### Creating Shareable Links
```
Create an embedded URL for the revenue dashboard with dark theme
```

### Comprehensive Project Analysis
```
Get a detailed summary of projects A, B, and C including run history and performance metrics
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

### v1.1.0
- **Major Enhancement**: Added 10 new analyst-focused tools
- **Project Search**: Advanced filtering by name, author, tags, status, and dates
- **Data Export**: Export project results in CSV, JSON, Parquet, and Excel formats
- **Bulk Operations**: Parallel and sequential execution of multiple projects
- **Analytics & Monitoring**: Execution analytics, performance metrics, and real-time monitoring
- **Project Scheduling**: Schedule recurring project executions
- **Enhanced Documentation**: Comprehensive usage examples and tool reference
- **Type Safety**: Improved TypeScript support for all new tools

### v1.0.0
- Initial release
- Full Hex API integration
- Core project management and execution tools (4 tools)
- Comprehensive error handling and logging
- TypeScript support with detailed types
