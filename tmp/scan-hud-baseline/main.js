/* ==================================================================
   CIRCUIT SECRETS: COMPLAB 2 — main.js
   Game state, rendering, input handling, and flow control.
   Depends on ICONS / LEVELS / helper drawing fns from assets.js,
   which must be loaded first.
   ================================================================== */
(function(){
'use strict';

/* ---------------- small DOM / format helpers ---------------- */
const $ = (sel,root=document)=>root.querySelector(sel);
const $all = (sel,root=document)=>Array.from(root.querySelectorAll(sel));
const pick=(arr)=>arr[Math.floor(Math.random()*arr.length)];
function fmtTime(sec){
  sec=Math.max(0,Math.ceil(sec));
  const m=Math.floor(sec/60), s=sec%60;
  return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
}

/* ============================================================
   GAME STATE
   ============================================================ */
const state = {
  levelIndex:0,
  levelScore:0,
  totalScore:0,
  timeLeft:0,
  timerId:null,
  hintsLeft:0,
  scanCharges:0,
  hintsUsedThisLevel:0,
  hintsUsedTotal:0,
  streak:0,
  found:new Set(),
  paused:false,
  soundOn:true,
  audioCtx:null,
  musicTimer:null,
  musicStep:0,
  musicMode:'home',
  musicBus:null,
  toneSerial:0,
  mistakes:0,
  levelMistakes:0,
  overclockUntil:0,
  bestScore:0,
  roomsCleared:0,
  evidence:[],
  pendingLevelIndex:0,
  slideTiles:[],
  slideMoves:0,
  lockDigits:[0,0,0,0],
  puzzleResolving:false,
  phase:'home',
  unlockedLevel:0,
  solvedPuzzles:new Set(),
  skippedPuzzles:new Set(),
  puzzleLevel:-1,
  slideInitial:[],
  mapSelection:0,
  mapReturn:'search',
  storyTimer:null,
  statusTimer:null,
  storyFullText:'',
  effects:new Set(),
  flightId:0,
  rewardFrame:null
};

const PUZZLES = [
  {
    type:'slide', evidence:'Lab 2 Shutdown Trace',
    kicker:'HARDWARE BAY // EVIDENCE LOCK 01', title:'Restore the Shutdown Trace',
    prompt:'Fiona recovered fragments of the workstation shutdown trace. Slide the numbered signal tiles into order, with the empty socket last, to reveal the route to the server.'
  },
  {
    type:'cipher', evidence:'CS-TRAIN Server Log',
    kicker:'SERVER ROOM // EVIDENCE LOCK 02', title:'Decode the Server Note',
    prompt:'The snapshot destination is encoded as “GSV XLIV”. Use a mirror alphabet: A swaps with Z, B with Y, and so on. Decode the destination.',
    answer:'THECORE'
  },
  {
    type:'lock', evidence:'Class File Snapshot',
    kicker:'QUANTUM CORE // EVIDENCE LOCK 03', title:'Open the Snapshot Vault',
    prompt:'The snapshot lock uses the number of Fiona\'s classroom: Computer Lab 2. Enter the room number as four digits with leading zeros.',
    answer:'0002'
  },
  {
    type:'cipher', evidence:'Signal Vault Command Trace',
    kicker:'SIGNAL VAULT // EVIDENCE LOCK 04', title:'Trace the Bench Location',
    prompt:'The scheduled command points to “UZY WVXP”. Use the same mirror alphabet to decode the workshop location.',
    answer:'FABDECK'
  },
  {
    type:'cipher', evidence:'Staged Component Schematic',
    kicker:'FABRICATION DECK // EVIDENCE LOCK 05', title:'Trace the Parts Checkout',
    prompt:'An inventory mark on the schematic reads “VHW ZIXSREV”. Decode it to find where the missing class components were stored.',
    answer:'ESDARCHIVE'
  },
  {
    type:'lock', evidence:'CS-TRAIN Parts Checkout',
    kicker:'ESD ARCHIVE // EVIDENCE LOCK 06', title:'Unlock the Test Reservation',
    prompt:'The archive terminal asks for the four-digit time of the Lab 2 shutdown. The log records 09:18 AM. Enter it as HHMM.',
    answer:'0918'
  },
  {
    type:'slide', evidence:'Robotics Relay Test',
    kicker:'ROBOTICS LAB // EVIDENCE LOCK 07', title:'Rebuild the Relay Sequence',
    prompt:'The safe test rig recorded the protocol trigger across a relay grid. Slide the numbered fragments into order, with the empty socket last, to trace it to Power Systems.'
  },
  {
    type:'lock', evidence:'Protected Power Sequence',
    kicker:'POWER SYSTEMS // EVIDENCE LOCK 08', title:'Open the Meter Archive',
    prompt:'The training relay is tagged 12V / 05A. Enter voltage then current as a four-digit access code.',
    answer:'1205'
  },
  {
    type:'cipher', evidence:'Protocol Source Code',
    kicker:'FIRMWARE STUDIO // EVIDENCE LOCK 09', title:'Decode the Handoff',
    prompt:'The protocol build sends its audit trail to “WVNL”. Use the mirror alphabet to decode the final location.',
    answer:'DEMO'
  },
  {
    type:'cipher', evidence:'Circuit Secrets Audit Record',
    kicker:'DEMO THEATER // CASE FILE 10', title:'Expose the Control Mode',
    prompt:'The final control string reads “GVHGNLWV”. Decode it with the mirror alphabet to reveal what the protocol really was.',
    answer:'TESTMODE'
  }
];
const MAP_PINS=[[23,21],[74,21],[23,48],[80,54],[23,76],[50,12],[50,31],[50,51],[50,73],[84,75]];

function renderRouteProgress(container,current){
  container.replaceChildren();
  MAP_PINS.forEach((_,index)=>{
    const step=document.createElement('span');
    step.className=index<current?'is-complete':index===current?'is-current':'';
    container.appendChild(step);
  });
}

function updatePuzzleActivity(count){
  $all('#puzzle-activity-bars span').forEach((bar,index)=>bar.classList.toggle('is-active',index<count));
}

const CASE_FILE_KEY = 'circuit-secrets-case-file-v1';
function loadCaseFile(){
  try{
    const saved=JSON.parse(localStorage.getItem(CASE_FILE_KEY)||'{}');
    state.bestScore=Number(saved.bestScore)||0;
    state.roomsCleared=Number(saved.roomsCleared)||0;
  }catch(e){ /* Private browsing or blocked storage: play normally. */ }
  renderCaseFile();
}
function saveCaseFile(){
  try{ localStorage.setItem(CASE_FILE_KEY, JSON.stringify({bestScore:state.bestScore, roomsCleared:state.roomsCleared})); }catch(e){}
  renderCaseFile();
}
function renderCaseFile(){
  const text=$('#case-file-text');
  if(state.bestScore){
    if(text) text.textContent=`BEST SIGNAL ${state.bestScore.toLocaleString()} PTS // ${state.roomsCleared} ROOM${state.roomsCleared===1?'':'S'} CLEARED`;
  }else{
    if(text) text.textContent='NO PRIOR SIGNAL RECOVERED';
  }
}

/* ============================================================
   AUDIO
   ============================================================ */
function ensureAudio(){
  if(!state.audioCtx){
    try{ state.audioCtx = new (window.AudioContext||window.webkitAudioContext)(); }
    catch(e){ state.audioCtx=null; }
  }
  if(state.audioCtx && state.audioCtx.state==='suspended'){
    state.audioCtx.resume().catch(()=>{});
  }
  return state.audioCtx;
}
const MUSIC_MODES={
  home:{interval:640,volume:.34,lead:[293.66,349.23,440,523.25,440,349.23,293.66,220]},
  intro:{interval:430,volume:.52,lead:[293.66,349.23,392,440,523.25,587.33,523.25,440]},
  story:{interval:540,volume:.42,lead:[293.66,440,392,349.23,440,523.25,392,349.23]},
  game:{interval:310,volume:.56,lead:[587.33,523.25,440,392,440,523.25,587.33,440]},
  pause:{interval:760,volume:.2,lead:[293.66,220,261.63,220,293.66,220,261.63,220]},
  puzzle:{interval:420,volume:.4,lead:[293.66,349.23,440,466.16,523.25,466.16,440,349.23]},
  report:{interval:390,volume:.5,lead:[293.66,349.23,440,587.33,698.46,587.33,523.25,440]},
  timeup:{interval:440,volume:.44,lead:[293.66,261.63,220,196,220,261.63,233.08,196]}
};
const MUSIC_CHORDS=[
  [146.83,174.61,220],
  [116.54,146.83,174.61],
  [130.81,164.81,196],
  [110,138.59,164.81]
];
function musicModeForPhase(){
  if(state.phase==='home') return 'home';
  if(state.phase==='prologue') return 'intro';
  if(state.phase==='story') return 'story';
  if(state.phase==='puzzle') return 'puzzle';
  if(state.phase==='pause'||state.phase==='map'||state.phase==='journal') return 'pause';
  if(state.phase==='report'||state.phase==='win') return 'report';
  if(state.phase==='timeup') return 'timeup';
  return 'game';
}
function musicVoice(freq,{peak=.03,attack=.025,duration=.24,type='triangle',cutoff=1800,endFreq=null}={}){
  const ctx=state.audioCtx, bus=state.musicBus;
  if(!ctx||!bus||!state.soundOn) return;
  const now=ctx.currentTime;
  const oscillator=ctx.createOscillator();
  const filter=ctx.createBiquadFilter();
  const envelope=ctx.createGain();
  oscillator.type=type;
  oscillator.frequency.setValueAtTime(freq,now);
  if(endFreq) oscillator.frequency.exponentialRampToValueAtTime(endFreq,now+Math.min(duration*.7,.22));
  filter.type='lowpass';
  filter.frequency.setValueAtTime(cutoff,now);
  filter.Q.setValueAtTime(.65,now);
  envelope.gain.setValueAtTime(.0001,now);
  envelope.gain.exponentialRampToValueAtTime(peak,now+attack);
  envelope.gain.exponentialRampToValueAtTime(.0001,now+duration);
  oscillator.connect(filter); filter.connect(envelope); envelope.connect(bus);
  oscillator.onended=()=>{ oscillator.disconnect(); filter.disconnect(); envelope.disconnect(); };
  oscillator.start(now); oscillator.stop(now+duration+.03);
}
function playMusicStep(){
  if(!state.soundOn||!state.audioCtx||!state.musicBus) return;
  const mode=state.musicMode;
  const step=state.musicStep++;
  const preset=MUSIC_MODES[mode]||MUSIC_MODES.home;
  const driving=mode==='game'||mode==='intro'||mode==='report'||mode==='timeup';
  if(step%8===0){
    const chord=MUSIC_CHORDS[Math.floor(step/8)%MUSIC_CHORDS.length];
    chord.forEach((note,index)=>musicVoice(note,{peak:mode==='home'?.012:.015,attack:.38,duration:3.7,type:'sawtooth',cutoff:mode==='home'?680:920}));
  }
  const sparse=mode==='home'||mode==='pause';
  if(!sparse||step%2===0){
    musicVoice(preset.lead[step%preset.lead.length],{
      peak:mode==='game'?.037:mode==='pause'?.018:.028,
      attack:mode==='home'?.08:.025,
      duration:mode==='home'?.42:.2,
      type:'triangle',cutoff:mode==='game'?2200:1700
    });
  }
  if(driving&&step%4===0){
    const bass=[73.42,58.27,65.41,55][Math.floor(step/8)%4];
    musicVoice(bass,{peak:mode==='game'?.062:.045,attack:.018,duration:.3,type:'sine',cutoff:190,endFreq:bass*.72});
    musicVoice(1180,{peak:.009,attack:.004,duration:.045,type:'sine',cutoff:2600});
  }
  if(mode==='game'&&step%2===1){
    musicVoice(760,{peak:.008,attack:.003,duration:.035,type:'triangle',cutoff:2100});
  }
}
function stopMusic(){
  if(state.musicTimer){
    clearInterval(state.musicTimer);
    state.musicTimer=null;
  }
  if(state.musicBus&&state.audioCtx){
    const now=state.audioCtx.currentTime;
    state.musicBus.gain.cancelScheduledValues(now);
    state.musicBus.gain.setTargetAtTime(0,now,.045);
  }
}
function startMusic(mode=state.musicMode){
  const changed=state.musicMode!==mode;
  if(changed){
    if(state.musicTimer) clearInterval(state.musicTimer);
    state.musicTimer=null;
    state.musicStep=0;
  }
  state.musicMode=mode;
  if(!state.soundOn) return;
  const ctx=ensureAudio();
  if(!ctx) return;
  if(ctx.state!=='running'){
    ctx.resume().then(()=>{ if(state.soundOn) startMusic(state.musicMode); }).catch(()=>{});
    return;
  }
  if(!state.musicBus){
    state.musicBus=ctx.createGain();
    state.musicBus.gain.value=0;
    state.musicBus.connect(ctx.destination);
  }
  const preset=MUSIC_MODES[mode]||MUSIC_MODES.home;
  const now=ctx.currentTime;
  state.musicBus.gain.cancelScheduledValues(now);
  state.musicBus.gain.setTargetAtTime(preset.volume,now,.24);
  if(!state.musicTimer){
    playMusicStep();
    state.musicTimer=setInterval(playMusicStep,preset.interval);
  }
}
function playTone(type){
  if(!state.soundOn) return;
  state.toneSerial++;
  const ctx=ensureAudio();
  if(!ctx) return;
  const now=ctx.currentTime;
  const o=ctx.createOscillator();
  const g=ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  let freq=440, dur=0.12, wave='sine', peak=0.16;
  if(type==='success'){ freq=880; dur=0.14; wave='triangle'; }
  else if(type==='error'){ freq=150; dur=0.18; wave='sawtooth'; }
  else if(type==='complete'){ freq=660; dur=0.55; wave='sine'; }
  else if(type==='hint'){ freq=520; dur=0.12; wave='sine'; }
  else if(type==='ui'){ freq=680; dur=0.075; wave='sine'; peak=0.035; }
  o.type=wave;
  o.frequency.setValueAtTime(freq, now);
  if(type==='ui') o.frequency.linearRampToValueAtTime(820,now+0.05);
  if(type==='complete'){ o.frequency.linearRampToValueAtTime(freq*1.6, now+0.42); }
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(peak, now+0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, now+dur);
  o.start(now); o.stop(now+dur+0.03);
}
function playRewardFanfare(){
  if(!state.soundOn) return;
  const ctx=ensureAudio();
  if(!ctx) return;
  state.toneSerial++;
  const now=ctx.currentTime;
  [[523.25,0,.16],[659.25,.13,.16],[783.99,.26,.18],[1046.5,.42,.42]].forEach(([frequency,delay,duration],index)=>{
    const oscillator=ctx.createOscillator();
    const gain=ctx.createGain();
    oscillator.type=index===3?'sine':'triangle';
    oscillator.frequency.value=frequency;
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(.0001,now+delay);
    gain.gain.exponentialRampToValueAtTime(index===3?.075:.055,now+delay+.025);
    gain.gain.exponentialRampToValueAtTime(.0001,now+delay+duration);
    oscillator.start(now+delay);
    oscillator.stop(now+delay+duration+.02);
  });
}

/* ============================================================
   SCREEN / OVERLAY HELPERS
   ============================================================ */
function showScreen(id){
  $all('.screen').forEach(s=>{ s.classList.remove('active'); s.inert=s.id!==id; });
  $('#'+id).classList.add('active');
}
let overlayFocus=null;
const reducedMotion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function later(callback,delay){
  const timer=setTimeout(()=>{ state.effects.delete(timer); callback(); },delay);
  state.effects.add(timer);
  return timer;
}
function clearEffects(){
  state.effects.forEach(clearTimeout);
  state.effects.clear();
  if(state.rewardFrame) cancelAnimationFrame(state.rewardFrame);
  state.rewardFrame=null;
  clearInterval(state.storyTimer);
  state.storyTimer=null;
  state.statusTimer=null;
  $('#scene-status').textContent='';
  $all('.pickup-flight,.found-toast,.wrong-toast').forEach(el=>el.remove());
  $all('.hud-reward-pop').forEach(el=>el.classList.remove('hud-reward-pop'));
  $('#scene-arrival').classList.remove('active');
  $('#scene-wrap').classList.remove('arriving','scan-active','shake','room-cleared');
}
function canSearch(){
  return state.phase==='search' && !state.paused && !$('.overlay.active');
}
function openOverlay(id){
  if(!$('.overlay.active')) overlayFocus=document.activeElement;
  $all('.overlay').forEach(el=>{
    el.classList.toggle('active',el.id===id);
    el.inert=el.id!==id;
  });
  $all('.screen').forEach(el=>{ el.inert=true; });
  const overlay=$('#'+id);
  const title=$('.overlay-title',overlay);
  if(title){ title.tabIndex=-1; title.focus({preventScroll:true}); }
  overlay.scrollTop=0;
  const card=$('.overlay-card',overlay);
  if(card) card.scrollTop=0;
}
function closeOverlay(id){
  const overlay=$('#'+id);
  if(id==='overlay-complete' && state.rewardFrame){
    cancelAnimationFrame(state.rewardFrame);
    state.rewardFrame=null;
    $('#cs-score').textContent=state.levelScore.toLocaleString();
  }
  overlay.classList.remove('active');
  overlay.inert=true;
  if(!$('.overlay.active')){
    $all('.screen').forEach(el=>{ el.inert=!el.classList.contains('active'); });
    if(overlayFocus?.isConnected && !overlayFocus.closest('[inert]')) overlayFocus.focus({preventScroll:true});
  }
}

/* ============================================================
   RENDERING
   ============================================================ */
const TARGET_BOOST = 1.12;
const DECOR_BOOST = 1.15;
// Search props follow these real bench and shelf surfaces when the 3D room is available.
const SURFACE_ANCHORS = [
  [-5.6,1.82,5.9,'bench'],[-5.2,4.64,-3.2,'shelf'],[5.4,1.82,5.8,'bench'],
  [-5.5,1.82,2.6,'bench'],[-3.6,1.82,6.2,'bench'],[5.1,4.64,-3.2,'shelf'],
  [0.8,1.82,6.5,'bench'],[4.1,1.82,5.0,'bench'],[-1.6,4.64,-3.2,'shelf'],
  [5.8,1.82,2.5,'bench'],[-6.5,1.82,6.7,'bench'],[6.4,4.64,-3.2,'shelf'],
  [-0.8,1.82,5.0,'bench'],[1.7,4.64,-3.2,'shelf'],[-2.3,1.82,3.0,'bench'],
  [2.6,1.82,3.0,'bench'],[-5.8,1.82,4.2,'bench'],[6.0,1.82,4.3,'bench'],
  [-4.4,1.82,4.4,'bench'],[-1.7,1.82,6.4,'bench'],[1.8,1.82,6.4,'bench'],
  [4.8,1.82,4.4,'bench'],[-3.4,4.64,-3.2,'shelf'],[3.4,4.64,-3.2,'shelf'],
  [-2.4,1.82,4.8,'bench'],[2.4,1.82,4.8,'bench']
];
const DECO_SURFACE_ANCHORS = [
  [-6.0,1.82,6.0,'bench'],[-4.4,1.82,6.4,'bench'],[-2.8,1.82,5.8,'bench'],
  [-1.2,1.82,5.8,'bench'],[0.3,1.82,6.0,'bench'],[2.1,1.82,5.9,'bench'],
  [3.7,1.82,6.3,'bench'],[5.3,1.82,6.0,'bench'],[-6.0,4.64,-3.2,'shelf'],
  [-4.4,4.64,-3.2,'shelf'],[-2.6,4.64,-3.2,'shelf'],[-0.5,4.64,-3.2,'shelf'],
  [-6.2,1.82,3.3,'bench'],[-4.8,1.82,3.3,'bench'],[-3.3,1.82,3.8,'bench'],
  [-1.8,1.82,3.8,'bench'],[-0.2,1.82,3.2,'bench'],[1.5,1.82,3.7,'bench'],
  [3.0,1.82,3.3,'bench'],[4.7,1.82,3.7,'bench'],[6.1,1.82,3.4,'bench'],
  [0.6,4.64,-3.2,'shelf'],[2.5,4.64,-3.2,'shelf'],[4.4,4.64,-3.2,'shelf'],
  [5.9,4.64,-3.2,'shelf'],[-5.1,1.82,4.9,'bench'],[-3.9,1.82,4.2,'bench'],
  [-0.7,1.82,4.4,'bench'],[3.2,1.82,4.4,'bench'],[5.7,1.82,4.9,'bench']
];
function makeDecoyProps(lvl,levelIndex){
  const targetIds=new Set(lvl.targets.map(target=>target.id));
  const pool=Object.keys(ICONS).filter(id=>!targetIds.has(id));
  const candidates=[];
  for(const y of [235,335,435,610,690,780]){
    for(const x of [100,220,340,460,580,700,820,940,1060,1180,1300,1420,1540]) candidates.push([x,y]);
  }
  const placed=[];
  const count=Math.min(DECO_SURFACE_ANCHORS.length,10+levelIndex*2);
  for(let index=0;index<count;index++){
    let candidate;
    for(let offset=0;offset<candidates.length;offset++){
      const spot=candidates[(levelIndex*13+index*17+offset)%candidates.length];
      const clearOfTargets=lvl.targets.every(target=>Math.hypot(spot[0]-target.x,spot[1]-target.y)>68);
      const clearOfDecoys=placed.every(prop=>Math.hypot(spot[0]-prop.x,spot[1]-prop.y)>54);
      if(clearOfTargets&&clearOfDecoys){candidate=spot;break;}
    }
    if(!candidate) break;
    const icon=pool[(index+levelIndex*7)%pool.length];
    placed.push({icon,x:candidate[0],y:candidate[1],rot:((index*23+levelIndex*11)%35)-17,
      scale:.78+(index%4)*.045,world:DECO_SURFACE_ANCHORS[index]});
  }
  return placed;
}
function decorMarkup(decor){
  return decor.map(d=>`<g class="deco-item" transform="translate(${d.x},${d.y}) rotate(${d.rot||0}) scale(${(d.scale||1)*DECOR_BOOST})">${ICONS[d.icon]?ICONS[d.icon]():''}</g>`).join('');
}
function decoyMarkup(decoys){
  return decoys.map(d=>{
    const [worldX,worldY,worldZ,surface]=d.world;
    const transform=`translate(${d.x},${d.y}) rotate(${d.rot}) scale(${d.scale})`;
    const art=ICONS[d.icon]();
    return `<g class="scene-prop" aria-hidden="true" data-icon="${d.icon}" data-world="${worldX},${worldY},${worldZ}" data-surface="${surface}" data-rotation="${d.rot}" data-scale="${d.scale}" data-fallback-transform="${transform}" transform="${transform}">
      <ellipse class="prop-contact-shadow" cx="0" cy="3" rx="22" ry="5"></ellipse>
      <g class="surface-art"><g class="prop-extrusion" transform="translate(5 6)">${art}</g><g class="art">${art}</g></g>
    </g>`;
  }).join('');
}
function targetsMarkup(targets,difficultyScale=1){
  return targets.map((t,index)=>{
    const art=ICONS[t.id]?.()||'';
    const [worldX,worldY,worldZ,surface]=SURFACE_ANCHORS[index];
    const renderScale=(t.scale||1)*TARGET_BOOST*difficultyScale;
    return `
      <g class="hidden-object" data-id="${t.id}" data-world="${worldX},${worldY},${worldZ}" data-surface="${surface}" data-rotation="${t.rot||0}" data-scale="${renderScale}" data-fallback-transform="translate(${t.x},${t.y}) rotate(${t.rot||0}) scale(${renderScale})" tabindex="0" role="button" aria-label="${t.label}" transform="translate(${t.x},${t.y}) rotate(${t.rot||0}) scale(${renderScale})">
        <circle class="hint-ring" cx="0" cy="0" r="50"></circle>
        <circle class="found-burst" cx="0" cy="0" r="10"></circle>
        <ellipse class="target-contact-shadow" cx="0" cy="2" rx="24" ry="6"></ellipse>
        <g class="surface-art">
          <g class="target-extrusion" aria-hidden="true" transform="translate(6 8)">${art}</g>
          <g class="art target-art-2d">${art}</g>
        </g>
        <circle class="hitzone" cx="0" cy="0" r="27"></circle>
      </g>`;
  }).join('');
}
function buildScene(lvl){
  const svg = $('#scene-svg');
  // Keep targets behind loose foreground parts and avoid drawing a second copy at the same spot.
  const foreground = lvl.decor.filter(d=>!lvl.targets.some(t=>t.id===d.icon && t.x===d.x && t.y===d.y));
  const background = lvl.buildBg();
  const decoys=makeDecoyProps(lvl,state.levelIndex);
  svg.innerHTML = defsBlock() + `<g class="room-artwork">${background}</g>` + decoyMarkup(decoys) + targetsMarkup(lvl.targets,lvl.difficultyScale) + decorMarkup(foreground);
  $('#scene-3d').dataset.level = lvl.key;
  window.CircuitGameScene?.setLevel(lvl.key);
}
function renderHud(lvl){
  $('#hud-level').textContent = `LEVEL ${state.levelIndex+1} \u2014 ${lvl.name}`;
  $('#scene-label').textContent = lvl.sceneLabel;
  $('#zone-channel').textContent = `CH-${String(state.levelIndex+1).padStart(2,'0')}`;
  updateZoneSignal(lvl);
  $('#hint-badge').textContent = state.hintsLeft;
  $('#btn-hint').disabled = false;
  $('#scan-badge').textContent = state.scanCharges;
  $('#btn-scan').disabled = state.scanCharges<=0;
  $('#hud-timer-box').classList.remove('low');
}
function updateRewardValue(selector,value){
  const element=$(selector);
  const increased=parseInt(value,10)>parseInt(element.textContent,10);
  element.textContent=value;
  if(increased && !reducedMotion()){
    const stat=element.closest('.hud-stat');
    stat.classList.remove('hud-reward-pop');
    void stat.offsetWidth;
    stat.classList.add('hud-reward-pop');
  }
}
function updateHudStats(){
  const lvl = LEVELS[state.levelIndex];
  updateRewardValue('#hud-score',state.levelScore);
  updateRewardValue('#hud-found',`${state.found.size}/${lvl.targets.length}`);
  const inventoryCount=$('#inventory-count');
  if(inventoryCount) inventoryCount.textContent=`${state.found.size}/${lvl.targets.length}`;
  updateRewardValue('#hud-streak',state.streak);
  $('#hud-streak').closest('.hud-stat').classList.toggle('combo-active',state.streak>=3);
  $('#hud-timer').textContent = fmtTime(state.timeLeft);
  $('#hud-timer-box').classList.toggle('low', state.timeLeft<=30);
  $('#progress-fill').style.width = `${(state.found.size/lvl.targets.length)*100}%`;
  const progress=$('#progress-fill').parentElement;
  progress.setAttribute('aria-valuemax',String(lvl.targets.length));
  progress.setAttribute('aria-valuenow',String(state.found.size));
  const remaining=Math.max(0, state.overclockUntil-Date.now());
  const overclock=$('#hud-overclock-box');
  overclock.style.setProperty('--charge',`${remaining ? 100 : Math.min(100,state.streak*20)}%`);
  $('#hud-overclock').textContent=remaining ? `${Math.ceil(remaining/1000)}s` : `${Math.min(100, state.streak*20)}%`;
  overclock.classList.toggle('active', Boolean(remaining));
  overclock.classList.toggle('ready', !remaining && state.streak>=4);
  $('#scene-wrap').classList.toggle('overclock-active', Boolean(remaining));
  updateZoneSignal(lvl);
}
function updateZoneSignal(lvl){
  const signal = Math.round(72 + (state.found.size / lvl.targets.length) * 28);
  $('#zone-signal').textContent = `${signal}%`;
  $('#zone-signal-fill').style.width = `${signal}%`;
}
function renderInventory(lvl){
  const grid = $('#inv-grid');
  grid.innerHTML = lvl.targets.map(t=>`
    <div class="inv-slot" data-id="${t.id}">
      <span class="inv-thumb" aria-hidden="true"><svg class="inv-art" viewBox="-30 -24 60 48" focusable="false">${defsBlock()}${ICONS[t.id]?ICONS[t.id]():''}</svg></span>
      <div class="inv-name">${t.label}</div>
      <div class="inv-check">\u2713</div>
    </div>`).join('');
}
function markInventoryFound(id){
  const el = document.querySelector(`.inv-slot[data-id="${id}"]`);
  if(el){
    el.classList.add('found','just-found');
    later(()=>el.classList.remove('just-found'),900);
  }
}
function renderEvidenceArchive(){
  const archive=$('#evidence-archive');
  if(!archive) return;
  archive.replaceChildren();
  if(state.evidence.length===0){
    const empty=document.createElement('p');
    empty.className='archive-empty';
    empty.textContent='No evidence recovered yet.';
    archive.appendChild(empty);
    return;
  }
  state.evidence.forEach((item,index)=>{
    const row=document.createElement('article');
    row.className='evidence-item';
    const stamp=document.createElement('span');
    stamp.className='evidence-stamp';
    stamp.textContent=`E-${String(index+1).padStart(2,'0')}`;
    const detail=document.createElement('div');
    const title=document.createElement('h3');
    title.textContent=item.title;
    const room=document.createElement('span');
    room.className='evidence-room';
    room.textContent=item.room;
    const clue=document.createElement('p');
    clue.textContent=item.description;
    detail.append(room,title,clue);
    row.append(stamp,detail);
    archive.appendChild(row);
  });
}
function updateEvidenceBadge(){
  const badge=$('#evidence-badge');
  if(badge) badge.textContent=String(state.evidence.length);
}
function addRoomEvidence(levelIndex){
  if(state.evidence.some(item=>item.levelIndex===levelIndex)) return;
  const level=LEVELS[levelIndex], puzzle=PUZZLES[levelIndex];
  state.evidence.push({levelIndex,room:level.name,title:puzzle.evidence,description:level.clue});
  renderEvidenceArchive();
  updateEvidenceBadge();
}

function renderMap(){
  const list=$('#map-room-hotspots');
  list.replaceChildren();
  LEVELS.forEach((level,index)=>{
    const locked=index>state.unlockedLevel;
    const complete=state.solvedPuzzles.has(index);
    const button=document.createElement('button');
    button.type='button'; button.dataset.level=String(index);
    button.className='map-room';
    button.classList.toggle('is-current',index===state.unlockedLevel);
    button.classList.toggle('is-locked',locked);
    button.classList.toggle('is-complete',complete);
    button.classList.toggle('is-selected',index===state.mapSelection);
    button.disabled=locked;
    button.setAttribute('aria-pressed',String(index===state.mapSelection));
    button.setAttribute('aria-label',`${level.name}, ${locked?'locked':complete?'investigated':index===state.levelIndex?'current location':'unlocked'}`);
    const number=document.createElement('span');
    number.className='map-room-index'; number.textContent=String(index+1).padStart(2,'0');
    const title=document.createElement('span');
    title.className='map-room-name'; title.textContent=level.name;
    const status=document.createElement('span');
    status.className='map-room-status';
    status.textContent=locked?'LOCKED':complete?'CLEARED':state.mapReturn==='search'?'SEARCHING':'NEXT';
    button.append(number,title,status); list.appendChild(button);
  });
  $('#map-progress').textContent=`${state.solvedPuzzles.size} OF ${LEVELS.length} LOCATIONS INVESTIGATED`;
  const route=MAP_PINS.slice(0,state.unlockedLevel+1).map(([x,y],index)=>`${index?'L':'M'}${x} ${y}`).join(' ');
  $('#map-route-line').setAttribute('d',route);
  $('#map-route-shadow').setAttribute('d',route);
  renderRouteProgress($('#map-route-progress'),state.unlockedLevel);
  const selectedLevel=LEVELS[state.mapSelection];
  $('.map-info').dataset.locationState=state.mapSelection>state.unlockedLevel?'locked':state.solvedPuzzles.has(state.mapSelection)?'complete':'current';
  $('#map-location-number').textContent=String(state.mapSelection+1).padStart(2,'0');
  $('#map-selection-title').textContent=selectedLevel.name;
  $('#map-selection-status').textContent=state.mapSelection>state.unlockedLevel?'LOCKED':state.solvedPuzzles.has(state.mapSelection)?'EVIDENCE FILED':state.mapReturn==='search'?'SEARCH IN PROGRESS':'READY TO ENTER';
  $('#map-detail').textContent=state.solvedPuzzles.has(state.mapSelection)?selectedLevel.mapClue:selectedLevel.mapSummary;
  const travel=$('#btn-map-travel');
  travel.disabled=state.mapSelection!==state.unlockedLevel;
  travel.textContent=state.mapSelection!==state.unlockedLevel?'Evidence Archived':state.mapReturn==='search'?'Resume Search':'Enter '+LEVELS[state.mapSelection].name;
  $('#btn-map-close').hidden=state.mapReturn!=='search';
}
function openMap(progressing=false){
  if(!progressing && !canSearch()) return;
  state.mapReturn=progressing?'progression':'search';
  state.mapSelection=state.unlockedLevel;
  state.phase='map'; state.paused=true;
  startMusic('pause');
  window.CircuitMapView?.reset();
  renderMap(); openOverlay('overlay-map');
}
function closeMap(){
  if(state.mapReturn!=='search') return;
  closeOverlay('overlay-map');
  state.phase='search'; state.paused=false;
  startMusic('game');
}
function travelFromMap(){
  if(state.phase!=='map' || state.mapSelection!==state.unlockedLevel) return;
  if(state.mapReturn==='search'){ closeMap(); return; }
  closeOverlay('overlay-map');
  showStoryIntro(state.mapSelection);
}

/* ============================================================
   TOASTS / FEEDBACK
   ============================================================ */
function spawnToast(text, cls, clientX, clientY){
  const wrap = $('#scene-wrap');
  const rect = wrap.getBoundingClientRect();
  const div = document.createElement('div');
  div.className = cls;
  div.textContent = text;
  div.style.left = (clientX-rect.left)+'px';
  div.style.top = (clientY-rect.top)+'px';
  wrap.appendChild(div);
  later(()=>div.remove(), 950);
}
function elementCenterClient(g){
  const r = g.getBoundingClientRect();
  return {clientX:r.left+r.width/2, clientY:r.top+r.height/2};
}
function animatePickup(target,id){
  if(reducedMotion()) return;
  const source=$('.art',target).getBoundingClientRect();
  const slot=$(`.inv-slot[data-id="${id}"]`);
  const dock=$('#inv-grid').getBoundingClientRect();
  const destination=slot.getBoundingClientRect();
  const endX=Math.max(dock.left+24,Math.min(dock.right-24,destination.left+destination.width/2));
  const endY=Math.max(dock.top+12,Math.min(dock.bottom-12,destination.top+destination.height/2));
  const x=source.left+source.width/2-36, y=source.top+source.height/2-36;
  const flight=document.createElement('div');
  flight.className='pickup-flight';
  flight.setAttribute('aria-hidden','true');
  flight.style.left=`${x}px`; flight.style.top=`${y}px`;
  flight.innerHTML=`<svg viewBox="-70 -60 140 120">${defsBlock()}${ICONS[id]()}</svg>`;
  // Each flying SVG owns its paint servers, so scene changes cannot break its materials.
  const prefix=`pickup-${++state.flightId}-`;
  const ids=new Map();
  flight.querySelectorAll('[id]').forEach(el=>{ ids.set(el.id,prefix+el.id); el.id=prefix+el.id; });
  flight.querySelectorAll('*').forEach(el=>{
    Array.from(el.attributes).forEach(attr=>{
      const value=attr.value.replace(/url\(#([^)]+)\)/g,(match,key)=>ids.has(key)?`url(#${ids.get(key)})`:match);
      if(value!==attr.value) el.setAttribute(attr.name,value);
    });
  });
  document.body.appendChild(flight);
  const dx=endX-x-36, dy=endY-y-36;
  const animation=flight.animate([
    {transform:'translate(0,0) scale(.7)',opacity:1},
    {transform:'translate(0,-20px) scale(1.1)',opacity:1,offset:.25},
    {transform:`translate(${dx}px,${dy}px) scale(.25)`,opacity:0}
  ],{duration:720,easing:'cubic-bezier(.22,.75,.3,1)',fill:'forwards'});
  animation.finished.then(()=>flight.remove()).catch(()=>flight.remove());
}

function revealStory(){
  clearInterval(state.storyTimer);
  state.storyTimer=null;
  $('#story-text').textContent=state.storyFullText;
  $('#story-text').removeAttribute('aria-label');
  if(document.activeElement===$('#btn-story-reveal')) $('#btn-story-continue').focus();
  $('#btn-story-reveal').hidden=true;
}

function returnHome(){
  window.CircuitIntro.stop();
  clearInterval(state.timerId);
  clearEffects();
  state.phase='home'; state.paused=true;
  $all('.overlay.active').forEach(el=>closeOverlay(el.id));
  showScreen('screen-title');
  $all('.screen').forEach(el=>{ el.inert=!el.classList.contains('active'); });
  startMusic('home');
  $('#btn-start').focus();
}

/* ============================================================
   CORE GAME FLOW
   ============================================================ */
function startGame(){
  clearInterval(state.timerId);
  clearEffects();
  state.totalScore=0;
  state.hintsUsedTotal=0;
  state.levelIndex=0;
  state.mistakes=0;
  state.evidence=[];
  state.unlockedLevel=0;
  state.solvedPuzzles=new Set();
  state.skippedPuzzles=new Set();
  state.puzzleLevel=-1;
  renderEvidenceArchive();
  updateEvidenceBadge();
  state.phase='prologue'; state.paused=true;
  showScreen('screen-prologue');
  startMusic('intro');
  window.CircuitIntro.play({
    soundOn:state.soundOn,
    toggleSound:()=>{ setSound(!state.soundOn); return state.soundOn; },
    onExit:returnHome,
    onComplete:()=>{
      showScreen('screen-game');
      showStoryIntro(0);
    }
  });
}
function showStoryIntro(idx=state.levelIndex){
  const lvl = LEVELS[idx];
  const [pinX,pinY]=MAP_PINS[idx]||MAP_PINS[0];
  const storyMap=$('.story-map-visual');
  storyMap.style.setProperty('--story-pin-x',`${pinX}%`);
  storyMap.style.setProperty('--story-pin-y',`${pinY}%`);
  $('#story-map-number').textContent=String(idx+1).padStart(2,'0');
  renderRouteProgress($('#story-route-progress'),idx);
  state.phase='story'; state.paused=true;
  startMusic('story');
  state.pendingLevelIndex=idx;
  $('#story-kicker').textContent = lvl.intro.kicker;
  $('#story-title').textContent = lvl.intro.title;
  state.storyFullText=lvl.intro.text;
  clearInterval(state.storyTimer);
  const reserve=document.createElement('span');
  reserve.className='story-reserve'; reserve.textContent=lvl.intro.text;
  reserve.setAttribute('aria-hidden','true');
  const typed=document.createElement('span');
  typed.className='story-typed'; typed.setAttribute('aria-hidden','true');
  $('#story-text').replaceChildren(reserve,typed);
  $('#story-text').setAttribute('aria-label',lvl.intro.text);
  $('#btn-story-reveal').hidden=reducedMotion();
  if(reducedMotion()) revealStory();
  else{
    let cursor=0;
    state.storyTimer=setInterval(()=>{
      cursor+=5;
      typed.textContent=lvl.intro.text.slice(0,cursor);
      if(cursor>=lvl.intro.text.length) revealStory();
    },24);
  }
  $('#btn-story-continue').textContent = lvl.intro.cta;
  openOverlay('overlay-story');
}
function loadLevel(idx){
  clearInterval(state.timerId);
  clearEffects();
  state.levelIndex = idx;
  state.puzzleLevel=-1;
  const lvl = LEVELS[idx];
  state.levelScore = 0;
  state.timeLeft = lvl.time;
  state.hintsLeft = lvl.hints;
  state.scanCharges = 3;
  state.hintsUsedThisLevel = 0;
  state.levelMistakes = 0;
  state.found = new Set();
  state.streak = 0;
  state.overclockUntil=0;
  state.paused = true;
  state.phase='transition';
  startMusic('game');
  renderHud(lvl);
  buildScene(lvl);
  renderInventory(lvl);
  updateHudStats();
  $('#scene-status').textContent='';
  $('#arrival-index').textContent=`INVESTIGATION ${String(idx+1).padStart(2,'0')} / ${String(LEVELS.length).padStart(2,'0')}`;
  $('#arrival-title').textContent=lvl.name;
  $('#scene-arrival').classList.add('active');
  $('#scene-wrap').classList.add('arriving');
  $('.game-shell').inert=true;
  later(()=>{
    $('#scene-arrival').classList.remove('active');
    $('#scene-wrap').classList.remove('arriving');
    $('.game-shell').inert=false;
    state.phase='search'; state.paused=false;
    startTimer();
    $('#btn-map').focus({preventScroll:true});
  },reducedMotion()?0:1100);
}
function startTimer(){
  clearInterval(state.timerId);
  state.timerId = setInterval(()=>{
    if(!canSearch()) return;
    state.timeLeft -= 1;
    if(state.timeLeft<=0){
      state.timeLeft=0;
      updateHudStats();
      clearInterval(state.timerId);
      onTimeUp();
      return;
    }
    updateHudStats();
  },1000);
}
function onSceneClick(e){
  if(!canSearch()) return;
  const g = e.target.closest('.hidden-object');
  if(g){
    if(g.classList.contains('found')) return;
    handleCorrect(g, g.dataset.id, e);
  }else{
    handleWrong(e);
  }
}
function onSceneKeydown(e){
  if(!canSearch()) return;
  if(e.key!=='Enter' && e.key!==' ') return;
  const g = e.target.closest && e.target.closest('.hidden-object');
  if(!g || g.classList.contains('found')) return;
  e.preventDefault();
  const c = elementCenterClient(g);
  handleCorrect(g, g.dataset.id, c);
}
function handleCorrect(targetG,id,ev){
  if(!canSearch() || state.found.has(id)) return;
  animatePickup(targetG,id);
  targetG.classList.remove('scan-target','hint-active');
  targetG.classList.add('found','found-anim');
  targetG.setAttribute('tabindex','-1');
  targetG.setAttribute('aria-disabled','true');
  later(()=>targetG.classList.remove('found-anim'), 650);
  state.found.add(id);
  state.streak += 1;
  if(state.streak===5){
    state.overclockUntil=Date.now()+10000;
    spawnToast('OVERCLOCK ENGAGED // 2x SIGNAL', 'found-toast', ev.clientX, ev.clientY);
    playTone('complete');
  }
  const bonus = Math.min(100, Math.max(0, (state.streak-1)*10));
  const multiplier=Date.now()<state.overclockUntil ? 2 : 1;
  const earned = (100 + bonus)*multiplier;
  state.levelScore += earned;
  spawnToast(`+${earned}${multiplier>1 ? '  OVERCLOCK x2' : bonus ? `  CHAIN x${state.streak}` : ''}`, 'found-toast', ev.clientX, ev.clientY);
  updateHudStats();
  markInventoryFound(id);
  playTone('success');
  const lvl = LEVELS[state.levelIndex];
  $('#scene-status').textContent='Object recovered';
  clearTimeout(state.statusTimer);
  state.effects.delete(state.statusTimer);
  state.statusTimer=later(()=>{ $('#scene-status').textContent=''; state.statusTimer=null; },1800);
  if(state.found.size >= lvl.targets.length){
    state.phase='discovery'; state.paused=true;
    clearInterval(state.timerId);
    $('.game-shell').inert=true;
    $('#scene-wrap').classList.add('room-cleared');
    later(completeLevel,reducedMotion()?0:850);
  }
}
function handleWrong(ev){
  spawnToast('Not that one!', 'wrong-toast', ev.clientX, ev.clientY);
  const wrap = $('#scene-wrap');
  wrap.classList.remove('shake');
  void wrap.offsetWidth;
  wrap.classList.add('shake');
  state.levelScore = Math.max(0, state.levelScore-5);
  state.streak = 0;
  state.overclockUntil=0;
  state.mistakes++;
  state.levelMistakes++;
  state.timeLeft = Math.max(0, state.timeLeft-2);
  updateHudStats();
  playTone('error');
  if(state.timeLeft<=0){
    clearInterval(state.timerId);
    onTimeUp();
  }
}
function scanRemaining(){
  if(!canSearch() || state.scanCharges<=0) return;
  const remaining = document.querySelectorAll('.hidden-object:not(.found)');
  if(!remaining.length) return;
  state.scanCharges--;
  $('#scan-badge').textContent = state.scanCharges;
  $('#btn-scan').disabled = state.scanCharges<=0;
  $('#scene-wrap').classList.add('scan-active');
  remaining.forEach(g=>g.classList.add('scan-target'));
  later(()=>{
    $('#scene-wrap').classList.remove('scan-active');
    remaining.forEach(g=>g.classList.remove('scan-target'));
  }, 3200);
  playTone('hint');
}
function useHint(){
  if(!canSearch() || state.hintsLeft<=0) return;
  const lvl = LEVELS[state.levelIndex];
  const remaining = lvl.targets.filter(t=>!state.found.has(t.id));
  if(remaining.length===0) return;
  const t = pick(remaining);
  const g = document.querySelector(`.hidden-object[data-id="${t.id}"]`);
  if(g){
    g.classList.add('hint-active');
    later(()=>g.classList.remove('hint-active'), 2600);
  }
  state.hintsLeft--; state.hintsUsedThisLevel++; state.hintsUsedTotal++;
  $('#hint-badge').textContent = state.hintsLeft;
  $('#btn-hint').disabled = state.hintsLeft<=0;
  playTone('hint');
}
function renderRewardSparks(){
  const host=$('#cs-sparks');
  host.replaceChildren();
  if(reducedMotion()) return;
  const fragment=document.createDocumentFragment();
  const colors=['#79e8ff','#72efb3','#ffd46a'];
  for(let index=0;index<22;index++){
    const spark=document.createElement('span');
    const angle=(index*137.5)*Math.PI/180;
    const distance=28+(index%5)*14;
    spark.style.setProperty('--spark-origin-x','var(--reward-origin-left)');
    spark.style.setProperty('--spark-origin-y','var(--reward-origin-top)');
    spark.style.setProperty('--spark-x',`${Math.cos(angle)*distance}px`);
    spark.style.setProperty('--spark-y',`${Math.sin(angle)*distance*.7}px`);
    spark.style.setProperty('--spark-turn',`${index%2?-55:55}deg`);
    spark.style.setProperty('--spark-delay',`${.4+(index%6)*.035}s`);
    spark.style.backgroundColor=colors[index%colors.length];
    spark.style.color=colors[index%colors.length];
    fragment.appendChild(spark);
  }
  host.appendChild(fragment);
}
function animateRewardScore(total){
  const score=$('#cs-score');
  if(reducedMotion()){
    score.textContent=total.toLocaleString();
    return;
  }
  score.textContent='0';
  const started=performance.now();
  function step(now){
    if(!$('#overlay-complete').classList.contains('active')) return;
    const progress=Math.min(1,(now-started)/1150);
    score.textContent=Math.round(total*(1-(1-progress)**3)).toLocaleString();
    state.rewardFrame=progress<1?requestAnimationFrame(step):null;
  }
  state.rewardFrame=requestAnimationFrame(step);
}
function completeLevel(){
  state.phase='report'; state.paused=true;
  startMusic('report');
  $('.game-shell').inert=false;
  clearInterval(state.timerId);
  const lvl = LEVELS[state.levelIndex];
  const stars=state.levelMistakes===0 && state.hintsUsedThisLevel===0 ? 3 :
    state.levelMistakes<=2 && state.hintsUsedThisLevel<=1 ? 2 : 1;
  const timeBonus=Math.floor(state.timeLeft/5)*5;
  const precisionBonus=stars===3?300:stars===2?100:0;
  const bonus=timeBonus+precisionBonus;
  state.levelScore+=bonus;
  updateHudStats();
  playRewardFanfare();
  state.totalScore += state.levelScore;
  state.roomsCleared++;
  addRoomEvidence(state.levelIndex);
  $('#cs-room').textContent = `LEVEL ${String(state.levelIndex+1).padStart(2,'0')} // ${lvl.name.toUpperCase()}`;
  $('#cs-emblem-level').textContent=String(state.levelIndex+1).padStart(2,'0');
  $('#cs-rank').textContent = ['','EVIDENCE HUNTER','SIGNAL SPECIALIST','CIRCUIT ACE'][stars];
  $('#cs-performance').textContent = stars===3 ? 'Flawless recovery. Every component, no false reads or hints.' :
    stars===2 ? 'Strong investigation. The room is fully secured.' : 'All components recovered. The case moves forward.';
  $('#cs-stars').setAttribute('aria-label',`${stars} of 3 stars`);
  $all('.reward-star',$('#overlay-complete')).forEach((star,index)=>star.classList.toggle('earned',index<stars));
  $('#cs-score-bonus').textContent=`+${bonus.toLocaleString()} BONUS`;
  $('#cs-time-bonus').textContent=`+${timeBonus.toLocaleString()}`;
  $('#cs-clean-bonus').textContent=`+${precisionBonus.toLocaleString()}`;
  $('#cs-time').textContent = fmtTime(state.timeLeft);
  $('#cs-found').textContent = `${state.found.size}/${lvl.targets.length}`;
  $('#cs-hints').textContent = state.hintsUsedThisLevel;
  $('#cs-clue').textContent = lvl.clue;
  $('#cs-evidence-index').textContent = `E-${String(state.levelIndex+1).padStart(2,'0')}`;
  $('#cs-evidence-title').textContent = PUZZLES[state.levelIndex].evidence;
  $('#cs-evidence-detail').textContent = `Catalogued from ${lvl.name}. Added to the case file.`;
  $('#cs-progress-label').textContent=`${String(state.levelIndex+1).padStart(2,'0')} / ${String(LEVELS.length).padStart(2,'0')} ROOMS`;
  const progress=document.createDocumentFragment();
  LEVELS.forEach((_,index)=>{
    const segment=document.createElement('span');
    if(index<=state.levelIndex) segment.classList.add('complete');
    if(index===state.levelIndex) segment.classList.add('current');
    progress.appendChild(segment);
  });
  $('#cs-progress').replaceChildren(progress);
  $('#btn-next-level').textContent = state.levelIndex===LEVELS.length-1 ? 'Decode Control Mode' : 'Examine Access Panel';
  renderRewardSparks();
  openOverlay('overlay-complete');
  animateRewardScore(state.levelScore);
}
function finishCase(){
  state.phase='win'; state.paused=true;
  startMusic('report');
  $('#win-story').textContent="TEST MODE. The final audit names Engr. Danlag and the lab technician as the creators of the Circuit Secrets Protocol. They built a supervised practical to test how Computer Engineering students investigate hardware, circuits, networks, and code. The alarming error was simulated; the class projects were safely snapshotted, and every missing component was tracked in the engineering wing. Fiona restores the files and returns the parts. What looked like a virus was a deliberate challenge, and she solved it by following evidence instead of guessing.";
  $('#win-score').textContent=state.totalScore;
  $('#win-hints').textContent=state.hintsUsedTotal;
  const flawless=state.mistakes===0;
  const newRecord=state.totalScore>state.bestScore;
  if(newRecord) state.bestScore=state.totalScore;
  saveCaseFile();
  $('#win-debrief').innerHTML=`<b>${newRecord?'NEW CASE RECORD // ':'CASE DEBRIEF // '}</b>${flawless?'CLEAN SWEEP: no false reads logged.':`${state.mistakes} false read${state.mistakes===1?'':'s'} logged.`} ${state.solvedPuzzles.size-state.skippedPuzzles.size} puzzles solved; ${state.skippedPuzzles.size} skipped. ${state.hintsUsedTotal===0?'Sharp fieldwork: no search hints requested.':`${state.hintsUsedTotal} search hints requested.`}`;
  openOverlay('overlay-win');
}
function shuffleSlideTiles(){
  const tiles=[1,2,3,4,5,6,7,8,0];
  let empty=8, previous=-1;
  for(let move=0;move<26+state.levelIndex*4;move++){
    const neighbors=[];
    if(empty>2) neighbors.push(empty-3);
    if(empty<6) neighbors.push(empty+3);
    if(empty%3>0) neighbors.push(empty-1);
    if(empty%3<2) neighbors.push(empty+1);
    const choices=neighbors.filter(index=>index!==previous);
    const next=pick(choices);
    [tiles[empty],tiles[next]]=[tiles[next],tiles[empty]];
    previous=empty;
    empty=next;
  }
  if(tiles.every((tile,index)=>tile===(index===8?0:index+1))){
    [tiles[7],tiles[8]]=[tiles[8],tiles[7]];
  }
  state.slideTiles=tiles;
  state.slideInitial=tiles.slice();
  state.slideMoves=0;
  renderSlidePuzzle();
}
function renderSlidePuzzle(){
  const grid=$('#slide-grid');
  grid.replaceChildren();
  const emptyIndex=state.slideTiles.indexOf(0);
  state.slideTiles.forEach((tile,index)=>{
    if(tile===0){
      const empty=document.createElement('div');
      empty.className='slide-empty';
      empty.setAttribute('aria-label','Empty socket');
      grid.appendChild(empty);
    }else{
      const button=document.createElement('button');
      button.type='button';
      button.className='slide-tile';
      const adjacent=Math.abs(Math.floor(index/3)-Math.floor(emptyIndex/3))+Math.abs(index%3-emptyIndex%3)===1;
      button.classList.toggle('is-movable',adjacent);
      button.dataset.band=String(Math.floor((tile-1)/3));
      button.dataset.index=index;
      button.textContent=String(tile);
      button.setAttribute('aria-label',`Move relay tile ${tile}`);
      grid.appendChild(button);
    }
  });
  $('#slide-move-count').textContent=String(state.slideMoves);
  updatePuzzleActivity(Math.max(1,state.slideTiles.reduce((count,tile,index)=>count+(tile===index+1?1:0),0)));
}
function moveSlideTile(index){
  if(state.phase!=='puzzle' || state.puzzleResolving || !Number.isInteger(index) || index<0 || index>8) return;
  const value=state.slideTiles[index];
  if(!value) return;
  const empty=state.slideTiles.indexOf(0);
  const rowDistance=Math.abs(Math.floor(index/3)-Math.floor(empty/3));
  const colDistance=Math.abs(index%3-empty%3);
  if(rowDistance+colDistance!==1) return;
  const before=$(`.slide-tile[data-index="${index}"]`).getBoundingClientRect();
  [state.slideTiles[empty],state.slideTiles[index]]=[state.slideTiles[index],state.slideTiles[empty]];
  state.slideMoves++;
  renderSlidePuzzle();
  $('#puzzle-status').textContent=`RELAY ACTIVE // MOVE ${String(state.slideMoves).padStart(2,'0')}`;
  $('.puzzle-card').classList.remove('puzzle-pulse');
  void $('.puzzle-card').offsetWidth;
  $('.puzzle-card').classList.add('puzzle-pulse');
  const moved=$(`.slide-tile[data-index="${empty}"]`);
  const after=moved.getBoundingClientRect();
  moved.focus({preventScroll:true});
  if(!reducedMotion()) moved.animate([
    {transform:`translate(${before.left-after.left}px,${before.top-after.top}px)`},
    {transform:'translate(0,0)'}
  ],{duration:170,easing:'ease-out'});
  playTone('hint');
  if(state.slideTiles.every((tile,i)=>tile===(i===8?0:i+1))) solveCurrentPuzzle();
}
function renderLockDials(){
  const dials=$('#lock-dials');
  dials.replaceChildren();
  state.lockDigits.forEach((digit,index)=>{
    const wheel=document.createElement('div');
    wheel.className='lock-wheel';
    const up=document.createElement('button');
    up.type='button'; up.dataset.wheel=index; up.dataset.delta='1'; up.textContent='▲';
    up.setAttribute('aria-label',`Increase digit ${index+1}`);
    const output=document.createElement('output');
    output.className='lock-digit'; output.textContent=String(digit);
    output.setAttribute('aria-label',`Digit ${index+1}: ${digit}`);
    const down=document.createElement('button');
    down.type='button'; down.dataset.wheel=index; down.dataset.delta='-1'; down.textContent='▼';
    down.setAttribute('aria-label',`Decrease digit ${index+1}`);
    wheel.append(up,output,down);
    dials.appendChild(wheel);
  });
}
function openCurrentPuzzle(){
  const puzzle=PUZZLES[state.levelIndex];
  const fresh=state.puzzleLevel!==state.levelIndex;
  state.puzzleLevel=state.levelIndex;
  state.phase='puzzle';
  startMusic('puzzle');
  state.paused=true;
  state.puzzleResolving=false;
  $('.puzzle-card').classList.remove('puzzle-solved');
  $all('#overlay-puzzle button').forEach(el=>{ el.disabled=false; });
  $('#btn-puzzle-check').disabled=false;
  $('#puzzle-kicker').textContent=puzzle.kicker;
  $('#puzzle-title').textContent=puzzle.title;
  $('#puzzle-prompt').textContent=puzzle.prompt;
  $('#puzzle-evidence-title').textContent=puzzle.evidence;
  const code=puzzle.type==='cipher' ? (puzzle.prompt.match(/[“"]([^”"]+)[”"]/)||[])[1] : '';
  $('#puzzle-code-strip').hidden=!code;
  $('#puzzle-code').textContent=code||'';
  $('#puzzle-status').textContent='AWAITING INPUT';
  $('#puzzle-activity-id').textContent=String(state.levelIndex+1).padStart(2,'0');
  $('#puzzle-activity-bars').replaceChildren(...Array.from({length:8},()=>document.createElement('span')));
  updatePuzzleActivity(1);
  $('.puzzle-card').dataset.puzzleType=puzzle.type;
  $('.puzzle-card').classList.remove('puzzle-pulse','puzzle-error');
  $('#puzzle-feedback').textContent='';
  $('#puzzle-feedback').classList.remove('success');
  $('#slide-panel').hidden=puzzle.type!=='slide';
  $('#cipher-panel').hidden=puzzle.type!=='cipher';
  $('#lock-panel').hidden=puzzle.type!=='lock';
  $('#btn-puzzle-check').hidden=puzzle.type==='slide';
  $('#puzzle-submit').hidden=puzzle.type==='slide';
  $('#cipher-label').textContent=state.levelIndex===LEVELS.length-1?'DECODED CONTROL MODE':'DECODED DESTINATION';
  $('#cipher-answer').placeholder=state.levelIndex===LEVELS.length-1?'ENTER CONTROL MODE':'ENTER LOCATION';
  if(fresh) $('#puzzle-assist').hidden=true;
  if(puzzle.type==='slide' && fresh) shuffleSlideTiles();
  if(puzzle.type==='slide' && !fresh) renderSlidePuzzle();
  if(puzzle.type==='cipher' && fresh) $('#cipher-answer').value='';
  if(puzzle.type==='lock' && fresh){
    state.lockDigits=[0,0,0,0];
    renderLockDials();
  }
  if(puzzle.type==='cipher') updatePuzzleActivity(Math.min(8,Math.max(1,$('#cipher-answer').value.replace(/[^A-Za-z0-9]/g,'').length)));
  if(puzzle.type==='lock') updatePuzzleActivity(1+state.lockDigits.filter(Boolean).length*2);
  openOverlay('overlay-puzzle');
}
function checkCurrentPuzzle(){
  const puzzle=PUZZLES[state.levelIndex];
  if(state.phase!=='puzzle' || puzzle.type==='slide' || state.puzzleResolving) return;
  const answer=puzzle.type==='cipher'
    ? $('#cipher-answer').value.toUpperCase().replace(/[^A-Z0-9]/g,'')
    : state.lockDigits.join('');
  if(answer===puzzle.answer){
    solveCurrentPuzzle();
  }else{
    $('#puzzle-feedback').textContent='ACCESS DENIED // CHECK THE EVIDENCE';
    $('#puzzle-feedback').classList.remove('success');
    $('#puzzle-status').textContent='ACCESS DENIED';
    updatePuzzleActivity(0);
    $('.puzzle-card').classList.remove('puzzle-error');
    void $('.puzzle-card').offsetWidth;
    $('.puzzle-card').classList.add('puzzle-error');
    playTone('error');
  }
}
function solveCurrentPuzzle(skipped=false){
  if(state.phase!=='puzzle' || state.puzzleResolving) return;
  state.puzzleResolving=true;
  if(skipped) state.skippedPuzzles.add(state.levelIndex);
  $all('#overlay-puzzle button').forEach(el=>{ el.disabled=true; });
  $('#puzzle-feedback').textContent=skipped?'BYPASS LOGGED // CASE CONTINUES':state.levelIndex===LEVELS.length-1?'TEST MODE CONFIRMED // AUTHOR REVEALED':'ACCESS GRANTED // LOCATION UNLOCKED';
  $('#puzzle-feedback').classList.add('success');
  $('#puzzle-status').textContent=skipped?'BYPASS LOGGED':'ACCESS GRANTED';
  $('#puzzle-result-title').textContent=skipped?'BYPASS LOGGED':state.levelIndex===LEVELS.length-1?'PROTOCOL EXPOSED':'ACCESS GRANTED';
  updatePuzzleActivity(8);
  $('.puzzle-card').classList.add('puzzle-solved');
  playTone('complete');
  later(resolveCurrentPuzzle,reducedMotion()?0:1200);
}
function resetPuzzle(){
  if(state.phase!=='puzzle' || state.puzzleResolving) return;
  const type=PUZZLES[state.levelIndex].type;
  if(type==='slide'){
    state.slideTiles=state.slideInitial.slice(); state.slideMoves=0; renderSlidePuzzle();
  }else if(type==='cipher') $('#cipher-answer').value='';
  else{ state.lockDigits=[0,0,0,0]; renderLockDials(); }
  $('#puzzle-feedback').textContent='';
  $('#puzzle-feedback').classList.remove('success');
  $('#puzzle-status').textContent='AWAITING INPUT';
  if(type!=='slide') updatePuzzleActivity(1);
  $('.puzzle-card').classList.remove('puzzle-error','puzzle-pulse');
}
function showPuzzleHint(){
  if(state.phase!=='puzzle' || state.puzzleResolving) return;
  const hints=[
    'Relay layout: 1 2 3 / 4 5 6 / 7 8 empty. Only a tile beside the empty socket can move. Place the top row first.',
    'Mirror pairs: A-Z, B-Y, C-X, D-W, E-V, F-U, G-T, H-S, I-R, J-Q, K-P, L-O, M-N. GSV becomes THE.',
    'Computer Lab 2 becomes 0002 when written as a four-digit room code.',
    'Using the mirror pairs, UZY becomes FAB. The destination is the fabrication workshop.',
    'VHW becomes ESD. The parts are in the antistatic archive.',
    'Write 09:18 AM as four digits: 0918.',
    'Restore the relay layout: 1 2 3 / 4 5 6 / 7 8 empty. Only adjacent tiles can move.',
    'The meter tag gives 12 followed by 05.',
    'In the mirror alphabet, W becomes D, V becomes E, N becomes M, and L becomes O.',
    'GVHG becomes TEST. Decode the rest to reveal the protocol mode.'
  ];
  $('#puzzle-assist').textContent=hints[state.levelIndex];
  $('#puzzle-assist').hidden=false;
}
function resolveCurrentPuzzle(){
  if(state.phase!=='puzzle' || !state.puzzleResolving) return;
  closeOverlay('overlay-puzzle');
  state.solvedPuzzles.add(state.levelIndex);
  state.puzzleResolving=false;
  if(state.levelIndex>=LEVELS.length-1){
    finishCase();
  }else{
    state.unlockedLevel=state.levelIndex+1;
    openMap(true);
  }
}
function openCaseFile(){
  if(!canSearch()) return;
  state.phase='journal';
  state.paused=true;
  startMusic('pause');
  renderEvidenceArchive();
  openOverlay('overlay-case-file');
}
function closeCaseFile(){
  closeOverlay('overlay-case-file');
  state.phase='search';
  state.paused=false;
  startMusic('game');
}
function onTimeUp(){
  state.phase='timeup'; state.paused=true;
  startMusic('timeup');
  const lvl = LEVELS[state.levelIndex];
  $('#tu-score').textContent = state.levelScore;
  $('#tu-found').textContent = `${state.found.size}/${lvl.targets.length}`;
  openOverlay('overlay-timeup');
  playTone('error');
}
function togglePause(force){
  if(state.phase!=='search' && state.phase!=='pause') return;
  state.paused = force!==undefined ? force : !state.paused;
  state.phase=state.paused?'pause':'search';
  startMusic(state.paused?'pause':'game');
  if(state.paused){ openOverlay('overlay-pause'); }
  else{ closeOverlay('overlay-pause'); }
}
function setSound(on){
  state.soundOn = on;
  const titleSound=$('#btn-sound-title');
  titleSound.innerHTML=window.CircuitIcons.markup(on?'sound':'muted');
  titleSound.setAttribute('aria-label',on?'Mute sound':'Enable sound');
  titleSound.title=on?'Mute sound':'Enable sound';
  const gameSound=$('#btn-sound-game');
  const gameSoundIcon=$('.hud-icon-slot',gameSound);
  if(gameSoundIcon) gameSoundIcon.innerHTML=window.CircuitIcons.markup(on?'sound':'muted');
  else gameSound.innerHTML=window.CircuitIcons.markup(on?'sound':'muted');
  gameSound.setAttribute('aria-label',on?'Mute sound':'Enable sound');
  gameSound.title=on?'Mute sound':'Enable sound';
  if(on){
    ensureAudio();
    startMusic(musicModeForPhase());
  }else stopMusic();
}

function initHomeSceneControls(){
  const inspect=$('#desk-inspect');
  const power=$('#desk-power');
  const reset=$('#desk-reset');
  const titleScreen=$('#screen-title');
  if(!inspect || !power || !reset || !titleScreen) return;
  let inspectMode=true;
  let powered=false;
  inspect.innerHTML=window.CircuitIcons.markup('scan');
  power.innerHTML=window.CircuitIcons.markup('power');
  reset.innerHTML=window.CircuitIcons.markup('reset');
  const closeBtn=$('#btn-home-inspection-close');
  const focusBtn=$('#btn-home-inspection-focus');
  if(closeBtn) closeBtn.innerHTML=window.CircuitIcons.markup('close');
  window.HomeLab3D?.setInspectMode(inspectMode);
  inspect.addEventListener('click',()=>{
    inspectMode=!inspectMode;
    inspect.classList.toggle('active',inspectMode);
    inspect.setAttribute('aria-pressed',String(inspectMode));
    window.HomeLab3D?.setInspectMode(inspectMode);
  });
  reset.addEventListener('click',()=>{
    window.HomeLab3D?.resetView();
  });
  closeBtn?.addEventListener('click',()=>window.HomeLab3D?.clearInspection());
  focusBtn?.addEventListener('click',()=>window.HomeLab3D?.focusSelected());
  let bootTimer;
  power.addEventListener('click', ()=>{
    powered=!powered;
    power.setAttribute('aria-pressed',String(powered));
    power.classList.toggle('active',powered);
    power.setAttribute('aria-label',powered?'Turn laboratory lights off':'Turn laboratory lights on');
    power.title=power.getAttribute('aria-label');
    titleScreen.classList.toggle('is-powered',powered);
    titleScreen.classList.remove('power-booting');
    clearTimeout(bootTimer);
    if(powered){
      void titleScreen.offsetWidth;
      titleScreen.classList.add('power-booting');
      bootTimer=setTimeout(()=>titleScreen.classList.remove('power-booting'),950);
    }
    window.HomeLab3D?.setPowered(powered);
    playTone(powered?'success':'hint');
  });
}

/* ============================================================
   MISC UI
   ============================================================ */
function addRivets(){
  const wrap = $('#scene-wrap');
  const positions = [[8,8],['calc(100% - 16px)',8],[8,'calc(100% - 16px)'],['calc(100% - 16px)','calc(100% - 16px)']];
  positions.forEach(([l,t])=>{
    const d=document.createElement('div');
    d.className='rivet';
    d.style.left = typeof l==='number'? l+'px': l;
    d.style.top = typeof t==='number'? t+'px': t;
    wrap.appendChild(d);
  });
}
function initZoneInterface(){
  const scene = $('#scene-wrap');
  const reticle = $('#zone-reticle');
  const coordinates = $('#zone-coordinates');
  scene.addEventListener('pointermove', e=>{
    const rect = scene.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX-rect.left)/rect.width)*100));
    const y = Math.max(0, Math.min(100, ((e.clientY-rect.top)/rect.height)*100));
    reticle.style.left = `${x}%`;
    reticle.style.top = `${y}%`;
    reticle.classList.add('active');
    coordinates.textContent = `X: ${String(Math.round(x*16)).padStart(3,'0')} // Y: ${String(Math.round(y*9)).padStart(3,'0')}`;
  });
  scene.addEventListener('pointerleave', ()=> reticle.classList.remove('active'));
}

/* ============================================================
   INIT / WIRING
   ============================================================ */
function init(){
  $('#btn-start .action-icon').innerHTML=window.CircuitIcons.markup('play');
  $('#btn-howto .action-icon').innerHTML=window.CircuitIcons.markup('map');
  [['#btn-hint','lightbulb'],['#btn-scan','scan'],['#btn-case-file','file'],['#btn-map','map'],['#btn-pause','pause'],['#btn-restart','reset']].forEach(([selector,icon])=>{
    const button=$(selector);
    const slot=$('.hud-icon-slot',button);
    if(slot) slot.innerHTML=window.CircuitIcons.markup(icon);
  });
  $all('.hud-stat').forEach(stat=>stat.addEventListener('animationend',event=>{
    if(event.animationName==='statReward') stat.classList.remove('hud-reward-pop');
  }));
  const progress=$('#progress-fill').parentElement;
  progress.setAttribute('role','progressbar');
  progress.setAttribute('aria-valuemin','0');
  $('#btn-puzzle-reset').innerHTML=window.CircuitIcons.markup('reset');
  $('#btn-story-exit').innerHTML=window.CircuitIcons.markup('close');
  $all('.overlay').forEach(overlay=>{
    overlay.inert=true;
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    const title=$('.overlay-title',overlay);
    if(title){
      if(!title.id) title.id=`${overlay.id}-heading`;
      overlay.setAttribute('aria-labelledby',title.id);
    }
  });
  $('#screen-game').inert=true;
  addRivets();
  loadCaseFile();
  renderEvidenceArchive();
  updateEvidenceBadge();
  setSound(true);
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden) stopMusic();
    else if(state.soundOn) startMusic(musicModeForPhase());
  });
  // Buttons with their own success or hint tone keep that feedback without an extra click.
  document.addEventListener('click',event=>{
    const button=event.target.closest('button');
    if(!button||button.disabled||button.getAttribute('aria-disabled')==='true') return;
    const toneBefore=state.toneSerial;
    queueMicrotask(()=>{
      if(state.soundOn&&state.toneSerial===toneBefore) playTone('ui');
    });
  });
  initHomeSceneControls();
  initZoneInterface();

  $('#btn-start').addEventListener('click', ()=>{ ensureAudio(); startGame(); });
  $('#btn-howto').addEventListener('click', ()=> $('#modal-howto').classList.add('active'));
  $('#btn-howto-close').addEventListener('click', ()=> $('#modal-howto').classList.remove('active'));
  $('#modal-howto').addEventListener('click', (e)=>{ if(e.target.id==='modal-howto') $('#modal-howto').classList.remove('active'); });

  $('#btn-sound-title').addEventListener('click', ()=> setSound(!state.soundOn));
  $('#btn-sound-game').addEventListener('click', ()=> setSound(!state.soundOn));
  $('#btn-case-file').addEventListener('click', openCaseFile);
  $('#btn-case-close').addEventListener('click', closeCaseFile);
  $('#btn-map').addEventListener('click', ()=>openMap());
  $('#btn-map-close').addEventListener('click',closeMap);
  $('#btn-map-travel').addEventListener('click',travelFromMap);
  $('#map-rooms').addEventListener('click',e=>{
    const room=e.target.closest('[data-level]');
    if(!room || room.disabled) return;
    state.mapSelection=Number(room.dataset.level);
    renderMap();
    $(`[data-level="${state.mapSelection}"]`,$('#map-rooms')).focus({preventScroll:true});
  });
  $('#btn-story-reveal').addEventListener('click',()=>{ revealStory(); $('#btn-story-continue').focus(); });
  $('#btn-story-exit').addEventListener('click',returnHome);
  $('#btn-puzzle-reset').addEventListener('click',resetPuzzle);
  $('#btn-puzzle-hint').addEventListener('click',showPuzzleHint);
  $('#btn-puzzle-skip').addEventListener('click',()=>solveCurrentPuzzle(true));
  $('#btn-puzzle-back').addEventListener('click',()=>{
    if(state.puzzleResolving) return;
    state.phase='report';
    openOverlay('overlay-complete');
  });
  $('#overlay-case-file').addEventListener('click', e=>{ if(e.target.id==='overlay-case-file') closeCaseFile(); });
  $('#puzzle-form').addEventListener('submit', e=>{ e.preventDefault(); checkCurrentPuzzle(); });
  $('#cipher-answer').addEventListener('input',e=>{
    if(state.phase!=='puzzle' || state.puzzleResolving) return;
    const entered=e.target.value.replace(/[^A-Za-z0-9]/g,'').length;
    updatePuzzleActivity(Math.min(8,Math.max(1,entered)));
    $('#puzzle-status').textContent=entered?'DECODER ACTIVE':'AWAITING INPUT';
    $('.puzzle-card').classList.remove('puzzle-error');
  });
  $('#slide-grid').addEventListener('click', e=>{
    const tile=e.target.closest('.slide-tile');
    if(tile) moveSlideTile(Number(tile.dataset.index));
  });
  $('#lock-dials').addEventListener('click', e=>{
    const turn=e.target.closest('button[data-wheel]');
    if(!turn || state.phase!=='puzzle' || state.puzzleResolving) return;
    const wheel=Number(turn.dataset.wheel);
    const delta=Number(turn.dataset.delta);
    state.lockDigits[wheel]=(state.lockDigits[wheel]+delta+10)%10;
    const output=$(`.lock-wheel:nth-child(${wheel+1}) .lock-digit`,$('#lock-dials'));
    output.textContent=String(state.lockDigits[wheel]);
    output.setAttribute('aria-label',`Digit ${wheel+1}: ${state.lockDigits[wheel]}`);
    output.classList.remove('dial-turn');
    void output.offsetWidth;
    output.classList.add('dial-turn');
    updatePuzzleActivity(1+state.lockDigits.filter(Boolean).length*2);
    $('#puzzle-status').textContent='LOCK WHEELS ACTIVE';
    $('.puzzle-card').classList.remove('puzzle-error');
    playTone('hint');
  });

  $('#btn-hint').addEventListener('click', useHint);
  $('#btn-scan').addEventListener('click', scanRemaining);
  $('#btn-pause').addEventListener('click', ()=> togglePause(true));
  $('#btn-resume').addEventListener('click', ()=> togglePause(false));
  $('#btn-restart').addEventListener('click', ()=>{ if(canSearch()) loadLevel(state.levelIndex); });
  $('#btn-pause-restart').addEventListener('click', ()=>{ togglePause(false); loadLevel(state.levelIndex); });
  $('#btn-pause-quit').addEventListener('click',returnHome);

  $('#btn-story-continue').addEventListener('click', ()=>{
    if(state.phase!=='story') return;
    revealStory(); closeOverlay('overlay-story'); loadLevel(state.pendingLevelIndex);
  });
  $('#btn-next-level').addEventListener('click', ()=>{ closeOverlay('overlay-complete'); openCurrentPuzzle(); });
  $('#btn-timeup-retry').addEventListener('click', ()=>{ closeOverlay('overlay-timeup'); loadLevel(state.levelIndex); });
  $('#btn-timeup-quit').addEventListener('click',returnHome);
  $('#btn-play-again').addEventListener('click',returnHome);

  const svg = $('#scene-svg');
  svg.addEventListener('click', onSceneClick);
  svg.addEventListener('keydown', onSceneKeydown);
  document.addEventListener('keydown', e=>{
    const overlay=$('.overlay.active');
    if(overlay){
      if(e.key==='Escape'){
        if(state.phase==='journal') closeCaseFile();
        else if(state.phase==='pause') togglePause(false);
        else if(state.phase==='map') closeMap();
        else if(state.phase==='story') returnHome();
        return;
      }
      if(e.key==='Tab'){
        const controls=$all('button:not(:disabled),input:not(:disabled),[tabindex="0"]',overlay)
          .filter(el=>!el.hidden && el.getClientRects().length);
        const first=controls[0], last=controls[controls.length-1];
        if(!first){ e.preventDefault(); return; }
        if(e.shiftKey && (!controls.includes(document.activeElement) || document.activeElement===first)){
          e.preventDefault(); last.focus();
        }else if(!e.shiftKey && (!controls.includes(document.activeElement) || document.activeElement===last)){
          e.preventDefault(); first.focus();
        }
      }
      return;
    }
    if(!$('#screen-game').classList.contains('active') || $('.overlay.active') || e.altKey || e.ctrlKey || e.metaKey) return;
    const key=e.key.toLowerCase();
    if(key==='h'){ e.preventDefault(); useHint(); }
    if(key==='r'){ e.preventDefault(); scanRemaining(); }
    if(key==='p'){ e.preventDefault(); togglePause(); }
    if(key==='m'){ e.preventDefault(); openMap(); }
  });
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded', init);
}else{
  init();
}

})();
