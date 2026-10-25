const { chromium } = require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.locator('#btn-start').click();
  await page.waitForFunction(() => document.querySelector('#screen-prologue').classList.contains('active'));
  await page.waitForTimeout(100);
  const opening = await page.evaluate(() => ({
    opacity: Number(getComputedStyle(document.querySelector('#screen-prologue')).opacity),
    duration: getComputedStyle(document.querySelector('#screen-prologue')).transitionDuration,
    storyAnimation: getComputedStyle(document.querySelector('.prologue-caption>[aria-live]')).animationName,
    sceneAnimation: getComputedStyle(document.querySelector('#intro-scene'), '::after').animationName
  }));
  await page.waitForFunction(() => document.querySelector('#screen-prologue').classList.contains('has-game-scene'));
  await page.waitForTimeout(1200);
  const settledOpacity = Number(await page.locator('#screen-prologue').evaluate(element => getComputedStyle(element).opacity));
  await page.locator('#btn-intro-next').click();
  await page.waitForTimeout(80);
  const nextScene = await page.evaluate(() => ({
    screenOpacity: Number(getComputedStyle(document.querySelector('#screen-prologue')).opacity),
    storyAnimation: getComputedStyle(document.querySelector('.prologue-caption>[aria-live]')).animationName,
    sceneAnimation: getComputedStyle(document.querySelector('#intro-scene'), '::after').animationName
  }));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('#btn-start').click();
  await page.waitForFunction(() => document.querySelector('#screen-prologue').classList.contains('active'));
  await page.waitForTimeout(80);
  const reduced = await page.evaluate(() => ({
    duration: getComputedStyle(document.querySelector('#screen-prologue')).transitionDuration,
    storyAnimation: getComputedStyle(document.querySelector('.prologue-caption>[aria-live]')).animationName,
    sceneAnimation: getComputedStyle(document.querySelector('#intro-scene'), '::after').animationName
  }));
  console.log(JSON.stringify({ errors, opening, settledOpacity, nextScene, reduced }));
  await browser.close();
})().catch(error => { console.error(error); process.exitCode = 1; });
