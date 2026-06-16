import { test, expect } from '@playwright/test';
import path from 'path';

// ──────────────────────────────────────────────────────────
// E2E: Ticket Generation Video Flow
// ──────────────────────────────────────────────────────────

const SCREENSHOTS_DIR = path.resolve('tests', 'screenshots');

test.describe('Ticket Generation Video Flow', () => {

  test('full booking → video → ticket generation → My Tickets', async ({ page }) => {
    test.setTimeout(120000);

    // ─── Intercept the video request ───
    // We intentionally do NOT fulfill or continue this route.
    // This leaves the request hanging indefinitely, which prevents the 
    // <video> element from ever firing an 'error' event (since the request never fails).
    // The video overlay will remain visible, allowing us to inspect it and
    // eventually dispatch the 'ended' event manually.
    await page.route('**/videos/ticket-generation.mp4', () => {
      // Intentionally empty: do not fulfill, do not continue.
      // This hangs the request.
    });

    // ═══════════════════════════════════════════════════════
    // STEP 1: Navigate to movie details page
    // ═══════════════════════════════════════════════════════
    await page.goto('/movie/interstellar', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const movieTitle = page.locator('text=Interstellar').first();
    await movieTitle.waitFor({ state: 'visible', timeout: 10000 });
    console.log('✅ STEP 1: Movie details page loaded');

    // ═══════════════════════════════════════════════════════
    // STEP 2: Navigate to seat selection
    // ═══════════════════════════════════════════════════════
    const bookButton = page.locator('text=/BOOK TICKETS/i').first();
    await bookButton.waitFor({ state: 'visible', timeout: 10000 });
    await bookButton.click();

    await page.waitForURL(/\/booking\/interstellar/, { timeout: 10000 });
    await page.waitForTimeout(1500);
    console.log('✅ STEP 2: Seat selection page loaded');

    // ═══════════════════════════════════════════════════════
    // STEP 2b: Select seats and confirm booking
    // ═══════════════════════════════════════════════════════
    const seat1 = page.locator('[data-seat-id="A1"]');
    await seat1.waitFor({ state: 'visible', timeout: 10000 });
    await seat1.click();
    await page.waitForTimeout(300);

    const seat2 = page.locator('[data-seat-id="A2"]');
    await seat2.click();
    await page.waitForTimeout(500);
    console.log('✅ Selected seats A1, A2');

    const confirmBtn = page.locator('text=/Confirm Booking/i').first();
    await confirmBtn.waitFor({ state: 'visible', timeout: 5000 });
    await confirmBtn.click();
    console.log('✅ Clicked Confirm Booking');

    // ═══════════════════════════════════════════════════════
    // STEP 3: Payment Page
    // ═══════════════════════════════════════════════════════
    await page.waitForURL(/\/payment\//, { timeout: 10000 });
    await page.waitForTimeout(2000);

    await expect(page.locator('text=Order Summary')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Secure Checkout')).toBeVisible({ timeout: 5000 });
    const payButton = page.locator('text=/i have completed payment/i');
    await expect(payButton).toBeVisible({ timeout: 5000 });
    console.log('✅ STEP 3: Payment page loaded and verified');

    // ──── Screenshot (a): Payment Page ────
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'a_payment_page.png'),
      fullPage: true,
    });
    console.log('📸 Screenshot (a): Payment Page captured');

    // ═══════════════════════════════════════════════════════
    // STEP 4: Click "I HAVE COMPLETED PAYMENT"
    // ═══════════════════════════════════════════════════════
    await payButton.click();
    console.log('✅ STEP 4: Clicked "I HAVE COMPLETED PAYMENT"');

    // Wait for React state update and video overlay to mount
    await page.waitForTimeout(1000);

    // ═══════════════════════════════════════════════════════
    // STEP 5: Verify fullscreen video overlay appears
    // ═══════════════════════════════════════════════════════
    const videoOverlay = page.locator('div[style*="99999"]');
    await videoOverlay.waitFor({ state: 'visible', timeout: 5000 });

    const overlayStyle = await videoOverlay.getAttribute('style');
    expect(overlayStyle).toContain('position: fixed');
    expect(overlayStyle).toContain('inset: 0');
    expect(overlayStyle).toContain('99999');
    console.log('✅ STEP 5: Video overlay is visible with correct positioning');
    console.log(`   Style: ${overlayStyle}`);

    // ═══════════════════════════════════════════════════════
    // STEP 6: Verify video source
    // ═══════════════════════════════════════════════════════
    const videoElement = page.locator('video');
    await videoElement.waitFor({ state: 'attached', timeout: 3000 });

    const videoSrc = await videoElement.getAttribute('src');
    expect(videoSrc).toBe('/videos/ticket-generation.mp4');
    console.log(`✅ STEP 6: Video source verified: ${videoSrc}`);

    const hasMuted = await videoElement.evaluate((el: HTMLVideoElement) => el.muted);
    expect(hasMuted).toBe(true);
    console.log('   ✓ Video is muted');

    const hasControls = await videoElement.evaluate((el: HTMLVideoElement) => el.controls);
    expect(hasControls).toBe(false);
    console.log('   ✓ Video has no controls');

    const hasAutoplay = await videoElement.evaluate((el: HTMLVideoElement) => el.autoplay);
    expect(hasAutoplay).toBe(true);
    console.log('   ✓ Video has autoplay');

    const hasPlaysInline = await videoElement.evaluate((el: HTMLVideoElement) => el.playsInline);
    expect(hasPlaysInline).toBe(true);
    console.log('   ✓ Video has playsInline');

    // ──── Screenshot (b): Video Overlay ────
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'b_video_overlay.png'),
      fullPage: false,
    });
    console.log('📸 Screenshot (b): Video overlay captured');

    // ═══════════════════════════════════════════════════════
    // STEP 7: Simulate video completion (dispatch 'ended' event)
    // ═══════════════════════════════════════════════════════
    await page.evaluate(() => {
      const video = document.querySelector('video');
      if (video) {
        // Dispatch ended so React's onEnded fires
        video.dispatchEvent(new Event('ended', { bubbles: true }));
      }
    });
    console.log('✅ STEP 7: Dispatched "ended" event on video element');

    // Wait for the fade-out transition (800ms) + state update
    await page.waitForTimeout(1500);

    // ═══════════════════════════════════════════════════════
    // STEP 8: Verify ticket generation animation appears
    // ═══════════════════════════════════════════════════════
    const paymentDetected = page.locator('text=Payment Detected');
    await paymentDetected.waitFor({ state: 'visible', timeout: 10000 });
    console.log('✅ STEP 8: Ticket generation animation started');
    console.log('   Phase: VERIFYING - "Payment Detected" visible');

    // ──── Screenshot (c1): Verifying Phase ────
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'c1_verifying_phase.png'),
      fullPage: true,
    });
    console.log('📸 Screenshot (c1): Verifying phase');

    // Wait for SCANNING phase (verifying lasts 2s)
    const readingPayment = page.locator('text=Reading Payment Data');
    await readingPayment.waitFor({ state: 'visible', timeout: 8000 });
    console.log('   Phase: SCANNING - "Reading Payment Data" visible');

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'c2_scanning_phase.png'),
      fullPage: true,
    });
    console.log('📸 Screenshot (c2): Scanning phase');

    // Wait for CREATING phase (scanning lasts 3s)
    const generatingTicket = page.locator('text=Generating Digital Ticket');
    await generatingTicket.waitFor({ state: 'visible', timeout: 8000 });
    console.log('   Phase: CREATING - "Generating Digital Ticket" visible');

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'c3_creating_phase.png'),
      fullPage: true,
    });
    console.log('📸 Screenshot (c3): Creating phase');

    // Wait for REVEAL phase (creating lasts 3s)
    const ticketGenerated = page.locator('text=Ticket Generated').first();
    await ticketGenerated.waitFor({ state: 'visible', timeout: 8000 });
    console.log('   Phase: REVEAL - "Ticket Generated" visible');

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'c4_reveal_phase.png'),
      fullPage: true,
    });
    console.log('📸 Screenshot (c4): Reveal phase');

    // Wait for SAVING phase (reveal lasts 3s)
    const addingToTickets = page.locator('text=Adding to My Tickets');
    await addingToTickets.waitFor({ state: 'visible', timeout: 8000 });
    console.log('   Phase: SAVING - "Adding to My Tickets" visible');

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'c5_saving_phase.png'),
      fullPage: true,
    });
    console.log('📸 Screenshot (c5): Saving phase');

    // Wait for COMPLETE phase (saving lasts 2s)
    const readyForEntry = page.locator('text=Ready for entry');
    await readyForEntry.waitFor({ state: 'visible', timeout: 8000 });
    console.log('   Phase: COMPLETE - "Ready for entry" visible');

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'c6_complete_phase.png'),
      fullPage: true,
    });
    console.log('📸 Screenshot (c6): Complete phase');

    // ═══════════════════════════════════════════════════════
    // STEP 9: Verify redirect to My Tickets
    // ═══════════════════════════════════════════════════════
    await page.waitForURL(/\/tickets/, { timeout: 10000 });
    console.log('✅ STEP 9: Redirected to /tickets');

    await page.waitForTimeout(1500);

    // ═══════════════════════════════════════════════════════
    // STEP 10: Verify ticket card is visible on My Tickets page
    // ═══════════════════════════════════════════════════════
    await expect(page.locator('text=My Tickets')).toBeVisible({ timeout: 5000 });
    console.log('✅ STEP 10: My Tickets page loaded');

    const ticketCard = page.locator('text=Interstellar').first();
    await expect(ticketCard).toBeVisible({ timeout: 5000 });
    console.log('   ✓ Interstellar ticket card visible');

    const confirmedBadge = page.locator('text=Confirmed');
    await expect(confirmedBadge).toBeVisible({ timeout: 5000 });
    console.log('   ✓ Ticket shows "Confirmed" status');

    const bookingId = page.locator('text=/BOOKING ID:/i');
    await expect(bookingId).toBeVisible({ timeout: 5000 });
    console.log('   ✓ Booking ID visible on ticket');

    // ──── Screenshot (d): My Tickets Page ────
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'd_my_tickets_page.png'),
      fullPage: true,
    });
    console.log('📸 Screenshot (d): My Tickets page captured');

    // ═══════════════════════════════════════════════════════
    // FINAL SUMMARY
    // ═══════════════════════════════════════════════════════
    console.log('\n════════════════════════════════════════════════');
    console.log('  ✅ ALL 10 STEPS PASSED SUCCESSFULLY');
    console.log('════════════════════════════════════════════════');
    console.log('  Screenshots saved to: tests/screenshots/');
    console.log('    a) a_payment_page.png');
    console.log('    b) b_video_overlay.png');
    console.log('    c) c1-c6_*.png (all 6 animation phases)');
    console.log('    d) d_my_tickets_page.png');
    console.log('════════════════════════════════════════════════\n');
  });
});
