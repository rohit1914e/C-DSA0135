import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => {
    console.log(`[Browser Console]: ${msg.text()}`);
  });

  try {
    await page.goto('http://localhost:5174/booking/interstellar', { waitUntil: 'networkidle' });
    await page.locator('button[data-seat-id="A1"]').click();
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("Confirm Booking")').click();
    await page.waitForTimeout(1000);
    
    const paymentBtn = page.locator('button:has-text("I have completed payment")');
    await paymentBtn.waitFor({ state: 'visible' });
    await paymentBtn.click();

    console.log('Clicked complete payment...');

    // Wait and log text on page every 2 seconds
    for(let i=0; i<10; i++) {
        await page.waitForTimeout(2000);
        const text = await page.locator('body').innerText();
        console.log(`--- sec ${i*2 + 2} ---`);
        console.log(text.substring(0, 100).replace(/\n/g, ' '));
    }

  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
