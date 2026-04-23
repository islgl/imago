import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();

const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
});

await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

// Seed an image if gallery is empty
const cardCount0 = await page.locator('img[alt="imago-preview.png"]').count();
if (cardCount0 === 0) {
  const fs = await import('node:fs/promises');
  const data = await fs.readFile('./assets/design/imago-preview.png');
  const fd = new FormData();
  fd.append('file', new Blob([data], { type: 'image/png' }), 'imago-preview.png');
  const res = await fetch('http://localhost:8787/api/images', { method: 'POST', body: fd });
  console.log('seeded upload status:', res.status);
  await page.reload({ waitUntil: 'networkidle' });
}

await page.waitForSelector('aside', { timeout: 5000 });

const brandText = await page.locator('aside >> text=Imago').first().textContent();
const allNav = await page.locator('aside >> text=/^All$/').count();
const starredNav = await page.locator('aside >> text=/^Starred$/').count();
const uploadBtn = await page.locator('aside >> text=/^Upload$/').count();
const chinese = (await page.content()).match(/[一-鿿]/g);

console.log(JSON.stringify({
  brandText,
  allNavFound: allNav,
  starredNavFound: starredNav,
  uploadBtnFound: uploadBtn,
  chineseCharsOnPage: chinese?.length ?? 0,
  errors,
}, null, 2));

// Right-click context menu test
const card = page.locator('img[alt="imago-preview.png"]').first();
const box = await card.boundingBox();
if (box) {
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down({ button: 'right' });
  await page.mouse.up({ button: 'right' });
  await page.waitForTimeout(200);

  const ctxHasOpen = await page.locator('text=Open details').count();
  const ctxHasCopy = await page.locator('text=Copy link').count();
  const ctxHasStar = await page.locator('text=/^Star$|^Unstar$/').count();
  const ctxHasPublic = await page.locator('text=/^Make public$|^Make private$/').count();
  const ctxHasDelete = await page.locator('text=Delete').count();

  console.log(JSON.stringify({
    contextMenu: {
      openDetails: ctxHasOpen > 0,
      copyLink: ctxHasCopy > 0,
      starAction: ctxHasStar > 0,
      publicAction: ctxHasPublic > 0,
      deleteAction: ctxHasDelete > 0,
    },
  }));

  await page.screenshot({ path: '/tmp/imago-ctxmenu.png' });

  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  const closedCount = await page.locator('text=Open details').count();
  console.log(JSON.stringify({ closedByEscape: closedCount === 0 }));
}

await page.screenshot({ path: '/tmp/imago-en.png' });
await browser.close();
