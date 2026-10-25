const assert = require('node:assert/strict');
const path = require('node:path');
const { PNG } = require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const { chromium } = require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const viewport of [{ width: 1440, height: 900 }, { width: 640, height: 572 }, { width: 390, height: 844 }]) {
      const page = await browser.newPage({ viewport });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
      await page.locator('#btn-sound-title').click();
      const name = `${viewport.width}x${viewport.height}`;
      const canvas = page.locator('#home-3d canvas');
      await canvas.waitFor();
      const firstFrame = await canvas.screenshot();
      const pixels = PNG.sync.read(firstFrame);
      const shades = new Set();
      for (let i = 0; i < pixels.data.length; i += 256) shades.add(`${pixels.data[i]},${pixels.data[i+1]},${pixels.data[i+2]}`);
      assert(shades.size > 100, `Blank 3D canvas: ${name}`);
      await page.locator('#desk-power').click();
      assert.equal(await page.locator('#desk-power').getAttribute('aria-pressed'), 'true');
      assert(!firstFrame.equals(await canvas.screenshot()), `Canvas did not respond to bench power: ${name}`);
      await page.locator('#desk-power').click();
      const beforeMotion = await canvas.screenshot();
      await page.waitForTimeout(200);
      assert(!beforeMotion.equals(await canvas.screenshot()), `Home scene is not animated: ${name}`);
      await page.screenshot({ path: path.join(__dirname, `home-${name}.png`) });
      const home = await page.evaluate(() => {
        const rect = selector => {
          const r = document.querySelector(selector).getBoundingClientRect();
          return { x: r.x, y: r.y, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
        };
        return { copy: rect('.home-copy'), footer: rect('.home-footer'), nav: rect('.home-nav'), start: rect('#btn-start'), manual: rect('#btn-howto'), canvas: !!document.querySelector('#home-3d canvas') };
      });
      assert(home.copy.y >= home.nav.bottom - 1, `Home copy overlaps navigation: ${name}`);
      assert(home.copy.bottom <= home.footer.y + 1, `Home copy overlaps footer: ${name}`);
      assert(home.manual.right <= viewport.width, `Home buttons overflow: ${name}`);
      await page.locator('#btn-start').click();
      await page.locator('#btn-intro-skip').click();
      await page.waitForFunction(() => !document.querySelector('.game-shell').inert);
      await page.screenshot({ path: path.join(__dirname, `game-${name}.png`) });
      const layout = await page.evaluate(() => {
        const rect = selector => {
          const r = document.querySelector(selector).getBoundingClientRect();
          return { y: r.y, bottom: r.bottom, width: r.width, height: r.height };
        };
        return { hud: rect('.hud'), scene: rect('.scene-wrap'), inventory: rect('.inv-dock'), overflow: document.documentElement.scrollWidth > innerWidth };
      });
      assert(!layout.overflow, `Horizontal overflow: ${name}`);
      assert(layout.hud.bottom <= layout.scene.y, `HUD overlaps scene: ${name}`);
      assert(layout.scene.bottom <= layout.inventory.y, `Scene overlaps inventory: ${name}`);
      assert(layout.inventory.bottom <= viewport.height, `Inventory overflows: ${name}`);
      await page.locator('.hidden-object').nth(0).focus();
      await page.keyboard.press('Enter');
      await page.waitForFunction(() => document.querySelector('#hud-found').textContent.startsWith('1/'));
      assert.equal(await page.locator('.inv-slot.found').count(), 1);
      assert.equal(await page.locator('[role="progressbar"]').getAttribute('aria-valuenow'), '1');
      assert.equal(await page.locator('#hud-overclock-box').evaluate(el => el.style.getPropertyValue('--charge')), '20%');
      for (let index = 1; index < 3; index++) {
        await page.locator('.hidden-object').nth(index).focus();
        await page.keyboard.press('Enter');
      }
      assert.equal(await page.locator('.hud-stat.combo-active').count(), 1);
      await page.locator('#btn-pause').click();
      await page.locator('#overlay-pause.active').waitFor();
      await page.screenshot({ path: path.join(__dirname, `pause-${name}.png`) });
      assert.deepEqual(errors, [], `JavaScript errors: ${name}`);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      assert.equal(await page.locator('#btn-start').evaluate(el => getComputedStyle(el, '::after').animationName), 'none');
      console.log(JSON.stringify({ viewport: name, home, layout, interactions: 'pass' }));
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
