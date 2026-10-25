const {chromium}=require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1,reducedMotion:'reduce'});
  const errors=[];
  const levels=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
  await page.locator('#btn-start').click();
  await page.locator('#btn-intro-skip').click();
  await page.waitForFunction(()=>!document.querySelector('.game-shell').inert);
  await page.waitForTimeout(500);
  for(let level=0;level<10;level++){
    const info=await page.evaluate(()=>{
      const scene=document.querySelector('#scene-svg');
      const targetIds=new Set([...scene.querySelectorAll('.hidden-object')].map(el=>el.dataset.id));
      const props=[...scene.querySelectorAll('.scene-prop')];
      const canvas=document.querySelector('#scene-3d canvas');
      let colorfulPixels=null;
      if(canvas){
        const sample=document.createElement('canvas');sample.width=16;sample.height=9;
        const ctx=sample.getContext('2d');ctx.drawImage(canvas,0,0,16,9);
        const data=ctx.getImageData(0,0,16,9).data;
        colorfulPixels=0;
        for(let i=0;i<data.length;i+=4) if(data[i]+data[i+1]+data[i+2]>100) colorfulPixels++;
      }
      return {room:document.querySelector('#hud-level').textContent,targets:targetIds.size,decoys:props.length,duplicates:props.filter(el=>targetIds.has(el.dataset.icon)).length,projected:document.querySelector('#scene-wrap').classList.contains('has-3d-scene'),colorfulPixels};
    });
    levels.push(info);
    if(level===0){
      await page.locator('#scene-wrap').screenshot({path:'tmp/qa-decoys-room1.png'});
      await page.setViewportSize({width:390,height:844});
      await page.waitForTimeout(250);
      await page.locator('#scene-wrap').screenshot({path:'tmp/qa-decoys-room1-mobile.png'});
      await page.setViewportSize({width:1440,height:900});
    }
    if(level===4) await page.locator('#scene-wrap').screenshot({path:'tmp/qa-decoys-room5.png'});
    if(level===9) await page.locator('#scene-wrap').screenshot({path:'tmp/qa-decoys-room10.png'});
    await page.evaluate(()=>{
      [...document.querySelectorAll('.hidden-object:not(.found)')].forEach(el=>el.dispatchEvent(new MouseEvent('click',{bubbles:true})));
    });
    await page.locator('#overlay-complete.active').waitFor({timeout:15000});
    if(level===9) break;
    await page.locator('#btn-next-level').click();
    await page.locator('#overlay-puzzle.active').waitFor();
    await page.locator('#btn-puzzle-skip').click();
    await page.locator('#overlay-map.active').waitFor({timeout:15000});
    await page.locator('#btn-map-travel').click();
    await page.locator('#overlay-story.active').waitFor();
    await page.locator('#btn-story-continue').click();
    await page.waitForFunction(()=>!document.querySelector('.game-shell').inert);
  }
  console.log(JSON.stringify({levels,errors}));
  await browser.close();
})().catch(error=>{console.error(error);process.exitCode=1;});
