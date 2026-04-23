import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();

const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
});

// 1. Visit site → should show login screen
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForSelector('input[type="password"]', { timeout: 5000 });
await page.screenshot({ path: '/tmp/imago-login.png' });

// 2. Try wrong password
await page.locator('input[type="password"]').fill('wrongpw');
await page.locator('button:has-text("Sign in")').click();
await page.waitForSelector('text=Incorrect password', { timeout: 5000 });
const gotError = await page.locator('text=Incorrect password').count();

// 3. Try correct password (dev)
await page.locator('input[type="password"]').fill('dev');
await page.locator('button:has-text("Sign in")').click();

// 4. Should see the gallery
await page.waitForSelector('aside >> text=Imago', { timeout: 5000 });
const brand = await page.locator('aside >> text=Imago').first().textContent();
const uploadBtn = await page.locator('aside >> text=/^Upload$/').count();

console.log(JSON.stringify({
  loginScreenShown: true,
  wrongPasswordError: gotError > 0,
  afterLoginBrand: brand,
  uploadBtnFound: uploadBtn > 0,
  errors,
}, null, 2));

// 5. Navigate to Settings and logout
await page.locator('aside >> button[title="Settings"]').click();
await page.waitForSelector('text=Log out', { timeout: 3000 });
await page.locator('button:has-text("Log out")').click();

// 6. Should return to login screen
await page.waitForSelector('input[type="password"]', { timeout: 5000 });
const backToLogin = await page.locator('input[type="password"]').count();
console.log(JSON.stringify({ backToLoginAfterLogout: backToLogin > 0 }));

await page.screenshot({ path: '/tmp/imago-after-logout.png' });
await browser.close();
