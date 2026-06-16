import { test, expect } from '@playwright/test';
import path from 'path';

test('Verify Video Endpoint', async ({ page }) => {
  console.log('Navigating to http://localhost:5173/videos/ticket-generation.mp4');
  
  const response = await page.goto('http://localhost:5173/videos/ticket-generation.mp4');
  
  console.log('Response status:', response?.status());
  console.log('Content-Type:', response?.headers()['content-type']);
  
  // Wait for the video element to be visible
  await page.waitForSelector('video', { timeout: 5000 });
  
  const videoElement = await page.$('video');
  const isVideoValid = videoElement !== null;
  console.log('document.querySelector("video") returns valid element:', isVideoValid);
  
  // Extract properties, waiting for metadata to load if necessary
  const videoProps = await page.evaluate(async () => {
    const v = document.querySelector('video');
    if (!v) return null;
    
    // Wait for metadata to load if it hasn't already
    if (v.readyState < 1) {
      await new Promise(resolve => {
        v.addEventListener('loadedmetadata', resolve, { once: true });
        // Fallback timeout in case metadata never loads
        setTimeout(resolve, 3000);
      });
    }
    
    return {
      duration: v.duration,
      videoWidth: v.videoWidth,
      videoHeight: v.videoHeight,
      readyState: v.readyState
    };
  });
  
  console.log('Video properties:');
  console.log(`- duration: ${videoProps?.duration}`);
  console.log(`- videoWidth: ${videoProps?.videoWidth}`);
  console.log(`- videoHeight: ${videoProps?.videoHeight}`);
  
  // Ensure the page doesn't have React elements like the VOID CINEMA title
  const hasReactApp = await page.evaluate(() => {
    return document.body.innerText.includes('VOID CINEMA');
  });
  console.log('Browser displays React application:', hasReactApp);
  
  const screenshotPath = path.resolve('tests', 'screenshots', 'direct_video_endpoint.png');
  await page.screenshot({ path: screenshotPath });
  console.log('Screenshot saved to:', screenshotPath);
  
  expect(isVideoValid).toBe(true);
  expect(hasReactApp).toBe(false);
});
