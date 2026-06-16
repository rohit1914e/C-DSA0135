import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('GPU stall') && !msg.text().includes('deprecated')) {
      console.log(`[Browser Error]: ${msg.text()}`);
    }
  });

  try {
    console.log('Navigating and seeding...');
    await page.goto('http://localhost:5174/booking/interstellar', { waitUntil: 'networkidle' });
    await page.locator('button[data-seat-id="A1"]').click();
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Confirm Booking")').click();
    await page.waitForTimeout(500);
    await page.locator('button:has-text("I have completed payment")').click();
    
    // Evaluate to force payment status update instantly
    await page.evaluate(() => {
        const store = window.__ZUSTAND_STORE__; // Wait, we don't expose it.
    });

    // Let's just wait for 14s.
    console.log('Waiting 14s...');
    await page.waitForTimeout(14000);
    await page.locator('button:has-text("Go to My Tickets")').click();
    
    console.log('Testing PDF Download...');
    const pdfButton = page.locator('button:has-text("PDF")').first();
    
    console.log('Clicking PDF button...');
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 15000 }),
      pdfButton.click()
    ]);
    
    console.log('Download triggered successfully.');

  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
