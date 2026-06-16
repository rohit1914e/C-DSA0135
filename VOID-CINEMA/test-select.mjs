import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Capture console logs from the page
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push(msg.text());
  });

  console.log("1. Navigating to http://localhost:5174 ...");
  await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  console.log("2. Current URL:", page.url());

  // Scroll down to the Movies section
  console.log("3. Scrolling to Movies section...");
  await page.evaluate(() => {
    const moviesSection = document.getElementById('movies');
    if (moviesSection) {
      moviesSection.scrollIntoView({ behavior: 'instant' });
    }
  });
  await page.waitForTimeout(1000);

  // Find and click the SELECT button
  console.log("4. Looking for SELECT button...");
  const selectButton = await page.locator('button:has-text("Select")').first();
  const buttonExists = await selectButton.count();
  console.log("   SELECT button found:", buttonExists > 0);

  if (buttonExists > 0) {
    console.log("5. Clicking SELECT...");
    await selectButton.click();
    await page.waitForTimeout(1500);

    console.log("6. URL after click:", page.url());
    console.log("7. Console logs from page:");
    consoleLogs.forEach(log => console.log("   ->", log));

    // Check if Movie Details page rendered
    const h1 = await page.locator('h1').first().textContent().catch(() => null);
    console.log("8. Page H1 content:", h1);
    
    // Check for BOOK NOW button on the details page
    const bookNow = await page.locator('button:has-text("BOOK NOW")').count();
    console.log("9. BOOK NOW button present:", bookNow > 0);
  } else {
    console.log("ERROR: No SELECT button found on the page!");
  }

  await browser.close();
})();
