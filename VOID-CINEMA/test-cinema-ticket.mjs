import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('GPU stall') && !msg.text().includes('deprecated')) {
      console.log(`[Browser Error]: ${msg.text()}`);
      consoleErrors.push(msg.text());
    }
  });

  try {
    // Navigate to booking to generate a paid ticket first
    console.log('=== SEEDING PAID TICKET ===');
    await page.goto('http://localhost:5174/booking/interstellar', { waitUntil: 'networkidle' });
    await page.locator('button[data-seat-id="A1"]').click();
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("Confirm Booking")').click();
    await page.waitForTimeout(1000);
    
    // Now on payment page, trigger the sequence
    const paymentBtn = page.locator('button:has-text("I have completed payment")');
    await paymentBtn.waitFor({ state: 'visible' });
    await paymentBtn.click();

    // Wait for the full cinematic sequence to complete (approx 12-14 seconds)
    console.log('Waiting for cinematic sequence (14s)...');
    await page.waitForTimeout(14000);
    
    // Click 'Go to My Tickets' from the action selection screen
    await page.locator('button:has-text("Go to My Tickets")').click();
    await page.waitForTimeout(1000);

    console.log('\n=== TEST 1: VIEW ROUTE ===');
    const viewButton = page.locator('button:has-text("View")').first();
    await viewButton.click();
    await page.waitForTimeout(1500); // Wait for GSAP entrance animation

    console.log('Current URL:', page.url());
    if (!page.url().includes('/ticket/BK-')) throw new Error('Did not navigate to /ticket/:id');
    
    const ticketTitle = await page.locator('h2:has-text("Interstellar")').count();
    const qrCode = await page.locator('img[alt="Entry QR"]').count();
    const confirmedBadge = await page.locator('div:has-text("Confirmed")').count();
    
    console.log('Movie Title visible:', ticketTitle > 0);
    console.log('QR Code visible:', qrCode > 0);
    console.log('Confirmed Badge visible:', confirmedBadge > 0);
    
    if (ticketTitle === 0 || qrCode === 0 || confirmedBadge === 0) {
      throw new Error('Ticket data missing on View route.');
    }

    console.log('\n=== TEST 2: PDF DOWNLOAD ===');
    // Return to tickets
    await page.locator('button:has-text("My Tickets")').click();
    await page.waitForTimeout(1000);

    const pdfButton = page.locator('button:has-text("PDF")').first();
    
    // Start waiting for download before clicking
    console.log('Triggering PDF Generation...');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      pdfButton.click()
    ]);
    
    // Wait for the download to complete
    const downloadPath = await download.path();
    const suggestedFilename = download.suggestedFilename();
    
    console.log('Download triggered successfully.');
    console.log('Filename:', suggestedFilename);
    
    if (!suggestedFilename.startsWith('VOID-CINEMA-TICKET-BK-') || !suggestedFilename.endsWith('.pdf')) {
      throw new Error('Incorrect PDF filename generated.');
    }

    // Verify file size > 0 KB
    const stats = fs.statSync(downloadPath);
    console.log(`File Size: ${(stats.size / 1024).toFixed(2)} KB`);
    
    if (stats.size === 0) {
      throw new Error('PDF file is empty (0 bytes).');
    }

    console.log('\n=== FINAL VERIFICATION ===');
    console.log('Console Errors:', consoleErrors.length === 0 ? 'NONE' : consoleErrors.join('; '));
    
    console.log('\nALL TESTS PASSED.');

  } catch (err) {
    console.error('\nTest failed:', err);
  } finally {
    await browser.close();
  }
})();
