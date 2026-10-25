const {chromium}=require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(1100);
  const canvasBrightness=async()=>{
    const shot=await page.locator('#home-3d canvas').screenshot();
    return page.evaluate(async base64=>{
      const img=new Image();img.src=`data:image/png;base64,${base64}`;await img.decode();
      const sample=document.createElement('canvas');sample.width=img.width;sample.height=img.height;
      const context=sample.getContext('2d');context.drawImage(img,0,0);
      const pixels=context.getImageData(0,0,img.width,img.height).data;
      let sum=0,count=0;
      for(let y=60;y<img.height-60;y+=12) for(let x=img.width*.32;x<img.width*.9;x+=12){
        const index=(y*img.width+Math.floor(x))*4;
        sum+=(pixels[index]+pixels[index+1]+pixels[index+2])/3;count++;
      }
      return Math.round(sum/count);
    },shot.toString('base64'));
  };
  const offBrightness=await canvasBrightness();
  await page.screenshot({path:'tmp/qa-home-off.png'});
  await page.locator('#desk-power').click();
  await page.waitForTimeout(1400);
  const onBrightness=await canvasBrightness();
  await page.screenshot({path:'tmp/qa-home-on.png'});
  const panelBefore=await page.locator('#home-inspection-panel').isHidden();
  const canvas=page.locator('#home-3d canvas');
  const bounds=await canvas.boundingBox();
  let hoverHit=null;
  for(const y of [.38,.42,.46,.5,.54,.58]){
    for(const x of [.3,.4,.5,.6,.7]){
      await page.mouse.move(bounds.x+bounds.width*x,bounds.y+bounds.height*y);
      const label=await page.locator('#home-inspection-label').textContent();
      if(label){hoverHit={x,y,label};break;}
    }
    if(hoverHit) break;
  }
  if(hoverHit) await page.mouse.click(bounds.x+bounds.width*hoverHit.x,bounds.y+bounds.height*hoverHit.y);
  await page.waitForTimeout(250);
  const panelAfter=await page.locator('#home-inspection-panel').isVisible();
  if(panelAfter){await page.locator('#btn-home-inspection-focus').click();await page.waitForTimeout(950);}
  await page.screenshot({path:'tmp/qa-home-inspection.png'});
  await page.setViewportSize({width:390,height:844});
  await page.waitForTimeout(300);
  await page.locator('#desk-reset').click();
  await page.waitForTimeout(300);
  await page.screenshot({path:'tmp/qa-home-mobile-on.png'});
  const resetClosedPanel=await page.locator('#home-inspection-panel').isHidden();
  await page.locator('#desk-power').click();
  await page.waitForTimeout(1400);
  const offAgainBrightness=await canvasBrightness();
  console.log(JSON.stringify({webgl:await page.locator('#home-3d').evaluate(el=>el.classList.contains('has-webgl')),offBrightness,onBrightness,offAgainBrightness,panelBefore,hoverHit,panelAfter,resetClosedPanel,errors}));
  await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1;});
