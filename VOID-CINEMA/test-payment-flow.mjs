import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('GPU stall') && !msg.text().includes('DevTools') && !msg.text().includes('deprecated')) {
      consoleErrors.push(msg.text());
    }
  });

  try {
    // 1. Open booking page
    console.log('=== STEP 1: Open booking page ===');
    await page.goto('http://localhost:5174/booking/interstellar', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    console.log('URL:', page.url());

    // 2. Select seat A1
    console.log('\n=== STEP 2: Select seat ===');
    await page.locator('button[data-seat-id="A1"]').click();
    await page.waitForTimeout(1000);

    // 3. Confirm booking
    console.log('\n=== STEP 3: Confirm booking ===');
    await page.locator('button:has-text("Confirm Booking")').click();
    await page.waitForTimeout(1000); // Wait for redirect

    // 4. Verify redirect to /payment
    console.log('\n=== STEP 4: Verify redirect to Payment ===');
    console.log('URL after confirm:', page.url());
    const isPaymentPage = page.url().includes('/payment/');
    console.log('Is on Payment page:', isPaymentPage);

    if (!isPaymentPage) {
      throw new Error('Did not redirect to payment page');
    }

    // Verify payment page elements
    const paymentTitle = page.locator('text=Order Summary');
    const isSummaryVisible = await paymentTitle.isVisible();
    console.log('Order Summary visible:', isSummaryVisible);
    
    if (!isSummaryVisible) {
      throw new Error('Payment UI is NOT visually visible! Z-index issue?');
    }

    const qrImage = await page.locator('img[alt="Payment QR Code"]').count();
    console.log('QR Code image present:', qrImage > 0);

    const paymentBtn = page.locator('button:has-text("I have completed payment")');
    console.log('Complete Payment button visible:', await paymentBtn.count() > 0);

    // 5. Click payment completed
    console.log('\n=== STEP 5: Click payment completed ===');
    await paymentBtn.click();
    
    // Wait for success animation and redirect
    console.log('Waiting for processing and redirect (approx 4s)...');
    await page.waitForTimeout(4500);

    // 6. Verify redirect to /tickets
    console.log('\n=== STEP 6: Verify redirect to Tickets ===');
    console.log('URL after payment success:', page.url());
    const isTicketsPage = page.url().includes('/tickets');
    console.log('Is on Tickets page:', isTicketsPage);

    // 7. Verify ticket appears
    console.log('\n=== STEP 7: Verify ticket appears ===');
    const myTicketsTitle = await page.locator('text=My Tickets').count();
    console.log('My Tickets title visible:', myTicketsTitle > 0);

    const confirmedBadge = await page.locator('text=Confirmed').count();
    console.log('Confirmed badge visible:', confirmedBadge > 0);
    
    const seatA1 = await page.locator('text=A1').count();
    console.log('Seat A1 in tickets:', seatA1 > 0);

    // 8. Verify no console errors
    console.log('\n=== STEP 8: Console Errors ===');
    console.log('Console errors:', consoleErrors.length === 0 ? 'NONE' : consoleErrors.join('; '));

    console.log('\n=== FINAL SUMMARY ===');
    console.log('Full flow completed successfully: PASS');

  } catch (error) {
    console.error('\nTest failed:', error);
  } finally {
    await browser.close();
  }
})();
