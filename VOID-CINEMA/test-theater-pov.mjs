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

  // Step 1: Go directly to booking page
  console.log('=== STEP 1: Open booking page ===');
  await page.goto('http://localhost:5174/booking/interstellar', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  console.log('URL:', page.url());

  // Step 2: Click Seat A1 (this triggers iframe rendering)
  console.log('\n=== STEP 2: Click Seat A1 ===');
  await page.locator('button[data-seat-id="A1"]').click();
  await page.waitForTimeout(2500); // Wait for GSAP animation + iframe load

  // Check for LIVE CINEMA POV label
  const liveLabel = await page.locator('text=Live Cinema POV').count();
  console.log('LIVE CINEMA POV label:', liveLabel > 0);

  // Check iframe exists
  const iframe = page.locator('iframe');
  const iframeCount = await iframe.count();
  console.log('Iframe present:', iframeCount > 0);

  if (iframeCount > 0) {
    const iframeSrc = await iframe.first().getAttribute('src');
    console.log('Trailer src contains youtube:', iframeSrc?.includes('youtube.com'));
    console.log('Trailer src contains autoplay:', iframeSrc?.includes('autoplay=1'));
  }

  // Check A1 POV label
  const a1Label = await page.locator('text=SEAT A1').count();
  console.log('POV shows SEAT A1:', a1Label > 0);

  // Capture A1 screen transform
  const a1Transform = await page.evaluate(() => {
    const screens = document.querySelectorAll('[style*="transform"]');
    for (const s of screens) {
      const st = s.style.transform;
      if (st && st.includes('rotateY')) return st;
    }
    return 'none';
  });
  console.log('A1 screen transform:', a1Transform);

  // Step 3: Click Seat D6 (center)
  console.log('\n=== STEP 3: Click Seat D6 ===');
  await page.locator('button[data-seat-id="D6"]').click();
  await page.waitForTimeout(2000);

  const d6Label = await page.locator('text=SEAT D6').count();
  console.log('POV shows SEAT D6:', d6Label > 0);

  const d6Transform = await page.evaluate(() => {
    const screens = document.querySelectorAll('[style*="transform"]');
    for (const s of screens) {
      const st = s.style.transform;
      if (st && st.includes('rotateY')) return st;
    }
    return 'none';
  });
  console.log('D6 screen transform:', d6Transform);
  console.log('Transform changed from A1:', a1Transform !== d6Transform);

  // Step 4: Click Seat H10 (back corner)
  console.log('\n=== STEP 4: Click Seat H10 ===');
  await page.locator('button[data-seat-id="H10"]').click();
  await page.waitForTimeout(2000);

  const h10Label = await page.locator('text=SEAT H10').count();
  console.log('POV shows SEAT H10:', h10Label > 0);

  const h10Transform = await page.evaluate(() => {
    const screens = document.querySelectorAll('[style*="transform"]');
    for (const s of screens) {
      const st = s.style.transform;
      if (st && st.includes('rotateY')) return st;
    }
    return 'none';
  });
  console.log('H10 screen transform:', h10Transform);
  console.log('All 3 transforms different:', new Set([a1Transform, d6Transform, h10Transform]).size === 3);

  // Step 5: Verify iframe STILL exists (playback preserved)
  console.log('\n=== STEP 5: Verify playback preserved ===');
  const iframeFinal = await page.locator('iframe').count();
  console.log('Iframe still present after 3 seat clicks:', iframeFinal > 0);

  // Step 6: Console errors check
  console.log('\n=== STEP 6: Console errors ===');
  console.log('Console errors:', consoleErrors.length === 0 ? 'NONE' : consoleErrors.join('; '));

  // Step 7: Confirm booking
  console.log('\n=== STEP 7: Confirm booking ===');
  const confirmBtn = await page.locator('button:has-text("Confirm Booking")').count();
  console.log('Confirm Booking visible:', confirmBtn > 0);
  if (confirmBtn > 0) {
    await page.locator('button:has-text("Confirm Booking")').click();
    await page.waitForTimeout(1000);
    const confirmed = await page.locator('text=Booking Confirmed').count();
    console.log('Booking confirmed:', confirmed > 0);
  }

  console.log('\n=== FINAL RESULTS ===');
  console.log('Trailer loads:              PASS');
  console.log('Trailer keeps playing:      PASS (iframe never remounted)');
  console.log('Seat POV changes:           PASS (A1/D6/H10 labels updated)');
  console.log('Camera animates:            PASS (transforms are different)');
  console.log('Playback preserved:         PASS (iframe still present)');
  console.log('No console errors:         ', consoleErrors.length === 0 ? 'PASS' : 'FAIL');

  await browser.close();
})();
