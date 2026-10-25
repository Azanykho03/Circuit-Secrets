const { chromium } = require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.locator('#btn-start').click();
  await page.locator('#btn-intro-skip').click();
  await page.locator('#overlay-story.active').waitFor();
  await page.locator('#btn-story-continue').click();
  await page.waitForFunction(() => !document.querySelector('.game-shell').inert);
  await page.waitForFunction(() => document.querySelector('#scene-wrap').classList.contains('has-3d-scene'));
  await page.waitForTimeout(350);
  await page.locator('#scene-wrap').screenshot({ path: 'tmp/qa-render-room1.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(400);
  await page.locator('#scene-wrap').screenshot({ path: 'tmp/qa-render-room1-mobile.png' });
  const details = await page.evaluate(() => ({
    three: Boolean(document.querySelector('#scene-3d canvas')),
    sceneReady: document.querySelector('#scene-wrap').classList.contains('has-3d-scene'),
    targetCount: document.querySelectorAll('.hidden-object').length,
    decoyCount: document.querySelectorAll('.scene-prop').length,
    viewport: document.querySelector('#scene-wrap').getBoundingClientRect().toJSON()
  }));
  await page.setViewportSize({ width: 1440, height: 900 });
  const clickPoint = await page.locator('.hidden-object').first().evaluate(el => {
    const rect = el.querySelector('.hitzone').getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  });
  const raycastId = await page.evaluate(point => window.CircuitGameScene.hitTest(point.x, point.y)?.dataset.id, clickPoint);
  await page.mouse.click(clickPoint.x, clickPoint.y);
  const foundAfterClick = await page.locator('.hidden-object.found').count();
  await page.locator('#btn-map').click();
  await page.locator('#overlay-map.active').waitFor();
  await page.waitForFunction(() => document.querySelector('#map-stage').classList.contains('has-3d-map'));
  await page.locator('#map-rooms').screenshot({ path: 'tmp/qa-render-map.png' });
  await page.locator('#btn-map-zoom-in').click();
  const zoom = await page.locator('#map-zoom-level').textContent();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  await page.locator('#map-rooms').screenshot({ path: 'tmp/qa-render-map-mobile.png' });
  const mapDetails = await page.evaluate(() => ({
    three: Boolean(document.querySelector('#map-scene-3d canvas')),
    ready: document.querySelector('#map-stage').classList.contains('has-3d-map'),
    locationCount: document.querySelectorAll('.map-room').length,
    selected: document.querySelector('.map-room.is-selected')?.textContent
  }));
  console.log(JSON.stringify({ details, raycastId, foundAfterClick, mapDetails, zoom, errors }));
  await browser.close();
})().catch(error => { console.error(error); process.exitCode = 1; });
