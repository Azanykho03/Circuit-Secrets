const { chromium } = require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.locator('#btn-start').click();
  await page.waitForFunction(() => document.querySelector('#screen-prologue').classList.contains('has-game-scene'));
  const soundBefore = await page.locator('#btn-intro-sound').getAttribute('aria-pressed');
  await page.locator('#btn-intro-sound').click();
  const soundAfter = await page.locator('#btn-intro-sound').getAttribute('aria-pressed');
  await page.locator('#btn-intro-menu').click();
  const menuItems = await page.locator('#intro-menu button').count();
  await page.locator('#screen-prologue').screenshot({ path: 'tmp/qa-intro-menu.png' });
  await page.locator('#btn-intro-pause').click();
  const paused = await page.locator('#screen-prologue').evaluate(element => element.classList.contains('is-paused'));
  await page.locator('#btn-intro-menu').click();
  await page.locator('#btn-intro-pause').click();
  const resumed = await page.locator('#screen-prologue').evaluate(element => !element.classList.contains('is-paused'));
  const speakers = [];
  for (let shot = 0; shot < 4; shot++) {
    if (shot) await page.locator('#btn-intro-next').click();
    await page.waitForTimeout(220);
    speakers.push(await page.locator('#intro-speaker-name').textContent());
    await page.locator('#screen-prologue').screenshot({ path: `tmp/qa-intro-shot${shot + 1}.png` });
  }
  await page.locator('#btn-intro-menu').click();
  await page.locator('#intro-progress .intro-step').nth(1).click();
  const chapterSpeaker = await page.locator('#intro-speaker-name').textContent();
  await page.locator('#btn-intro-next').click();
  await page.locator('#btn-intro-menu').click();
  await page.locator('#btn-intro-back').click();
  const previousSpeaker = await page.locator('#intro-speaker-name').textContent();
  await page.locator('#btn-intro-menu').click();
  await page.locator('#btn-intro-skip').click();
  const skipWorked = await page.locator('#screen-prologue').evaluate(element => !element.classList.contains('active'));

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('#btn-start').click();
  await page.waitForFunction(() => document.querySelector('#screen-prologue').classList.contains('has-game-scene'));
  for (let shot = 0; shot < 3; shot++) await page.locator('#btn-intro-next').click();
  await page.locator('#btn-intro-next').click();
  const finalContinueWorked = await page.locator('#screen-prologue').evaluate(element => !element.classList.contains('active'));

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('#btn-start').click();
  await page.waitForFunction(() => document.querySelector('#screen-prologue').classList.contains('has-game-scene'));
  await page.locator('#btn-intro-menu').click();
  await page.locator('#btn-intro-home').click();
  const homeWorked = await page.locator('#screen-title').evaluate(element => element.classList.contains('active'));

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#btn-start').click();
  await page.waitForFunction(() => document.querySelector('#screen-prologue').classList.contains('has-game-scene'));
  await page.waitForTimeout(220);
  await page.locator('#screen-prologue').screenshot({ path: 'tmp/qa-intro-mobile.png' });
  await page.locator('#btn-intro-menu').click();
  await page.locator('#screen-prologue').screenshot({ path: 'tmp/qa-intro-mobile-menu.png' });
  const mobile = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
    continueVisible: document.querySelector('#btn-intro-next').getBoundingClientRect().width > 0,
    buildingCanvas: document.querySelector('#intro-scene canvas').getBoundingClientRect().width,
    menuRight: document.querySelector('.prologue-menu-panel').getBoundingClientRect().right
  }));
  console.log(JSON.stringify({ errors, speakers, menuItems, soundChanged: soundBefore !== soundAfter, paused, resumed, chapterSpeaker, previousSpeaker, skipWorked, finalContinueWorked, homeWorked, mobile, canvas: await page.locator('#intro-scene canvas').count() }));
  await browser.close();
})().catch(error => { console.error(error); process.exitCode = 1; });
