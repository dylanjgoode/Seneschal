import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  
  console.log("Navigating to login...");
  await page.goto('http://localhost:3001/login');
  await page.fill('input[name="email"]', 'demo@acme.com');
  await page.fill('input[name="password"]', 'demo1234');
  await page.click('button[type="submit"]');
  
  console.log("Waiting for auth...");
  await page.waitForTimeout(2000);
  
  console.log("Navigating to dashboard...");
  await page.goto('http://localhost:3001/dashboard');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: 'public/dashboard.png' });
  
  await browser.close();
  console.log("Screenshot saved to public/dashboard.png");
})();
