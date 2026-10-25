const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require('C:/Users/asus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const results = [];
async function startGame(page, fallback = false) {
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await page.locator('#btn-sound-title').click();
  await page.locator('#btn-start').click();
  await page.locator('#btn-intro-menu').click();
  await page.locator('#btn-intro-skip').click();
  await page.locator('#btn-story-continue').click();
  await page.waitForFunction(() => !document.querySelector('.game-shell').inert);
  if (!fallback) await page.waitForFunction(() => document.querySelector('#scene-wrap').classList.contains('has-3d-scene'));
}
async function stats(page) {
  return page.evaluate(() => Object.fromEntries(['score', 'found', 'streak', 'overclock', 'timer'].map(id => [id, document.querySelector('#hud-' + id).textContent])));
}
async function recover(page, locator = page.locator('.hidden-object:not(.found)').first()) {
  await locator.focus();
  await page.keyboard.press('Enter');
}
async function assertScan(page, count) {
  assert.equal(await page.locator('.hidden-object.scan-target').count(), count);
  assert.equal(await page.locator('.hidden-object.found.scan-target, .scene-prop .scan-marker').count(), 0);
  if (count) {
    const visible = await page.locator('.scan-target .scan-ring-outer').evaluateAll(rings => rings.every(ring => {
      const style = getComputedStyle(ring);
      return Number(style.opacity) > 0.2 && style.visibility !== 'hidden' && ring.getBoundingClientRect().width > 0;
    }));
    assert(visible, 'Remaining targets must have visible rings in both renderers');
  }
}
async function assertLayout(page, width, height) {
  await page.setViewportSize({ width, height });
  await page.waitForTimeout(100);
  const boxes = await page.evaluate(() => {
    const rect = selector => document.querySelector(selector).getBoundingClientRect().toJSON();
    const cards = [...document.querySelectorAll('.hud-stats .hud-stat')];
    return {
      hud: rect('.hud'), group: rect('.hud-stats'), context: rect('.hud-context'), controls: rect('.hud-controls'),
      scene: rect('.scene-wrap'), tools: rect('.tool-rail'), overflow: document.documentElement.scrollWidth > innerWidth,
      cards: cards.map(card => card.getBoundingClientRect().toJSON()),
      clipped: cards.flatMap(card => [...card.querySelectorAll('.lbl,.val')].filter(el => {
        const text = document.createRange(); text.selectNodeContents(el);
        const r = text.getBoundingClientRect(), box = card.getBoundingClientRect();
        return r.left < box.left || r.right > box.right || r.bottom > box.bottom;
      }).map(el => el.textContent))
    };
  });
  assert(!boxes.overflow, `Page overflow at ${width}x${height}`);
  assert(Math.abs(boxes.group.x + boxes.group.width / 2 - width / 2) < 1, `Off-center HUD at ${width}x${height}`);
  assert.equal(boxes.cards.length, 5);
  assert.deepEqual(boxes.clipped, [], `Clipped HUD text at ${width}x${height}`);
  assert(boxes.hud.bottom <= boxes.scene.y, `HUD overlaps scene at ${width}x${height}`);
  assert(boxes.group.bottom <= boxes.hud.bottom && boxes.group.x >= 0 && boxes.group.right <= width);
  for (let i = 1; i < boxes.cards.length; i++) assert(boxes.cards[i - 1].right <= boxes.cards[i].left);
  const intersects = (a, b) => a.x < b.right && a.right > b.x && a.y < b.bottom && a.bottom > b.y;
  assert(!intersects(boxes.group, boxes.controls) && !intersects(boxes.group, boxes.context), `HUD controls overlap at ${width}x${height}`);
  assert(boxes.tools.bottom <= height, `Tools overflow at ${width}x${height}`);
  results.push({ layout: `${width}x${height}`, hudHeight: boxes.hud.height, sceneHeight: boxes.scene.height });
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
    const errors = [], consoleErrors = [];
    page.on('pageerror', error => { errors.push(error.message); console.error('PAGE ERROR:', error.message); });
    page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    await startGame(page);
    if (process.argv.includes('--views')) {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      for (const [width, height] of [[390,844], [320,568], [844,390], [568,320]]) {
        await page.setViewportSize({ width, height });
        await page.locator('#btn-restart').click();
        await page.waitForFunction(() => !document.querySelector('.game-shell').inert);
        await page.locator('#btn-scan').click();
        const geometry = await page.evaluate(() => {
          const rect = selector => document.querySelector(selector).getBoundingClientRect().toJSON();
          return { scene: rect('.scene-wrap'), status: rect('.scene-status'), zoom: rect('.scene-zoom-controls'),
            hud: rect('.hud'), scan: rect('#btn-scan'), inventory: rect('.inv-dock'),
            tools: [...document.querySelectorAll('.tool-button')].map(el => el.getBoundingClientRect().toJSON()) };
        });
        await page.screenshot({ path: path.join(__dirname, `scan-hud-3d-${width}x${height}.png`) });
        results.push({ viewport: `${width}x${height}`, geometry });
        assert(geometry.status.y >= geometry.scene.y && geometry.status.bottom <= geometry.scene.bottom, 'Scan message must fit inside the scene');
        assert(geometry.scan.y >= geometry.hud.bottom && geometry.scan.bottom <= geometry.inventory.y, 'Scan control must not overlap HUD or inventory');
        assert(geometry.tools.every(tool => tool.y >= geometry.hud.bottom && tool.bottom <= geometry.inventory.y), 'All tools must remain clear of HUD and inventory');
        const intersects = (a, b) => a.x < b.right && a.right > b.x && a.y < b.bottom && a.bottom > b.y;
        assert(!intersects(geometry.status, geometry.zoom), 'Scan message must not overlap zoom controls');
        await page.locator('#btn-scene-zoom-in').click();
        await page.evaluate(() => window.CircuitGameScene.panBy(25, 15));
        const aligned = await page.locator('.scan-target').first().evaluate(el => {
          const ring = el.querySelector('.scan-ring-outer').getBoundingClientRect();
          const hit = el.querySelector('.hitzone').getBoundingClientRect();
          return Math.abs(ring.x + ring.width / 2 - hit.x - hit.width / 2) < 1 &&
            Math.abs(ring.y + ring.height / 2 - hit.y - hit.height / 2) < 1;
        });
        assert(aligned, 'Scan rings must follow target zoom and pan');
      }
      assert.deepEqual(errors, []); assert.deepEqual(consoleErrors, []);
      console.log(JSON.stringify(results.map(result => ({ viewport: result.viewport, status: 'Scan and all controls fit; rings follow zoom/pan' })), null, 2));
      return;
    }
    for (const [width, height] of [[1440,900], [1920,1080], [1024,768], [960,600], [950,600], [768,1024], [640,572], [390,844], [320,568], [844,390], [568,320]]) {
      await assertLayout(page, width, height);
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    const total = await page.locator('.hidden-object').count();
    const initial = await stats(page);
    await page.locator('#btn-scan').click();
    await assertScan(page, total);
    assert.equal(await page.locator('#scan-badge').textContent(), '2');
    assert.equal((await stats(page)).score, initial.score);
    assert.equal(await page.locator('.scan-marker').count(), total);
    await page.screenshot({ path: path.join(__dirname, 'scan-hud-desktop.png') });
    await recover(page);
    await assertScan(page, total - 1);
    const first = await stats(page);
    assert.equal(first.score, '100'); assert.equal(first.found, `1/${total}`); assert.equal(first.streak, '1'); assert.equal(first.overclock, '20%');
    await page.waitForTimeout(700);
    await page.keyboard.press('r');
    assert.equal(await page.locator('#scan-badge').textContent(), '1');
    await page.waitForTimeout(2600);
    await assertScan(page, total - 1);
    await page.waitForTimeout(800);
    await assertScan(page, 0);
    assert.equal((await stats(page)).score, '100');
    await page.keyboard.press('h');
    await page.keyboard.press('r');
    await assertScan(page, total - 1);
    assert.equal(await page.locator('#scan-badge').textContent(), '0');
    assert(await page.locator('#btn-scan').isDisabled());
    await recover(page, page.locator('.hidden-object.hint-active'));
    await assertScan(page, total - 2);
    assert.equal(await page.locator('.hidden-object.found.hint-active').count(), 0);
    await page.keyboard.press('r');
    assert.equal(await page.locator('#scan-badge').textContent(), '0');
    await page.waitForTimeout(3300);
    await assertScan(page, 0);
    await page.keyboard.press('p');
    const paused = await stats(page);
    await page.waitForTimeout(1100);
    assert.equal((await stats(page)).timer, paused.timer);
    await page.keyboard.press('r');
    assert.equal(await page.locator('#scan-badge').textContent(), '0');
    await page.keyboard.press('Escape');
    await page.locator('#btn-map').click();
    await page.locator('#overlay-map.active').waitFor();
    await page.keyboard.press('r');
    assert.equal(await page.locator('#scan-badge').textContent(), '0');
    await page.keyboard.press('Escape');
    await page.locator('#btn-restart').click();
    await page.waitForFunction(() => !document.querySelector('.game-shell').inert);
    assert.equal(await page.locator('#scan-badge').textContent(), '3');
    assert.equal((await stats(page)).score, '0');
    await page.keyboard.press('r');
    await page.waitForTimeout(600);
    await page.locator('#btn-restart').click();
    await page.waitForFunction(() => !document.querySelector('.game-shell').inert);
    await assertScan(page, 0);
    await page.keyboard.press('r');
    await page.waitForTimeout(2300);
    await assertScan(page, total);
    await page.waitForTimeout(1000);
    await assertScan(page, 0);
    for (let i = 0; i < total - 1; i++) {
      await recover(page);
      if (i === 4) {
        const fifth = await stats(page);
        assert.equal(fifth.score, '740');
        assert.equal(fifth.streak, '5');
        assert(await page.locator('#hud-overclock-box').evaluate(el => el.classList.contains('active')));
      }
    }
    await page.keyboard.press('r');
    await assertScan(page, 1);
    await recover(page);
    await assertScan(page, 0);
    assert(!(await page.locator('#scene-wrap').evaluate(el => el.classList.contains('scan-active'))));
    assert(await page.locator('#btn-scan').isDisabled());
    const finalCharges = await page.locator('#scan-badge').textContent();
    const completed = await stats(page);
    await page.keyboard.press('r');
    assert.equal(await page.locator('#scan-badge').textContent(), finalCharges);
    assert.equal((await stats(page)).score, completed.score);
    await page.locator('#overlay-complete.active').waitFor();
    assert.equal(await page.locator('#cs-found').textContent(), `${total}/${total}`);
    await page.locator('#btn-next-level').click();
    await page.locator('#overlay-puzzle.active').waitFor();
    assert.deepEqual(errors, [], 'Unexpected JavaScript errors');
    assert.deepEqual(consoleErrors, [], 'Unexpected browser console errors');
    results.push({ scan: '3D, keyboard, collection, repeat, charges, hint coexistence, pause/map, restart, completion, puzzle entry', errors });
    await page.close();

    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
    const fallbackErrors = [];
    mobile.on('pageerror', error => fallbackErrors.push(error.message));
    await mobile.addInitScript(() => {
      const getContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...args) {
        return /^webgl/.test(type) ? null : getContext.call(this, type, ...args);
      };
    });
    await startGame(mobile, true);
    assert(!(await mobile.locator('#scene-wrap').evaluate(el => el.classList.contains('has-3d-scene'))));
    await mobile.locator('#btn-scan').tap();
    await assertScan(mobile, total);
    assert.equal(await mobile.locator('.scan-target .scan-ring-outer').first().evaluate(el => getComputedStyle(el).animationName), 'none');
    await mobile.screenshot({ path: path.join(__dirname, 'scan-hud-mobile-fallback.png') });
    await mobile.locator('.hidden-object .hitzone').first().tap({ force: true });
    await assertScan(mobile, total - 1);
    assert.equal((await stats(mobile)).score, '100');
    await assertLayout(mobile, 320, 568);
    await mobile.screenshot({ path: path.join(__dirname, 'scan-hud-narrow-fallback.png') });
    assert.deepEqual(fallbackErrors, []);
    results.push({ fallback: 'SVG, touch collection, reduced motion, narrow HUD', errors: fallbackErrors });
    console.log(JSON.stringify(results, null, 2));
  } catch (error) {
    const failedPage = browser.contexts().flatMap(context => context.pages())[0];
    if (failedPage) {
      await failedPage.screenshot({ path: path.join(__dirname, 'scan-hud-failure.png') });
      console.error(await failedPage.evaluate(() => ({
        screens: [...document.querySelectorAll('.screen.active,.overlay.active')].map(el => el.id),
        intro: typeof window.CircuitIntro,
        scripts: [...document.scripts].filter(el => el.src).map(el => el.src)
      })));
    }
    throw error;
  } finally { await browser.close(); }
})().catch(error => { console.error(JSON.stringify(results)); console.error(error); process.exitCode = 1; });
