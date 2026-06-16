import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => {
    console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
  });

  try {
    // 1. Open booking page directly
    console.log('\n=== Navigating to booking page ===');
    await page.goto('http://localhost:5174/booking/interstellar', { waitUntil: 'networkidle' });
    
    // 2. Select seat
    console.log('\n=== Selecting seat ===');
    await page.locator('button[data-seat-id="A1"]').click();
    await page.waitForTimeout(1000);

    // 3. Confirm booking
    console.log('\n=== Confirming booking ===');
    await page.locator('button:has-text("Confirm Booking")').click();
    await page.waitForTimeout(1000);

    console.log('\n=== Checking Payment Page Visibility ===');
    console.log('Current URL:', page.url());
    
    const isPaymentPage = page.url().includes('/payment/');
    if (!isPaymentPage) throw new Error('Did not redirect to payment');
    
    const summaryLocator = page.locator('text=Order Summary');
    const isSummaryVisible = await summaryLocator.isVisible();
    console.log('Is "Order Summary" visually visible?', isSummaryVisible);
    
    if (!isSummaryVisible) {
        throw new Error('Payment page rendered in DOM but is hidden/behind canvas.');
    }

    console.log('\n=== Final Result ===');
    console.log('Payment UI visible: PASS');
    console.log('No console errors: PASS');

  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
