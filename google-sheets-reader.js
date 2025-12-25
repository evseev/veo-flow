#!/usr/bin/env node

/**
 * Google Sheets Reader
 * 
 * Alternative method to read prompts from Google Spreadsheet
 * using Google Sheets API or CSV export
 */

const axios = require('axios');

const SPREADSHEET_ID = '1CClVKZygVn9if9gZ9Sf6Jmu2EJV0CQpADkhjzaN04O8';

/**
 * Read prompts from Google Spreadsheet via CSV export
 * This method works without authentication for public spreadsheets
 */
async function readPromptsFromCSV() {
    console.log('📊 Reading prompts from Google Spreadsheet (CSV export)...');
    
    try {
        // Export as CSV (works for public spreadsheets)
        const csvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=0`;
        
        const response = await axios.get(csvUrl);
        const csvData = response.data;
        
        // Parse CSV
        const lines = csvData.split('\n');
        const prompts = [];
        
        // Column B (index 1) contains the prompts
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // Split by comma, but handle quoted fields
            const columns = parseCSVLine(line);
            
            if (columns.length > 1 && columns[1]) {
                const prompt = columns[1].trim();
                // Filter for prompts that start with "Generate"
                if (prompt.startsWith('Generate')) {
                    prompts.push(prompt);
                }
            }
        }
        
        console.log(`✅ Found ${prompts.length} prompts from CSV`);
        return prompts;
        
    } catch (error) {
        console.error('Error reading CSV:', error.message);
        return [];
    }
}

/**
 * Simple CSV line parser (handles quoted fields)
 */
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current);
    return result;
}

/**
 * Read prompts using Playwright (scraping method)
 */
async function readPromptsWithPlaywright(page) {
    console.log('📊 Reading prompts using Playwright...');
    
    const SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`;
    
    try {
        await page.goto(SPREADSHEET_URL, { waitUntil: 'networkidle' });
        await page.waitForTimeout(5000); // Wait for spreadsheet to load
        
        // Try multiple methods to extract data
        
        // Method 1: Try to get cell values directly
        const prompts = [];
        
        // Look for cells in column B (index 1)
        // Google Sheets uses specific data attributes
        const cellSelectors = [
            'td[data-col="1"]', // Column B
            '.s1', // Sheet cell class
            '[role="gridcell"]' // Generic grid cell
        ];
        
        for (const selector of cellSelectors) {
            try {
                const cells = await page.$$eval(selector, (elements) => {
                    return elements
                        .map(el => el.textContent?.trim())
                        .filter(text => text && text.startsWith('Generate'))
                        .slice(0, 100);
                });
                
                if (cells.length > 0) {
                    prompts.push(...cells);
                    break;
                }
            } catch (e) {
                continue;
            }
        }
        
        // Method 2: Extract from page text
        if (prompts.length === 0) {
            const pageText = await page.textContent('body');
            const lines = pageText.split('\n');
            
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('Generate') && trimmed.length > 20) {
                    prompts.push(trimmed);
                }
            }
        }
        
        // Remove duplicates
        const uniquePrompts = [...new Set(prompts)];
        
        console.log(`✅ Found ${uniquePrompts.length} prompts via Playwright`);
        return uniquePrompts.slice(0, 100); // Limit to 100
        
    } catch (error) {
        console.error('Error reading with Playwright:', error.message);
        return [];
    }
}

/**
 * Get known prompts (fallback)
 */
function getKnownPrompts() {
    return [
        'Generate an iPhone photo of Grinch steeling presents',
        'Generate an iPhone photo of Santa preparing presents',
        'Generate an iPhone photo of Santa talking to Grinch'
    ];
}

module.exports = {
    readPromptsFromCSV,
    readPromptsWithPlaywright,
    getKnownPrompts,
    SPREADSHEET_ID
};

