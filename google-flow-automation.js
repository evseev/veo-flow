#!/usr/bin/env node

/**
 * Google Flow Automation Script
 * 
 * This script automates the Google Flow tool (https://labs.google/fx/uk/tools/flow)
 * to create a new project and generate images/videos based on prompts from a Google Spreadsheet.
 */

const { chromium } = require('playwright');
const axios = require('axios');
const { readPromptsFromCSV, readPromptsWithPlaywright, getKnownPrompts } = require('./google-sheets-reader');

const ADSPOWER_API_BASE = 'http://127.0.0.1:50325';
const ADSPOWER_API_KEY = '25112279957c73485283081429ac5fd0';
const GOOGLE_FLOW_URL = 'https://labs.google/fx/uk/tools/flow';
const SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1CClVKZygVn9if9gZ9Sf6Jmu2EJV0CQpADkhjzaN04O8/edit';
const SPREADSHEET_ID = '1CClVKZygVn9if9gZ9Sf6Jmu2EJV0CQpADkhjzaN04O8';

/**
 * Get browser WebSocket URL from AdsPower
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
        page = contexts[0].pages()[0] || await contexts[0].newPage();
    } else {
        const context = await browser.newContext();
        page = await context.newPage();
    }
    
    console.log('✅ Connected to browser successfully!');
    return { browser, page };
}

/**
 * Extract prompts from Google Spreadsheet
 * Tries multiple methods: CSV export, Playwright scraping, then fallback
 */
async function extractPromptsFromSpreadsheet(page) {
    console.log('\n📊 Extracting prompts from Google Spreadsheet...');
    
    // Method 1: Try CSV export (fastest, works for public sheets)
    try {
        const csvPrompts = await readPromptsFromCSV();
        if (csvPrompts.length > 0) {
            return csvPrompts;
        }
    } catch (error) {
        console.log('⚠️  CSV export failed, trying Playwright method...');
    }
    
    // Method 2: Try Playwright scraping
    try {
        const playwrightPrompts = await readPromptsWithPlaywright(page);
        if (playwrightPrompts.length > 0) {
            return playwrightPrompts;
        }
    } catch (error) {
        console.log('⚠️  Playwright scraping failed, using fallback prompts...');
    }
    
    // Method 3: Fallback to known prompts
    console.log('⚠️  Using fallback prompts. Please check spreadsheet access.');
    return getKnownPrompts();
}

/**
 * Create a new project in Google Flow
 */
async function createNewProject(page) {
    console.log('\n🎬 Creating new project in Google Flow...');
    
    try {
        // Navigate to Google Flow
        await page.goto(GOOGLE_FLOW_URL, { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000); // Wait for page to fully load
        
        // Look for "New Project" or "Create" button
        // Common selectors for Google Flow interface
        const createSelectors = [
            'button:has-text("New Project")',
            'button:has-text("Create")',
            'button:has-text("New")',
            '[aria-label*="New Project"]',
            '[aria-label*="Create"]',
            'button[class*="create"]',
            'button[class*="new"]'
        ];
        
        let projectCreated = false;
        for (const selector of createSelectors) {
            try {
                const button = page.locator(selector).first();
                if (await button.isVisible({ timeout: 2000 })) {
                    await button.click();
                    await page.waitForTimeout(2000);
                    projectCreated = true;
                    console.log(`✅ Clicked create button: ${selector}`);
                    break;
                }
            } catch (e) {
                // Try next selector
                continue;
            }
        }
        
        if (!projectCreated) {
            console.log('⚠️  Could not find create button automatically. Please create project manually.');
            console.log('   Waiting 10 seconds for manual project creation...');
            await page.waitForTimeout(10000);
        }
        
        // Wait for project interface to be ready
        await page.waitForTimeout(2000);
        
        return true;
    } catch (error) {
        console.error('Error creating project:', error.message);
        return false;
    }
}

/**
 * Generate image/video from a prompt in Google Flow
 */
async function generateFromPrompt(page, prompt, index) {
    console.log(`\n🎨 Generating ${index + 1}: ${prompt.substring(0, 50)}...`);
    
    try {
        // Look for input field or textarea for prompt
        const inputSelectors = [
            'textarea[placeholder*="prompt"]',
            'textarea[placeholder*="describe"]',
            'textarea[placeholder*="text"]',
            'input[type="text"]',
            'textarea',
            '[contenteditable="true"][role="textbox"]',
            '[aria-label*="prompt"]',
            '[aria-label*="input"]'
        ];
        
        let inputFound = false;
        for (const selector of inputSelectors) {
            try {
                const input = page.locator(selector).first();
                if (await input.isVisible({ timeout: 2000 })) {
                    await input.click();
                    await input.fill('');
                    await input.fill(prompt);
                    await page.waitForTimeout(1000);
                    inputFound = true;
                    console.log(`✅ Entered prompt in: ${selector}`);
                    break;
                }
            } catch (e) {
                continue;
            }
        }
        
        if (!inputFound) {
            console.log('⚠️  Could not find input field, trying keyboard input...');
            await page.keyboard.type(prompt, { delay: 50 });
        }
        
        // Look for generate/submit button
        const generateSelectors = [
            'button:has-text("Generate")',
            'button:has-text("Create")',
            'button:has-text("Submit")',
            'button[type="submit"]',
            '[aria-label*="Generate"]',
            '[aria-label*="Create"]',
            'button[class*="generate"]',
            'button[class*="submit"]'
        ];
        
        let generated = false;
        for (const selector of generateSelectors) {
            try {
                const button = page.locator(selector).first();
                if (await button.isVisible({ timeout: 2000 })) {
                    await button.click();
                    console.log(`✅ Clicked generate button: ${selector}`);
                    generated = true;
                    break;
                }
            } catch (e) {
                continue;
            }
        }
        
        if (!generated) {
            // Try pressing Enter
            await page.keyboard.press('Enter');
            console.log('✅ Pressed Enter to generate');
        }
        
        // Wait for generation to complete
        console.log('⏳ Waiting for generation to complete...');
        
        // Look for completion indicators
        const completionIndicators = [
            'text=Complete',
            'text=Done',
            'text=Ready',
            '[class*="complete"]',
            '[class*="done"]'
        ];
        
        // Wait up to 60 seconds for generation
        let completed = false;
        for (let i = 0; i < 60; i++) {
            await page.waitForTimeout(1000);
            
            // Check if generation is complete
            for (const indicator of completionIndicators) {
                try {
                    const element = page.locator(indicator).first();
                    if (await element.isVisible({ timeout: 500 })) {
                        completed = true;
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }
            
            if (completed) break;
            
            // Also check if there's an image/video element
            const mediaElements = await page.$$('img, video, [class*="image"], [class*="video"]');
            if (mediaElements.length > 0) {
                completed = true;
                break;
            }
        }
        
        if (completed) {
            console.log(`✅ Generation ${index + 1} completed!`);
        } else {
            console.log(`⚠️  Generation ${index + 1} may still be in progress...`);
        }
        
        // Take a screenshot for verification
        await page.screenshot({ 
            path: `flow-generation-${index + 1}.png`,
            fullPage: true 
        });
        console.log(`📸 Screenshot saved: flow-generation-${index + 1}.png`);
        
        // Wait a bit before next generation
        await page.waitForTimeout(2000);
        
        return true;
    } catch (error) {
        console.error(`❌ Error generating ${index + 1}:`, error.message);
        return false;
    }
}

/**
 * Main automation flow
 */
async function main() {
    const args = process.argv.slice(2);
    const userId = args[0] || 'k181epp7'; // Default to GOOGLE AI ULTRA 14$ profile
    const maxGenerations = args[1] ? parseInt(args[1]) : null; // Optional limit
    
    console.log('🚀 Starting Google Flow Automation');
    console.log(`   Profile User ID: ${userId}`);
    console.log(`   Google Flow URL: ${GOOGLE_FLOW_URL}`);
    console.log(`   Spreadsheet URL: ${SPREADSHEET_URL}\n`);
    
    try {
        // Get browser connection
        const wsUrl = await getBrowserWebSocketUrl(userId);
        const { browser, page } = await connectToBrowser(wsUrl);
        
        // Extract prompts from spreadsheet
        const prompts = await extractPromptsFromSpreadsheet(page);
        
        if (prompts.length === 0) {
            console.error('❌ No prompts found!');
            return;
        }
        
        console.log(`\n📋 Found ${prompts.length} prompts to process`);
        if (maxGenerations) {
            prompts.splice(maxGenerations);
            console.log(`   Limiting to first ${prompts.length} prompts`);
        }
        
        // Create new project
        await createNewProject(page);
        
        // Generate for each prompt
        const results = [];
        for (let i = 0; i < prompts.length; i++) {
            const prompt = prompts[i];
            const success = await generateFromPrompt(page, prompt, i);
            results.push({ prompt, success, index: i + 1 });
            
            // Add delay between generations to avoid rate limiting
            if (i < prompts.length - 1) {
                console.log('\n⏸️  Waiting 3 seconds before next generation...');
                await page.waitForTimeout(3000);
            }
        }
        
        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 Generation Summary');
        console.log('='.repeat(60));
        const successful = results.filter(r => r.success).length;
        console.log(`Total prompts: ${results.length}`);
        console.log(`Successful: ${successful}`);
        console.log(`Failed: ${results.length - successful}`);
        
        console.log('\n✅ Automation completed!');
        console.log('💡 Browser remains open. Check screenshots for verification.');
        
        // Keep browser open
        // await browser.close();
        
    } catch (error) {
        console.error('❌ Fatal error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    getBrowserWebSocketUrl,
    connectToBrowser,
    extractPromptsFromSpreadsheet,
    createNewProject,
    generateFromPrompt
};

