const { chromium } = require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const errors = [], rooms = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.locator('#btn-start').click();
  await page.locator('#btn-intro-skip').click();
  await page.locator('#overlay-story.active').waitFor();
  await page.locator('#btn-story-continue').click();
  await page.waitForFunction(() => !document.querySelector('.game-shell').inert);
  for (let level = 0; level < 10; level++) {
    const info = await page.evaluate(() => ({
      name: document.querySelector('#hud-level').textContent,
      targets: document.querySelectorAll('.hidden-object').length,
      decoys: document.querySelectorAll('.scene-prop').length,
      rendered: document.querySelector('#scene-wrap').classList.contains('has-3d-scene')
    }));
    rooms.push(info);
    if (level === 4 || level === 9) await page.locator('#scene-wrap').screenshot({ path: `tmp/qa-render-room${level + 1}.png` });
    await page.evaluate(() => {
      [...document.querySelectorAll('.hidden-object:not(.found)')]
        .forEach(el => el.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    });
    await page.locator('#overlay-complete.active').waitFor({ timeout: 20000 });
    if (level === 9) break;
    await page.locator('#btn-next-level').click();
    await page.locator('#overlay-puzzle.active').waitFor();
    await page.locator('#btn-puzzle-skip').click();
    await page.locator('#overlay-map.active').waitFor({ timeout: 20000 });
    await page.locator('#btn-map-travel').click();
    await page.locator('#overlay-story.active').waitFor();
    await page.locator('#btn-story-continue').click();
    await page.waitForFunction(() => !document.querySelector('.game-shell').inert);
  }
  console.log(JSON.stringify({ rooms, errors }));
  await browser.close();
})().catch(error => { console.error(error); process.exitCode = 1; });
