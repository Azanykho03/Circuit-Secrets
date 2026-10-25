(function(){
'use strict';

const SHOTS=[
  {
    image:'assets/intro/campus-arrival-cartoon.svg',
    alt:'The CTU Danao engineering building before the COMPLAB 2 practical.',
    time:'08:55', chapter:'01 · FIRST PERIOD',
    speaker:'FIONA', role:'Computer Engineering Student',
    title:'The bench was warm before the bell.',
    dialogue:[
      'At 08:55, [[amber:flux still hung in the air]] over our shared bench.',
      {speaker:'MARIE',role:'Lab Partner',text:'One good soldering iron, two groups waiting. I should start a reservation list.'},
      'I checked the resistor value twice before connecting the supply.',
      'Our instructor set the practical: build, measure, find the fault.'
    ],
    duration:15000, focus:'50%'
  },
  {
    image:'assets/intro/capstone-team-cartoon.svg',
    alt:'Fiona and her lab partner Marie work at a crowded COMPLAB 2 bench.',
    time:'09:02', chapter:'02 · THE PRACTICAL',
    speaker:'FIONA', role:'Computer Engineering Student',
    title:'The checklist stopped at the signal.',
    dialogue:[
      'Marie had the borrowed multimeter; I watched channel one on the scope.',
      {speaker:'MARIE',role:'Lab Partner',text:'Tell me you saved that reading. Group-project panic is not a backup plan.'},
      'I had one clean signal. Then the line went flat.',
      'I reached for the workstation. Its screen blinked first.'
    ],
    duration:15000, focus:'60%'
  },
  {
    image:'assets/intro/lab-blackout-cartoon.svg',
    alt:'Lab monitors display a protocol warning as the computers shut down.',
    time:'09:03', chapter:'03 · THE BLACKOUT',
    speaker:'FIONA', role:'Computer Engineering Student',
    title:'The screen answered before I could.',
    dialogue:[
      'The workstation printed three lines where our readings should be:',
      '[[alert:PROJECT FILES CORRUPTED.]]',
      '[[alert:UNAUTHORIZED ACCESS DETECTED.]]',
      '[[amber:CIRCUIT SECRETS PROTOCOL ACTIVATED.]]',
      'I called Marie. Every monitor went dark before she could answer.',
      'After restart, I found our files and parts gone.'
    ],
    duration:21000, focus:'53%', blackout:true, dramaticBeats:[1,2,3,4]
  },
  {
    image:'assets/intro/professor-briefing-cartoon.svg',
    alt:'The instructor speaks with Fiona in the computer engineering laboratory after the restart.',
    time:'09:07', chapter:'04 · THE FIRST CLUE',
    speaker:'FIONA', role:'Computer Engineering Student',
    title:'The logs had not gone dark.',
    dialogue:[
      'Our instructor said not to call it a virus before checking the evidence.',
      'He sent us back to the bench and the local logs.',
      {speaker:'MARIE',role:'Lab Partner',text:'One rack at a time. I count the parts; you chase the log. Try to keep up.'},
      'I followed the missing components through the engineering rooms.',
      'I knew these circuits. Someone built this test for students like us.'
    ],
    duration:18500, focus:'70%', briefing:true
  }
];

let running=false, current=0, paused=false, elapsed=0, previousTime=0, frame=0;
let dialogueBeats=[], dialogueBeat=0;
let activeLayer=0, onComplete=null, onExit=null, toggleSound=null, initialized=false;
let typingTimer=0, typingComplete=true, typingNodes=[], typingIndex=0, beatIsDramatic=false;
const decodeTimeouts=new Set();
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const $=selector=>document.querySelector(selector);

function splitDialogue(text){
  if(Array.isArray(text)) return text;
  return (text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[]).map(line=>line.trim()).filter(Boolean);
}

function beatDetails(source){
  return typeof source==='string'
    ? {speaker:SHOTS[current].speaker,role:SHOTS[current].role,text:source}
    : source;
}

function continueDescription(){
  if(dialogueBeat<dialogueBeats.length-1) return 'Continue to the next line';
  return current===SHOTS.length-1?'Begin the investigation':'Continue to the next scene';
}

function clearTyping(){
  clearInterval(typingTimer); typingTimer=0;
  decodeTimeouts.forEach(clearTimeout); decodeTimeouts.clear();
}

function dialogueParts(text){
  const parts=[];
  const pattern=/\[\[(cyan|amber|alert):([\s\S]+?)\]\]/g;
  let cursor=0, match;
  while((match=pattern.exec(text))){
    if(match.index>cursor) parts.push({text:text.slice(cursor,match.index),tone:''});
    parts.push({text:match[2],tone:match[1]});
    cursor=pattern.lastIndex;
  }
  if(cursor<text.length) parts.push({text:text.slice(cursor),tone:''});
  return parts;
}

function completeTyping(playCue=false){
  if(typingComplete) return;
  clearTyping();
  typingNodes.forEach(({node,text})=>{ node.textContent=text; node.classList.remove('is-decoding'); node.classList.add('is-decoded'); });
  typingIndex=typingNodes.length;
  typingComplete=true;
  const dialogue=$('#intro-dialogue');
  dialogue.setAttribute('aria-busy','false');
  $('#screen-prologue').classList.remove('is-decoding');
  dialogue.classList.remove('is-decoding');
  $('#btn-intro-next').dataset.decodeState='ready';
  $('#btn-intro-next').setAttribute('aria-label',continueDescription());
  $('#btn-intro-next').title=continueDescription();
  document.dispatchEvent(new Event('circuit-intro-dialogue-end'));
  if(playCue) window.CircuitIntroAudio?.cue('confirm');
}

function revealNextCharacter(){
  if(paused||document.hidden) return;
  if(typingIndex>=typingNodes.length){ completeTyping(); return; }
  const entry=typingNodes[typingIndex];
  const {node,text,tone}=entry;
  const canScramble=/[\p{L}\p{N}]/u.test(text);
  if(canScramble&&!reducedMotion.matches){
    node.textContent='01XZ▒'[Math.floor(Math.random()*5)];
    node.classList.add('is-decoding');
    const timer=window.setTimeout(()=>{
      decodeTimeouts.delete(timer);
      node.textContent=text;
      node.classList.remove('is-decoding');
      node.classList.add('is-decoded');
      if(tone) node.classList.add(`decode-emphasis--${tone}`);
    },48);
    decodeTimeouts.add(timer);
    if(typingIndex%5===0) window.CircuitIntroAudio?.cue('type',typingIndex);
    if(tone&&!beatIsDramatic&&typingNodes[typingIndex-1]?.tone!==tone) window.CircuitIntroAudio?.cue('glitch');
  }else{
    node.textContent=text;
    node.classList.add('is-decoded');
    if(tone) node.classList.add(`decode-emphasis--${tone}`);
  }
  typingIndex++;
  if(typingIndex>=typingNodes.length) completeTyping();
}

function updateBeatMeter(){
  const host=$('#intro-beat-progress');
  host.replaceChildren();
  host.style.setProperty('--beat-count',dialogueBeats.length);
  dialogueBeats.forEach((_,index)=>{
    const segment=document.createElement('span');
    segment.className=index<dialogueBeat?'is-complete':index===dialogueBeat?'is-current':'';
    host.appendChild(segment);
  });
  $('#intro-beat-counter').textContent=`BEAT ${String(dialogueBeat+1).padStart(2,'0')} / ${String(dialogueBeats.length).padStart(2,'0')}`;
}

function showDialogueBeat({sound=true}={}){
  const dialogue=$('#intro-dialogue');
  clearTyping();
  typingNodes=[]; typingIndex=0; typingComplete=false;
  const beat=beatDetails(dialogueBeats[dialogueBeat]);
  const source=beat.text;
  $('#intro-speaker-name').textContent=beat.speaker;
  $('#intro-speaker-role').textContent=beat.role;
  $('#intro-avatar').dataset.speaker=beat.speaker;
  $('#intro-avatar').setAttribute('aria-label',beat.speaker==='MARIE'?'Marie':'Fiona');
  const plain=source.replace(/\[\[(?:cyan|amber|alert):([\s\S]+?)\]\]/g,'$1');
  dialogue.setAttribute('aria-label',plain);
  dialogue.setAttribute('aria-busy','true');
  dialogue.replaceChildren();
  dialogueParts(source).forEach(part=>{
    for(const character of Array.from(part.text)){
      const node=document.createElement('span');
      node.className='decode-char';
      if(part.tone) node.dataset.tone=part.tone;
      dialogue.appendChild(node);
      typingNodes.push({node,text:character,tone:part.tone});
    }
  });
  updateBeatMeter();
  dialogue.classList.remove('dialogue-enter');
  void dialogue.offsetWidth;
  dialogue.classList.add('dialogue-enter');
  const shot=SHOTS[current];
  const dramatic=shot.dramaticBeats?.includes(dialogueBeat);
  beatIsDramatic=Boolean(dramatic);
  const screen=$('#screen-prologue');
  screen.classList.toggle('beat-dramatic',Boolean(dramatic));
  if(dramatic){
    screen.classList.remove('beat-impact'); void screen.offsetWidth; screen.classList.add('beat-impact');
    window.setTimeout(()=>screen.classList.remove('beat-impact'),420);
    if(sound) window.CircuitIntroAudio?.cue(shot.blackout&&dialogueBeat===1?'incident':'glitch');
  }
  document.dispatchEvent(new CustomEvent('circuit-intro-beat',{detail:{shot:current,beat:dialogueBeat}}));
  document.dispatchEvent(new Event('circuit-intro-dialogue-start'));
  if(reducedMotion.matches) completeTyping();
  else{
    $('#screen-prologue').classList.add('is-decoding');
    dialogue.classList.add('is-decoding');
    $('#btn-intro-next').dataset.decodeState='decoding';
    typingTimer=window.setInterval(revealNextCharacter,24);
  }
  $('#btn-intro-next').setAttribute('aria-label',typingComplete?continueDescription():`Finish decoding line ${dialogueBeat+1}`);
  $('#btn-intro-next').title=typingComplete?continueDescription():'Continue';
}

function updatePlayback(){
  $('#screen-prologue').classList.toggle('is-paused',paused);
  const control=$('#btn-intro-pause');
  control.disabled=false;
  control.innerHTML=window.CircuitIcons.markup(paused?'play':'pause');
  control.dataset.actionLabel=paused?'Resume':'Pause';
  control.setAttribute('aria-label',paused?'Play introduction':'Pause introduction');
  control.title=paused?'Play introduction':'Pause introduction';
  document.dispatchEvent(new CustomEvent('circuit-intro-playback',{detail:{paused}}));
  if(paused) document.dispatchEvent(new Event('circuit-intro-dialogue-end'));
  else if(!typingComplete) document.dispatchEvent(new Event('circuit-intro-dialogue-start'));
}

function renderShot(index){
  clearTyping();
  current=index; elapsed=0; previousTime=0; paused=false;
  const shot=SHOTS[index];
  dialogueBeats=splitDialogue(shot.dialogue);
  dialogueBeat=0;
  const screen=$('#screen-prologue');
  screen.scrollTop=0;
  screen.dataset.shot=String(index);
  screen.classList.remove('scene-enter');
  void screen.offsetWidth;
  screen.classList.add('scene-enter');
  screen.classList.toggle('power-event',Boolean(shot.blackout));
  screen.classList.toggle('is-briefing',Boolean(shot.briefing));
  const images=[$('#intro-image-a'),$('#intro-image-b')];
  const image=images[activeLayer=1-activeLayer];
  image.classList.remove('is-current');
  image.style.setProperty('--shot-duration',`${shot.duration}ms`);
  image.style.setProperty('--focus-x',shot.focus);
  image.style.setProperty('--focus-y','40%');
  image.alt=shot.alt;
  image.src=shot.image;
  image.setAttribute('aria-hidden','false');
  $('#intro-media-note').hidden=true;
  image.onerror=()=>{
    if(!running || current!==index) return;
    $('#intro-media-note').textContent='Scene artwork unavailable. The case briefing is ready below.';
    $('#intro-media-note').hidden=false;
  };
  void image.offsetWidth;
  image.classList.add('is-current');
  images[1-activeLayer].classList.remove('is-current');
  images[1-activeLayer].setAttribute('aria-hidden','true');
  $('#intro-context').textContent=shot.chapter;
  $('#intro-clock').textContent=shot.time;
  $('#intro-speaker-name').textContent=shot.speaker;
  $('#intro-speaker-role').textContent=shot.role;
  $('#intro-heading').textContent=shot.title;
  $('#btn-intro-back').disabled=index===0;
  $('#btn-intro-next').innerHTML=`<span>Continue</span>${window.CircuitIcons.markup('play')}`;
  $('#btn-intro-next').setAttribute('aria-keyshortcuts','Enter ArrowRight');
  document.querySelectorAll('.intro-step').forEach((step,i)=>{
    step.classList.toggle('is-current',i===index);
    step.classList.toggle('is-complete',i<index);
    step.style.setProperty('--progress',i<index?'100%':'0%');
    if(i===index) step.setAttribute('aria-current','step');
    else step.removeAttribute('aria-current');
  });
  const caption=$('.prologue-caption');
  caption.classList.remove('caption-enter');
  void caption.offsetWidth;
  caption.classList.add('caption-enter');
  document.dispatchEvent(new CustomEvent('circuit-intro-shot',{detail:{index}}));
  showDialogueBeat({sound:false});
  window.CircuitIntroAudio?.cue('whoosh');
  updatePlayback();
  if(document.activeElement?.disabled) $('#btn-intro-next').focus({preventScroll:true});
}

function stop(){
  running=false;
  clearTyping();
  cancelAnimationFrame(frame);
  frame=0; previousTime=0;
  $('#screen-prologue').classList.add('is-paused');
  document.dispatchEvent(new Event('circuit-intro-dialogue-end'));
  document.dispatchEvent(new Event('circuit-intro-stop'));
}

function finish(){
  if(!running) return;
  const complete=onComplete;
  stop(); onComplete=null;
  complete?.();
}

function next(){
  if(!running) return;
  if(!typingComplete){ completeTyping(true); return; }
  window.CircuitIntroAudio?.cue('confirm');
  if(dialogueBeat<dialogueBeats.length-1){
    dialogueBeat++;
    showDialogueBeat();
  }
  else if(current===SHOTS.length-1) finish();
  else renderShot(current+1);
}

function tick(now){
  if(!running) return;
  if(previousTime && !paused && !document.hidden) elapsed+=Math.min(now-previousTime,100);
  previousTime=now;
  const shot=SHOTS[current];
  const progress=Math.min(100,elapsed/shot.duration*100);
  const timedBeat=Math.min(dialogueBeats.length-1,Math.floor(elapsed/shot.duration*dialogueBeats.length));
  if(timedBeat>dialogueBeat){
    if(!typingComplete) completeTyping();
    dialogueBeat=timedBeat;
    showDialogueBeat();
  }
  $(`.intro-step[data-shot="${current}"]`).style.setProperty('--progress',`${progress}%`);
  if(progress>=100){
    if(current<SHOTS.length-1) renderShot(current+1);
    else { finish(); return; }
  }
  frame=requestAnimationFrame(tick);
}

function init(){
  if(initialized) return;
  initialized=true;
  $('#btn-intro-home').innerHTML=`${window.CircuitIcons.markup('home')}<span>Home</span>`;
  $('#btn-intro-back').innerHTML=`${window.CircuitIcons.markup('back')}<span>Previous scene</span>`;
  const progress=$('#intro-progress');
  const menu=$('#intro-menu');
  SHOTS.forEach((shot,index)=>{
    const step=document.createElement('button');
    step.type='button'; step.className='intro-step'; step.dataset.shot=index;
    step.setAttribute('aria-label',shot.chapter);
    step.title=shot.chapter.replace(/^\d+\s*\/\s*/,'');
    const label=document.createElement('b');
    label.textContent=String(index+1).padStart(2,'0');
    label.setAttribute('aria-hidden','true');
    step.appendChild(label);
    step.appendChild(document.createElement('span'));
    step.addEventListener('click',()=>{ if(running) renderShot(index); });
    progress.appendChild(step);
    const preload=new Image(); preload.src=shot.image;
  });
  menu.addEventListener('toggle',()=>{
    const open=menu.open;
    $('#btn-intro-menu').setAttribute('aria-label',open?'Close introduction menu':'Open introduction menu');
    if(open) window.CircuitIntroAudio?.cue('click');
  });
  menu.addEventListener('click',event=>{
    if(event.target.closest('button')) menu.open=false;
  });
  document.addEventListener('click',event=>{
    if(menu.open && !menu.contains(event.target)) menu.open=false;
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape' && menu.open){ menu.open=false; $('#btn-intro-menu').focus(); }
  });
  $('#btn-intro-next').addEventListener('click',next);
  $('#btn-intro-skip').addEventListener('click',finish);
  $('#btn-intro-back').addEventListener('click',()=>{ if(running && current>0) renderShot(current-1); });
  $('#btn-intro-pause').addEventListener('click',()=>{
    if(!running) return;
    paused=!paused; previousTime=0; updatePlayback();
  });
  $('#btn-intro-sound').addEventListener('click',()=>{
    window.CircuitIntroAudio?.unlock();
    if(toggleSound) updateSound(toggleSound());
  });
  $('#intro-story-area').addEventListener('click',event=>{
    if(event.target.closest('button,a')) return;
    next();
  });
  $('#btn-intro-home').addEventListener('click',()=>{ if(running){ stop(); onExit?.(); } });
  document.addEventListener('visibilitychange',()=>{
    if(running && document.hidden){ paused=true; updatePlayback(); }
  });
  $('#screen-prologue').addEventListener('scroll',()=>{
    if(running && $('#screen-prologue').scrollTop>0){ paused=true; updatePlayback(); }
  });
  $('#screen-prologue').addEventListener('keydown',event=>{
    if(!running || event.altKey || event.ctrlKey || event.metaKey) return;
    const control=event.target.closest?.('button,summary,a,input,select,textarea');
    if((event.key==='ArrowRight'||event.key==='Enter')&&!control){ event.preventDefault(); next(); }
    else if(event.key==='ArrowLeft' && current>0&&!control){ event.preventDefault(); renderShot(current-1); }
    else if(event.key==='Escape'){ event.preventDefault(); paused=true; updatePlayback(); }
  });
}

function updateSound(on){
  const button=$('#btn-intro-sound');
  button.innerHTML=window.CircuitIcons.markup(on?'sound':'muted');
  button.setAttribute('aria-pressed',String(on));
  button.setAttribute('aria-label',on?'Mute introduction':'Unmute introduction');
  button.title=on?'Mute introduction':'Unmute introduction';
}

window.CircuitIntro={
  play(options){
    init(); stop();
    onComplete=options.onComplete; onExit=options.onExit; toggleSound=options.toggleSound;
    running=true; paused=false;
    updateSound(options.soundOn);
    window.CircuitIntroAudio?.unlock();
    renderShot(0);
    $('#btn-intro-next').focus({preventScroll:true});
    frame=requestAnimationFrame(tick);
  },
  stop
};
})();
