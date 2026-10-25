(function(){
'use strict';

const viewport=document.querySelector('#map-rooms');
const stage=document.querySelector('#map-stage');
if(!viewport || !stage) return;

const zoomIn=document.querySelector('#btn-map-zoom-in');
const zoomOut=document.querySelector('#btn-map-zoom-out');
const resetButton=document.querySelector('#btn-map-zoom-reset');
const readout=document.querySelector('#map-zoom-level');
zoomIn.innerHTML=window.CircuitIcons.markup('zoomIn');
zoomOut.innerHTML=window.CircuitIcons.markup('zoomOut');
resetButton.innerHTML=window.CircuitIcons.markup('reset');

const MIN_ZOOM=1;
const MAX_ZOOM=3;
const pointers=new Map();
let zoom=1,panX=0,panY=0,pinch=null;

function clamp(value,min,max){ return Math.min(max,Math.max(min,value)); }
function render(){
  const maxX=(zoom-1)*viewport.clientWidth/2;
  const maxY=(zoom-1)*viewport.clientHeight/2;
  panX=clamp(panX,-maxX,maxX);
  panY=clamp(panY,-maxY,maxY);
  stage.style.transform=`translate(${panX}px,${panY}px) scale(${zoom})`;
  stage.style.setProperty('--pin-scale',String(1/zoom));
  stage.style.setProperty('--pin-hover-scale',String(1.07/zoom));
  readout.textContent=`${Math.round(zoom*100)}%`;
  zoomOut.disabled=zoom<=MIN_ZOOM+.01;
  zoomIn.disabled=zoom>=MAX_ZOOM-.01;
  resetButton.disabled=zoom<=MIN_ZOOM+.01 && !panX && !panY;
}
function zoomAt(next,clientX,clientY){
  next=clamp(next,MIN_ZOOM,MAX_ZOOM);
  if(Math.abs(next-zoom)<.001) return;
  const rect=viewport.getBoundingClientRect();
  const x=clientX-rect.left-rect.width/2;
  const y=clientY-rect.top-rect.height/2;
  const worldX=(x-panX)/zoom;
  const worldY=(y-panY)/zoom;
  panX=x-worldX*next;
  panY=y-worldY*next;
  zoom=next;
  render();
}
function zoomCenter(multiplier){
  const rect=viewport.getBoundingClientRect();
  zoomAt(zoom*multiplier,rect.left+rect.width/2,rect.top+rect.height/2);
}
function reset(){ zoom=1;panX=0;panY=0;render(); }
function pinchFrame(){
  const [a,b]=[...pointers.values()];
  return { distance:Math.hypot(a.x-b.x,a.y-b.y),x:(a.x+b.x)/2,y:(a.y+b.y)/2 };
}

zoomIn.addEventListener('click',()=>zoomCenter(1.35));
zoomOut.addEventListener('click',()=>zoomCenter(1/1.35));
resetButton.addEventListener('click',reset);
viewport.addEventListener('wheel',event=>{
  if(event.target.closest('.map-zoom-controls')) return;
  event.preventDefault();
  zoomAt(zoom*(event.deltaY<0?1.18:1/1.18),event.clientX,event.clientY);
},{passive:false});
viewport.addEventListener('dblclick',event=>{
  if(event.target.closest('.map-zoom-controls')) return;
  event.preventDefault();
  zoomAt(zoom*1.4,event.clientX,event.clientY);
});
viewport.addEventListener('pointerdown',event=>{
  if(event.target.closest('button')) return;
  viewport.setPointerCapture(event.pointerId);
  pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
  if(pointers.size===2) pinch=pinchFrame();
  viewport.classList.add('is-dragging');
});
viewport.addEventListener('pointermove',event=>{
  const previous=pointers.get(event.pointerId);
  if(!previous) return;
  pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
  if(pointers.size>=2){
    const next=pinchFrame();
    if(pinch && pinch.distance>0){
      zoomAt(zoom*next.distance/pinch.distance,next.x,next.y);
      panX+=next.x-pinch.x;
      panY+=next.y-pinch.y;
      render();
    }
    pinch=next;
  }else if(zoom>1){
    panX+=event.clientX-previous.x;
    panY+=event.clientY-previous.y;
    render();
  }
});
function release(event){
  pointers.delete(event.pointerId);
  pinch=pointers.size===2?pinchFrame():null;
  if(!pointers.size) viewport.classList.remove('is-dragging');
}
viewport.addEventListener('pointerup',release);
viewport.addEventListener('pointercancel',release);
new ResizeObserver(render).observe(viewport);
render();

window.CircuitMapView={reset};
})();
