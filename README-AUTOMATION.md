# Playwright Automation Flows for AdsPower

This project contains automation scripts to connect to AdsPower browser profiles using Playwright and perform various automation tasks.

## Setup

1. Install dependencies:
```bash
npm install
```

Or use the existing Playwright from the local-api-mcp-typescript package:
```bash
cd local-api-mcp-typescript && npm install
```

## Usage

### Basic Automation Script

Run the main automation script:
```bash
node playwright-automation.js [profile-name] [user-id]
```

Example:
```bash
node playwright-automation.js "GOOGLE AI ULTRA 14$" k181epp7
```

### Available Flows

The `playwright-automation.js` script includes these example flows:

1. **Navigate and Screenshot** - Navigate to a page and take a screenshot
2. **Search and Extract** - Perform a search and extract results
3. **Form Filling** - Fill forms automatically
4. **Cookie Management** - View and manage cookies
5. **Element Interaction** - Interact with page elements

### Advanced Flows

The `automation-flows.js` file contains reusable flow functions:

- `googleLoginFlow()` - Google account login automation
- `youtubeFlow()` - YouTube video search and interaction
- `socialMediaPostFlow()` - Post to social media platforms
- `ecommerceSearchFlow()` - Search products on e-commerce sites
- `dataExtractionFlow()` - Extract data from pages
- `multiStepFormFlow()` - Handle multi-step forms

## Connecting to Browser

The script automatically:
1. Gets the WebSocket URL from AdsPower API
2. Connects to the browser using Playwright's CDP (Chrome DevTools Protocol)
3. Performs automation tasks

## Example: Using Advanced Flows

```javascript
const { connectToBrowser, getBrowserWebSocketUrl } = require('./playwright-automation');
const { youtubeFlow, googleLoginFlow } = require('./automation-flows');

async function main() {
    const wsUrl = await getBrowserWebSocketUrl('k181epp7');
    const { browser, page } = await connectToBrowser(wsUrl);
    
    // Use advanced flows
    await youtubeFlow(page, 'Playwright automation');
    await googleLoginFlow(page, 'email@example.com', 'password');
    
    await browser.close();
}
```

## Configuration

Update the API key in `playwright-automation.js`:
```javascript
const ADSPOWER_API_KEY = 'your-api-key-here';
```

## Browser Profile Management

Use the MCP tools to manage browser profiles:
- List profiles: "List all my browser profiles"
- Open browser: "Open browser with profile [name]"
- Create browser: "Create a new browser profile"

## Notes

- Make sure AdsPower is running and LocalAPI is enabled
- The browser must be opened via AdsPower API before connecting with Playwright
- WebSocket URLs are temporary and change when browsers are reopened

