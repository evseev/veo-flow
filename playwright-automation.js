#!/usr/bin/env node

/**
 * Playwright Automation Script for AdsPower Browser Profiles
 * 
 * This script connects to an AdsPower browser profile using Playwright
 * and demonstrates various automation flows.
 */

const { chromium } = require('playwright');
const axios = require('axios');

const ADSPOWER_API_BASE = 'http://127.0.0.1:50325';
const ADSPOWER_API_KEY = '25112279957c73485283081429ac5fd0';

/**
 * Get the WebSocket URL for a browser profile
 */
async function getBrowserWebSocketUrl(userId) {
    try {
        const response = await axios.get(`${ADSPOWER_API_BASE}/api/v1/browser/start`, {
            params: { user_id: userId },
            headers: { 'api-key': ADSPOWER_API_KEY }
        });
        
        if (response.data.code === 0 && response.data.data.ws?.puppeteer) {
            return response.data.data.ws.puppeteer;
        }
        throw new Error('Failed to get WebSocket URL');
    } catch (error) {
        console.error('Error getting browser WebSocket URL:', error.message);
        throw error;
    }
}

/**
 * Connect to browser using Playwright
 */
async function connectToBrowser(wsUrl) {
    console.log(`Connecting to browser at: ${wsUrl}`);
    
    const browser = await chromium.connectOverCDP(wsUrl);
    const contexts = browser.contexts();
    
    let page;
    if (contexts.length > 0) {
        // Use existing context
        page = contexts[0].pages()[0] || await contexts[0].newPage();
    } else {
        // Create new context
        const context = await browser.newContext();
        page = await context.newPage();
    }
    
    console.log('✅ Connected to browser successfully!');
    return { browser, page };
}

/**
 * Example Automation Flow 1: Navigate and Take Screenshot
 */
async function flow1_NavigateAndScreenshot(page) {
    console.log('\n📸 Flow 1: Navigate and Take Screenshot');
    
    await page.goto('https://www.google.com');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await page.screenshot({ path: 'screenshot-google.png', fullPage: true });
    console.log('✅ Screenshot saved: screenshot-google.png');
}

/**
 * Example Automation Flow 2: Search and Extract Results
 */
async function flow2_SearchAndExtract(page) {
    console.log('\n🔍 Flow 2: Search and Extract Results');
    
    await page.goto('https://www.google.com');
    await page.waitForSelector('textarea[name="q"]', { timeout: 10000 });
    
    // Perform search
    await page.fill('textarea[name="q"]', 'Playwright automation');
    await page.press('textarea[name="q"]', 'Enter');
    
    await page.waitForLoadState('networkidle');
    
    // Extract search results
    const results = await page.$$eval('h3', (elements) => 
        elements.slice(0, 5).map(el => el.textContent)
    );
    
    console.log('Top 5 search results:');
    results.forEach((result, index) => {
        console.log(`  ${index + 1}. ${result}`);
    });
}

/**
 * Example Automation Flow 3: Form Filling
 */
async function flow3_FormFilling(page) {
    console.log('\n📝 Flow 3: Form Filling Example');
    
    // Navigate to a form page (example)
    await page.goto('https://example.com');
    
    // Example: Fill a form if it exists
    const formExists = await page.locator('form').count() > 0;
    
    if (formExists) {
        // Fill form fields
        await page.fill('input[name="example"]', 'Test Value');
        console.log('✅ Form filled successfully');
    } else {
        console.log('ℹ️  No form found on this page');
    }
}

/**
 * Example Automation Flow 4: Cookie Management
 */
async function flow4_CookieManagement(page) {
    console.log('\n🍪 Flow 4: Cookie Management');
    
    await page.goto('https://www.google.com');
    
    // Get all cookies
    const cookies = await page.context().cookies();
    console.log(`Found ${cookies.length} cookies`);
    
    // Display cookie names
    if (cookies.length > 0) {
        console.log('Cookie names:');
        cookies.slice(0, 5).forEach(cookie => {
            console.log(`  - ${cookie.name}`);
        });
    }
}

/**
 * Example Automation Flow 5: Element Interaction
 */
async function flow5_ElementInteraction(page) {
    console.log('\n🖱️  Flow 5: Element Interaction');
    
    await page.goto('https://www.google.com');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find and interact with elements
    const searchBox = page.locator('textarea[name="q"]');
    
    if (await searchBox.isVisible()) {
        await searchBox.click();
        await searchBox.fill('Playwright test');
        console.log('✅ Successfully interacted with search box');
    }
}

/**
 * Main execution function
 */
async function main() {
    const args = process.argv.slice(2);
    const profileName = args[0] || 'GOOGLE AI ULTRA 14$';
    const userId = args[1] || 'k181epp7'; // Default to the profile we know
    
    console.log(`🚀 Starting Playwright Automation for profile: ${profileName}`);
    console.log(`   User ID: ${userId}\n`);
    
    try {
        // Get WebSocket URL
        const wsUrl = await getBrowserWebSocketUrl(userId);
        
        // Connect to browser
        const { browser, page } = await connectToBrowser(wsUrl);
        
        // Run automation flows
        await flow1_NavigateAndScreenshot(page);
        await flow2_SearchAndExtract(page);
        await flow3_FormFilling(page);
        await flow4_CookieManagement(page);
        await flow5_ElementInteraction(page);
        
        console.log('\n✅ All automation flows completed!');
        
        // Keep browser open (comment out to auto-close)
        // await browser.close();
        console.log('\n💡 Browser remains open. Close manually or uncomment browser.close()');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    connectToBrowser,
    getBrowserWebSocketUrl,
    flow1_NavigateAndScreenshot,
    flow2_SearchAndExtract,
    flow3_FormFilling,
    flow4_CookieManagement,
    flow5_ElementInteraction
};

