import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  // 1280x720 matches the aspect ratio of the image the user uploaded (roughly 16:9)
  const page = await browser.newPage({ viewport: { width: 1280, height: 768 } });
  
  console.log("Navigating to landing page...");
  await page.goto('http://localhost:3000/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: 'public/hero.png' });
  
  await browser.close();
  console.log("Screenshot saved to public/hero.png");
})();
