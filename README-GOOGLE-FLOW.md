# Google Flow Automation

Automation script for Google Flow (https://labs.google/fx/uk/tools/flow) that creates a new project and generates images/videos based on prompts from a Google Spreadsheet.

## Overview

This automation:
1. ✅ Connects to your AdsPower browser profile
2. ✅ Reads prompts from Google Spreadsheet (column B - "Img" column)
3. ✅ Creates a new project in Google Flow
4. ✅ Generates images/videos for each prompt
5. ✅ Saves screenshots for verification

## Prerequisites

- AdsPower browser profile with Google account logged in
- Google Flow access (https://labs.google/fx/uk/tools/flow)
- Google Spreadsheet with prompts in column B
- Node.js and dependencies installed

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Ensure your browser profile is open:**
   - The script will automatically connect to your AdsPower browser
   - Default profile: `k181epp7` (GOOGLE AI ULTRA 14$)

3. **Verify spreadsheet access:**
   - Spreadsheet: https://docs.google.com/spreadsheets/d/1CClVKZygVn9if9gZ9Sf6Jmu2EJV0CQpADkhjzaN04O8/edit
   - Make sure prompts are in column B (Img column)
   - Prompts should start with "Generate"

## Usage

### Basic Usage

Run with default settings:
```bash
npm run google-flow
```

Or directly:
```bash
node google-flow-automation.js
```

### Advanced Usage

Specify user ID and limit number of generations:
```bash
node google-flow-automation.js [user-id] [max-generations]
```

Examples:
```bash
# Use specific profile
node google-flow-automation.js k181epp7

# Limit to first 5 prompts
node google-flow-automation.js k181epp7 5

# Use different profile
node google-flow-automation.js k18166ib 10
```

## How It Works

### 1. Spreadsheet Reading

The script uses multiple methods to read prompts:

1. **CSV Export** (fastest) - Exports spreadsheet as CSV and parses it
2. **Playwright Scraping** - Scrapes the spreadsheet page directly
3. **Fallback** - Uses known prompts if automatic reading fails

### 2. Project Creation

- Navigates to Google Flow
- Looks for "New Project" or "Create" button
- Creates a new project (or waits for manual creation)

### 3. Generation Process

For each prompt:
- Finds the input field (textarea/input)
- Enters the prompt text
- Clicks "Generate" button or presses Enter
- Waits for generation to complete (up to 60 seconds)
- Takes a screenshot for verification
- Waits 3 seconds before next generation

## Configuration

Edit `google-flow-automation.js` to customize:

```javascript
const GOOGLE_FLOW_URL = 'https://labs.google/fx/uk/tools/flow';
const SPREADSHEET_ID = '1CClVKZygVn9if9gZ9Sf6Jmu2EJV0CQpADkhjzaN04O8';
const ADSPOWER_API_KEY = 'your-api-key';
```

## Output

The script generates:
- Screenshots: `flow-generation-1.png`, `flow-generation-2.png`, etc.
- Console logs showing progress
- Summary at the end with success/failure counts

## Troubleshooting

### "Could not extract prompts automatically"

**Solution:** 
- Make sure the spreadsheet is publicly accessible (or logged in via browser)
- Check that prompts are in column B
- Prompts should start with "Generate"

### "Could not find create button"

**Solution:**
- The script will wait 10 seconds for manual project creation
- Create the project manually, then the script will continue

### "Generation timeout"

**Solution:**
- Google Flow generation can take time
- Increase timeout in `generateFromPrompt()` function
- Check your Google Flow credits/limits

### Browser not connecting

**Solution:**
- Make sure AdsPower is running
- Verify the browser profile is open
- Check API key in the script matches your AdsPower API key

## Spreadsheet Format

Your Google Spreadsheet should have:
- Column A: ID
- Column B: Img (prompts starting with "Generate")
- Column D: Video (optional)

Example:
```
| ID | Img                                          |
|----|----------------------------------------------|
| 1  | Generate an iPhone photo of Grinch steeling presents |
| 2  | Generate an iPhone photo of Santa preparing presents |
```

## Notes

- The browser remains open after automation completes
- Screenshots are saved in the project directory
- Rate limiting: 3-second delay between generations
- Generation time: Up to 60 seconds per prompt

## Example Output

```
🚀 Starting Google Flow Automation
   Profile User ID: k181epp7
   Google Flow URL: https://labs.google/fx/uk/tools/flow
   Spreadsheet URL: https://docs.google.com/spreadsheets/d/...

✅ Connected to browser successfully!

📊 Extracting prompts from Google Spreadsheet...
✅ Found 3 prompts from CSV

📋 Found 3 prompts to process

🎬 Creating new project in Google Flow...
✅ Clicked create button: button:has-text("New Project")

🎨 Generating 1: Generate an iPhone photo of Grinch steeling...
✅ Entered prompt in: textarea[placeholder*="prompt"]
✅ Clicked generate button: button:has-text("Generate")
⏳ Waiting for generation to complete...
✅ Generation 1 completed!
📸 Screenshot saved: flow-generation-1.png

============================================================
📊 Generation Summary
============================================================
Total prompts: 3
Successful: 3
Failed: 0

✅ Automation completed!
```

## Related Files

- `google-flow-automation.js` - Main automation script
- `google-sheets-reader.js` - Spreadsheet reading utilities
- `playwright-automation.js` - Base Playwright automation
- `automation-flows.js` - Reusable flow functions

