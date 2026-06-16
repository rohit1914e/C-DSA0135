import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push(msg.text()));

  console.log('=== STEP 1: Navigate to home ===');
  await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  console.log('URL:', page.url());

  console.log('\n=== STEP 2: Scroll to Movies and click SELECT ===');
  await page.evaluate(() => document.getElementById('movies')?.scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(500);
  const selectBtn = page.locator('button:has-text("Select")').first();
  console.log('SELECT button found:', (await selectBtn.count()) > 0);
  await selectBtn.click();
  await page.waitForTimeout(1500);
  console.log('URL after SELECT:', page.url());

  console.log('\n=== STEP 3: Verify Movie Details Page ===');
  const movieTitle = await page.locator('h1').first().textContent().catch(() => 'NOT FOUND');
  console.log('Movie title:', movieTitle);

  // Verify BOOK TICKETS exists and old buttons are gone
  const bookTicketsBtn = page.locator('button:has-text("BOOK TICKETS")');
  const bookNowBtn = page.locator('button:has-text("BOOK NOW")');
  const enterExpBtn = page.locator('button:has-text("ENTER EXPERIENCE")');
  console.log('BOOK TICKETS button:', (await bookTicketsBtn.count()) > 0);
  console.log('BOOK NOW button (should be false):', (await bookNowBtn.count()) > 0);
  console.log('ENTER EXPERIENCE button (should be false):', (await enterExpBtn.count()) > 0);

  console.log('\n=== STEP 4: Click BOOK TICKETS ===');
  await bookTicketsBtn.click();
  await page.waitForTimeout(1500);
  console.log('URL after BOOK TICKETS:', page.url());

  console.log('\n=== STEP 5: Verify Seat Selection Page ===');
  const seatPageTitle = await page.locator('text=SEAT SELECTION').count();
  console.log('SEAT SELECTION label found:', seatPageTitle > 0);

  // Verify seat grid exists
  const seatA1 = page.locator('button[data-seat-id="A1"]');
  const seatC4 = page.locator('button[data-seat-id="C4"]');
  console.log('Seat A1 found:', (await seatA1.count()) > 0);
  console.log('Seat C4 found:', (await seatC4.count()) > 0);

  console.log('\n=== STEP 6: Click Seat A1 ===');
  await seatA1.click();
  await page.waitForTimeout(500);
  const povAfterA1 = await page.locator('text=YOUR SEAT: A1').count();
  console.log('POV shows A1:', povAfterA1 > 0);

  // Get metrics for A1
  const a1Quality = await page.locator('.glass-panel .text-2xl').first().textContent().catch(() => 'N/A');
  console.log('A1 quality score:', a1Quality);

  console.log('\n=== STEP 7: Click Seat C4 ===');
  await seatC4.click();
  await page.waitForTimeout(500);
  const povAfterC4 = await page.locator('text=YOUR SEAT: C4').count();
  console.log('POV shows C4:', povAfterC4 > 0);

  const c4Quality = await page.locator('.glass-panel .text-2xl').first().textContent().catch(() => 'N/A');
  console.log('C4 quality score:', c4Quality);
  console.log('POV updated differently (A1 vs C4):', a1Quality !== c4Quality ? 'YES' : 'SAME SCORE');

  console.log('\n=== STEP 8: Click Confirm Booking ===');
  const confirmBtn = page.locator('button:has-text("Confirm Booking")');
  console.log('Confirm Booking button found:', (await confirmBtn.count()) > 0);
  await confirmBtn.click();
  await page.waitForTimeout(1000);

  const confirmationText = await page.locator('text=Booking Confirmed').count();
  console.log('Booking Confirmed message:', confirmationText > 0);

  console.log('\n=== STEP 9: Navigate to My Tickets ===');
  const viewTicketsBtn = page.locator('button:has-text("View My Tickets")');
  console.log('View My Tickets button:', (await viewTicketsBtn.count()) > 0);
  await viewTicketsBtn.click();
  await page.waitForTimeout(2000);
  console.log('URL after tickets:', page.url());

  // Check if ticket appears
  await page.evaluate(() => document.getElementById('tickets')?.scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(500);

  // Look for the booking in the tickets section
  const ticketContent = await page.locator('#tickets').textContent().catch(() => '');
  const hasBooking = ticketContent.includes('interstellar') || ticketContent.includes('Interstellar') || ticketContent.includes('BK-');
  console.log('Ticket appears in My Tickets section:', hasBooking);

  console.log('\n=== SUMMARY ===');
  console.log('Flow: Home -> Movie Details -> Seat Selection -> Booking Confirmed -> My Tickets');
  console.log('All steps completed.');

  await browser.close();
})();
