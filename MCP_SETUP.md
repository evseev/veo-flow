# AdsPower LocalAPI MCP Server Setup

This project includes the AdsPower LocalAPI MCP server for use with Cursor.

## Installation Status

✅ Repository cloned  
✅ Dependencies installed  
✅ Project built  

## Configuration for Cursor

To use this MCP server in Cursor, you need to add it to your Cursor MCP settings.

### Option 1: Using the Local Build (Recommended for Development)

Add the following configuration to your Cursor MCP settings:

**Location**: Cursor Settings → Features → Model Context Protocol

```json
{
  "mcpServers": {
    "adspower-local-api": {
      "command": "node",
      "args": [
        "/Users/evs/www/YT/veo-flow/local-api-mcp-typescript/build/index.js"
      ],
      "env": {
        "ADSPOWER_API_KEY": "YOUR_API_KEY_HERE"
      }
    }
  }
}
```

**Important**: Your API key has been configured: `25112279957c73485283081429ac5fd0`

**Before using the MCP server, make sure:**
1. AdsPower application is **running**
2. Go to **Settings** → **LocalAPI** in AdsPower
3. **Enable LocalAPI** (this is critical!)
4. Verify the API key matches: `25112279957c73485283081429ac5fd0`

### Option 2: Using npx (Recommended for Production)

```json
{
  "mcpServers": {
    "adspower-local-api": {
      "command": "npx",
      "args": ["-y", "local-api-mcp-typescript"],
      "env": {
        "ADSPOWER_API_KEY": "YOUR_API_KEY_HERE"
      }
    }
  }
}
```

**Note**: This option uses the published package. For the latest changes with API key support, use Option 1.

## Requirements

- **AdsPower**: Make sure AdsPower is installed and running
- **Node.js**: Version 18 or greater
- **Cursor**: Latest version with MCP support

## Available Tools

Once configured, you can use these tools in Cursor:

- `open_browser` - Open a browser
- `close_browser` - Close a browser
- `create_browser` - Create a new browser profile
- `update_browser` - Update browser settings
- `delete_browser` - Delete browser profiles
- `get_browser_list` - List all browsers
- `get-opened_browser` - Get list of opened browsers
- `move_browser` - Move browsers to a group
- `create_group` - Create a browser group
- `update_group` - Update a browser group
- `get_group_list` - List all groups
- `get-application_list` - List applications

## Testing

After configuration, restart Cursor and try asking:

- "Create an Android UA browser using Chrome 134"
- "List all my browser profiles"
- "Open browser with serial number 12345"

## Troubleshooting

1. **MCP server not found**: Make sure the build directory exists and contains `index.js`
2. **AdsPower not responding**: Ensure AdsPower is running and the LocalAPI is enabled
3. **API key error**: Make sure you've set the `ADSPOWER_API_KEY` environment variable in your MCP configuration
4. **"Require api-key" error**: This means the API key is missing or incorrect. Check your Cursor MCP settings
5. **Node version**: Verify you have Node.js 18+ installed (`node --version`)

## Project Structure

```
local-api-mcp-typescript/
├── build/              # Compiled JavaScript files
│   └── index.js       # Main entry point
├── src/               # TypeScript source files
├── package.json       # Dependencies and scripts
└── README.MD         # Full documentation
```


