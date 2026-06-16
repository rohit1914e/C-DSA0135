import { chromium } from 'playwright';
import path from 'path';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('GPU stall')) {
      console.log(`[Browser Error]: ${msg.text()}`);
    }
  });

  page.on('pageerror', error => {
    console.log(`[Page Error]: ${error.message}`);
  });

  // Check for failed network requests (like 404s for the image)
  let qrImageFailed = false;
  page.on('requestfailed', request => {
    if (request.url().includes('payment-qr.png')) {
      qrImageFailed = true;
      console.log(`[Network Error]: Failed to load payment-qr.png`);
    }
  });
  page.on('response', response => {
    if (response.url().includes('payment-qr.png') && !response.ok()) {
      qrImageFailed = true;
      console.log(`[Network Error]: payment-qr.png returned status ${response.status()}`);
    }
  });

  try {
    // Navigate and trigger a booking to reach payment page
    console.log('=== Navigating to booking page ===');
    await page.goto('http://localhost:5174/booking/interstellar', { waitUntil: 'networkidle' });
    
    await page.locator('button[data-seat-id="A1"]').click();
    await page.waitForTimeout(1000);

    await page.locator('button:has-text("Confirm Booking")').click();
    await page.waitForTimeout(1000);

    console.log('\n=== On Payment Page ===');
    
    // Check QR Image
    const qrLocator = page.locator('img[alt="Payment QR Code"]');
    
    // Wait for the image element to exist
    await qrLocator.waitFor({ state: 'attached' });
    
    // Check if the fallback is visible
    const fallbackText = await page.locator('text=QR Code Not Uploaded').count();
    
    // Check the src
    const src = await qrLocator.getAttribute('src');
    
    // Check if the actual image is displayed
    const isVisible = await qrLocator.isVisible();

    console.log('Image element exists:', await qrLocator.count() > 0);
    console.log('Image src contains payment-qr:', src?.includes('payment-qr'));
    console.log('Image visually visible:', isVisible);
    console.log('Fallback text displayed:', fallbackText > 0);
    console.log('Network load failed:', qrImageFailed);

    if (qrImageFailed || fallbackText > 0) {
      throw new Error('QR image failed to load or fallback is displaying.');
    }

    if (!isVisible) {
      throw new Error('QR image is not visible.');
    }

    console.log('\n=== FINAL RESULT ===');
    console.log('QR Image Verified: PASS');
    console.log('No placeholder/fallback displayed: PASS');

  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
