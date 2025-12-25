#!/usr/bin/env node

/**
 * Advanced Automation Flows for AdsPower Browser Profiles
 * 
 * This file contains reusable automation flow functions
 * that can be used with Playwright and AdsPower browsers.
 */

const { chromium } = require('playwright');

/**
 * Flow: Google Account Login Automation
 */
async function googleLoginFlow(page, email, password) {
    console.log('🔐 Starting Google Login Flow...');
    
    try {
        await page.goto('https://accounts.google.com/signin');
        await page.waitForLoadState('networkidle');
        
        // Fill email
        await page.fill('input[type="email"]', email);
        await page.click('button:has-text("Next")');
        
        await page.waitForTimeout(2000);
        
        // Fill password
        await page.fill('input[type="password"]', password);
        await page.click('button:has-text("Next")');
        
        await page.waitForNavigation({ waitUntil: 'networkidle' });
        
        console.log('✅ Login successful!');
        return true;
    } catch (error) {
        console.error('❌ Login failed:', error.message);
        return false;
    }
}

/**
 * Flow: YouTube Video Interaction
 */
async function youtubeFlow(page, searchQuery) {
    console.log(`📺 YouTube Flow: Searching for "${searchQuery}"...`);
    
    try {
        await page.goto('https://www.youtube.com');
        await page.waitForLoadState('networkidle');
        
        // Search for video
        await page.fill('input[name="search_query"]', searchQuery);
        await page.press('input[name="search_query"]', 'Enter');
        
        await page.waitForSelector('ytd-video-renderer', { timeout: 10000 });
        
        // Get first video title
        const firstVideo = await page.locator('ytd-video-renderer').first();
        const title = await firstVideo.locator('#video-title').textContent();
        
        console.log(`✅ Found video: ${title}`);
        
        // Click on first video
        await firstVideo.locator('#video-title').click();
        await page.waitForLoadState('networkidle');
        
        console.log('✅ Video opened successfully!');
        return true;
    } catch (error) {
        console.error('❌ YouTube flow failed:', error.message);
        return false;
    }
}

/**
 * Flow: Social Media Post Automation
 */
async function socialMediaPostFlow(page, platform, content) {
    console.log(`📱 Social Media Flow: Posting to ${platform}...`);
    
    try {
        let postUrl, textSelector, submitSelector;
        
        switch (platform.toLowerCase()) {
            case 'twitter':
            case 'x':
                postUrl = 'https://twitter.com/compose/tweet';
                textSelector = 'div[data-testid="tweetTextarea_0"]';
                submitSelector = 'button[data-testid="tweetButton"]';
                break;
            case 'facebook':
                postUrl = 'https://www.facebook.com';
                textSelector = 'div[contenteditable="true"][role="textbox"]';
                submitSelector = 'div[aria-label="Post"]';
                break;
            default:
                throw new Error(`Unsupported platform: ${platform}`);
        }
        
        await page.goto(postUrl);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        // Fill post content
        await page.fill(textSelector, content);
        await page.waitForTimeout(1000);
        
        // Submit post
        await page.click(submitSelector);
        await page.waitForTimeout(2000);
        
        console.log(`✅ Post submitted to ${platform}!`);
        return true;
    } catch (error) {
        console.error(`❌ ${platform} post failed:`, error.message);
        return false;
    }
}

/**
 * Flow: E-commerce Product Search
 */
async function ecommerceSearchFlow(page, site, product) {
    console.log(`🛒 E-commerce Flow: Searching for "${product}" on ${site}...`);
    
    try {
        const sites = {
            'amazon': 'https://www.amazon.com',
            'ebay': 'https://www.ebay.com',
            'etsy': 'https://www.etsy.com'
        };
        
        const url = sites[site.toLowerCase()];
        if (!url) {
            throw new Error(`Unsupported site: ${site}`);
        }
        
        await page.goto(url);
        await page.waitForLoadState('networkidle');
        
        // Find and use search box
        const searchSelectors = {
            'amazon': '#twotabsearchtextbox',
            'ebay': 'input[type="text"][placeholder*="Search"]',
            'etsy': 'input[name="search_query"]'
        };
        
        const searchSelector = searchSelectors[site.toLowerCase()];
        await page.fill(searchSelector, product);
        await page.press(searchSelector, 'Enter');
        
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        // Get first few product titles
        const products = await page.$$eval('h2, h3, [class*="product"], [class*="item"]', 
            (elements) => elements.slice(0, 5).map(el => el.textContent?.trim()).filter(Boolean)
        );
        
        console.log(`✅ Found ${products.length} products:`);
        products.forEach((product, index) => {
            console.log(`  ${index + 1}. ${product}`);
        });
        
        return true;
    } catch (error) {
        console.error(`❌ E-commerce search failed:`, error.message);
        return false;
    }
}

/**
 * Flow: Data Extraction
 */
async function dataExtractionFlow(page, url, selectors) {
    console.log(`📊 Data Extraction Flow: Extracting data from ${url}...`);
    
    try {
        await page.goto(url);
        await page.waitForLoadState('networkidle');
        
        const extractedData = {};
        
        for (const [key, selector] of Object.entries(selectors)) {
            try {
                const elements = await page.$$(selector);
                if (elements.length > 0) {
                    extractedData[key] = await Promise.all(
                        elements.map(el => el.textContent())
                    );
                } else {
                    extractedData[key] = [];
                }
            } catch (error) {
                console.warn(`⚠️  Could not extract ${key}:`, error.message);
                extractedData[key] = [];
            }
        }
        
        console.log('✅ Data extracted successfully!');
        console.log(JSON.stringify(extractedData, null, 2));
        
        return extractedData;
    } catch (error) {
        console.error('❌ Data extraction failed:', error.message);
        return null;
    }
}

/**
 * Flow: Multi-step Form Automation
 */
async function multiStepFormFlow(page, formData) {
    console.log('📋 Multi-step Form Flow...');
    
    try {
        // Navigate to form page
        await page.goto(formData.url);
        await page.waitForLoadState('networkidle');
        
        let step = 1;
        for (const stepData of formData.steps) {
            console.log(`  Step ${step}: ${stepData.name}`);
            
            // Fill fields in this step
            for (const [selector, value] of Object.entries(stepData.fields)) {
                await page.fill(selector, value);
            }
            
            // Click next/submit button
            if (stepData.nextButton) {
                await page.click(stepData.nextButton);
                await page.waitForTimeout(1000);
            }
            
            step++;
        }
        
        console.log('✅ Form completed successfully!');
        return true;
    } catch (error) {
        console.error('❌ Form automation failed:', error.message);
        return false;
    }
}

module.exports = {
    googleLoginFlow,
    youtubeFlow,
    socialMediaPostFlow,
    ecommerceSearchFlow,
    dataExtractionFlow,
    multiStepFormFlow
};

