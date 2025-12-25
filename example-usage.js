#!/usr/bin/env node

/**
 * Example Usage: Connect to AdsPower Browser and Run Automation Flows
 * 
 * This demonstrates how to use the automation scripts
 */

const { connectToBrowser, getBrowserWebSocketUrl } = require('./playwright-automation');
const { youtubeFlow, dataExtractionFlow } = require('./automation-flows');

async function example1_BasicConnection() {
    console.log('=== Example 1: Basic Connection ===\n');
    
    const userId = 'k181epp7'; // GOOGLE AI ULTRA 14$ profile
    
    try {
        // Get WebSocket URL
        const wsUrl = await getBrowserWebSocketUrl(userId);
        console.log(`WebSocket URL: ${wsUrl}\n`);
        
        // Connect to browser
        const { browser, page } = await connectToBrowser(wsUrl);
        
        // Navigate to a page
        await page.goto('https://www.google.com');
        console.log('✅ Navigated to Google');
        
        // Get page title
        const title = await page.title();
        console.log(`Page title: ${title}\n`);
        
        // Keep browser open
        console.log('Browser remains open. Close manually when done.');
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function example2_YoutubeFlow() {
    console.log('\n=== Example 2: YouTube Automation ===\n');
    
    const userId = 'k181epp7';
    
    try {
        const wsUrl = await getBrowserWebSocketUrl(userId);
        const { browser, page } = await connectToBrowser(wsUrl);
        
        // Run YouTube flow
        await youtubeFlow(page, 'Playwright automation tutorial');
        
        // Keep browser open
        console.log('\nBrowser remains open.');
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function example3_DataExtraction() {
    console.log('\n=== Example 3: Data Extraction ===\n');
    
    const userId = 'k181epp7';
    
    try {
        const wsUrl = await getBrowserWebSocketUrl(userId);
        const { browser, page } = await connectToBrowser(wsUrl);
        
        // Extract data from a page
        const data = await dataExtractionFlow(page, 'https://example.com', {
            headings: 'h1, h2',
            paragraphs: 'p',
            links: 'a'
        });
        
        console.log('\nExtracted data:', data);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Run examples
async function main() {
    const example = process.argv[2] || '1';
    
    switch (example) {
        case '1':
            await example1_BasicConnection();
            break;
        case '2':
            await example2_YoutubeFlow();
            break;
        case '3':
            await example3_DataExtraction();
            break;
        default:
            console.log('Usage: node example-usage.js [1|2|3]');
            console.log('  1 - Basic connection');
            console.log('  2 - YouTube flow');
            console.log('  3 - Data extraction');
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    example1_BasicConnection,
    example2_YoutubeFlow,
    example3_DataExtraction
};

