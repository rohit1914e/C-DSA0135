import { chromium } from 'playwright';

(async () => {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log("Navigating to http://localhost:5174 ...");
  await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });

  // Let the 3D scene load and render
  await page.waitForTimeout(3000);

  console.log("\n--- BEFORE SCROLL ---");
  let stats = await page.evaluate(() => {
    return {
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: document.documentElement.clientHeight,
      scrollY: window.scrollY
    };
  });
  console.log(stats);

  console.log("\nAttempting window.scrollTo(0, 1000)...");
  await page.evaluate(() => window.scrollTo(0, 1000));
  await page.waitForTimeout(500);

  stats = await page.evaluate(() => {
    return {
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: document.documentElement.clientHeight,
      scrollY: window.scrollY
    };
  });
  console.log(stats);

  console.log("\nSimulating page.mouse.wheel(0, 1500)...");
  await page.mouse.wheel(0, 1500);
  await page.waitForTimeout(500);

  stats = await page.evaluate(() => {
    return {
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: document.documentElement.clientHeight,
      scrollY: window.scrollY
    };
  });
  console.log("\n--- AFTER SCROLL ---");
  console.log(stats);

  await browser.close();
})();
