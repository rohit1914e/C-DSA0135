import { test, expect } from '@playwright/test';
import path from 'path';

test('Debug Component Mount Flow', async ({ page }) => {
  test.setTimeout(90000);
  const SCREENSHOTS_DIR = path.resolve('tests', 'screenshots');
  
  // Collect console logs and errors
  const pageLogs: string[] = [];
  page.on('console', msg => {
    const text = msg.text();
    if (text === 'VIDEO MOUNTED' || text === 'VIDEO PLAY STARTED' || text === 'VIDEO ENDED' || text === 'REDIRECTING TO TICKET SCREEN' || msg.type() === 'error') {
      pageLogs.push(`[Console ${msg.type().toUpperCase()}] ${text}`);
    }
  });
  page.on('pageerror', error => {
    pageLogs.push(`[Page Error] ${error.message}`);
  });
  page.on('requestfailed', request => {
    pageLogs.push(`[Request Failed] ${request.url()} - ${request.failure()?.errorText}`);
  });

  // Navigate directly to movie details and complete booking
  await page.goto('http://localhost:5174/movie/interstellar', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  await page.locator('text=/BOOK TICKETS/i').first().click();
  await page.waitForURL(/\/booking\/interstellar/);
  await page.waitForTimeout(1000);

  await page.locator('[data-seat-id="A1"]').click();
  await page.locator('text=/Confirm Booking/i').first().click();
  
  await page.waitForURL(/\/payment\//);
  await page.waitForTimeout(1000);

  const payButton = page.locator('text=/i have completed payment/i');
  await expect(payButton).toBeVisible();

  const inspectDOM = async (label: string) => {
    console.log(`\n=== Inspection: ${label} ===`);
    const metrics = await page.evaluate(() => {
      const video = document.querySelector('video');
      let overlayContainer = null;
      let opacity = 'N/A';
      let zIndex = 'N/A';
      let display = 'N/A';
      
      if (video) {
        overlayContainer = video.parentElement;
        if (overlayContainer) {
          const computedStyle = window.getComputedStyle(overlayContainer);
          opacity = computedStyle.opacity;
          zIndex = computedStyle.zIndex;
          display = computedStyle.display;
        }
      }

      return {
        overlayMounted: overlayContainer !== null || video !== null,
        videoExists: video !== null,
        src: video ? video.getAttribute('src') : 'N/A',
        srcContainsVideo: video ? (video.getAttribute('src') || '').includes('/videos/ticket-generation.mp4') : false,
        readyState: video ? video.readyState : -1,
        paused: video ? video.paused : 'N/A',
        currentTime: video ? video.currentTime : -1,
        display: display,
        opacity: opacity,
        zIndex: zIndex,
        isUnmounted: video === null
      };
    });

    console.log(`1. Does the video overlay component mount? ${metrics.overlayMounted}`);
    console.log(`2. Does a <video> element exist? ${metrics.videoExists}`);
    console.log(`3. What is document.querySelector('video').src ? ${metrics.src}`);
    console.log(`4. Is the src exactly /videos/ticket-generation.mp4? ${metrics.src === '/videos/ticket-generation.mp4'}`);
    console.log(`5. Is readyState >= 3 ? ${metrics.readyState >= 3} (Actual: ${metrics.readyState})`);
    console.log(`6. Is currentTime increasing? Current value: ${metrics.currentTime}`);
    console.log(`7. Is the video hidden behind another overlay? (z-index is ${metrics.zIndex})`);
    console.log(`8. Is opacity 0? ${metrics.opacity === '0'} (Actual: ${metrics.opacity})`);
    console.log(`9. Is display none? ${metrics.display === 'none'} (Actual: ${metrics.display})`);
    console.log(`10. Is the component unmounting immediately after mount? ${metrics.isUnmounted}`);
  };

  console.log('--- CLICKING "I HAVE COMPLETED PAYMENT" ---');
  await payButton.click();
  
  // Wait just 100ms for React state updates
  await page.waitForTimeout(100);
  await inspectDOM('IMMEDIATELY AFTER CLICK');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'playback_0s.png') });

  // Wait 1 second
  await page.waitForTimeout(1000);
  await inspectDOM('AFTER 1 SECOND');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'playback_1s.png') });

  // Wait 5 seconds
  await page.waitForTimeout(4000); // 4s + previous 1s = 5s total
  await inspectDOM('AFTER 5 SECONDS');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'playback_5s.png') });

  console.log('\n=== RELEVANT CONSOLE LOGS ===');
  if (pageLogs.length === 0) {
    console.log('No specific logs caught.');
  } else {
    pageLogs.forEach(err => console.log(err));
  }
});
