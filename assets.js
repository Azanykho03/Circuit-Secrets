/* ==================================================================
   CIRCUIT SECRETS: COMPLAB 2 — assets.js
   Icon library, decorative scene builders, and level/world data.
   Loaded before main.js (main.js reads ICONS and LEVELS globally).
   ================================================================== */
'use strict';

const rand=(a,b)=>a+Math.random()*(b-a);

const OUTLINE='stroke="#060a0e" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"';
const OUTLINE_T='stroke="#060a0e" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round"';

function pinsSide(w,h,count,side){
  let s='';
  for(let i=0;i<count;i++){
    const t = count===1?0.5:i/(count-1);
    if(side==='l'||side==='r'){
      const y=(-h+t*(h*2)).toFixed(1);
      const x1= side==='l'? -w : w;
      const x2= side==='l'? -(w+5) : (w+5);
      s+=`<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#9aa4ab" stroke-width="1.6"/>`;
    }else{
      const x=(-w+t*(w*2)).toFixed(1);
      const y1= side==='t'? -h : h;
      const y2= side==='t'? -(h+5) : (h+5);
      s+=`<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="#9aa4ab" stroke-width="1.6"/>`;
    }
  }
  return s;
}
function dotGrid(x1,y1,x2,y2,cols,rows){
  let s='';
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      const x=x1+(x2-x1)*(cols===1?0:c/(cols-1));
      const y=y1+(y2-y1)*(rows===1?0:r/(rows-1));
      s+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="0.9" fill="#8d97a0"/>`;
    }
  }
  return s;
}
function chipRow(x,y,count,w){
  let s='';
  for(let i=0;i<count;i++){
    s+=`<rect x="${(x+i*w).toFixed(1)}" y="${(y-3).toFixed(1)}" width="${(w-1.5).toFixed(1)}" height="6" fill="#111214"/>`;
  }
  return s;
}
function ledRow(x,y,count,gap){
  let s='';
  for(let i=0;i<count;i++){
    const c = i%3===0? '#3dffb0': (i%3===1?'#3ff0ff':'#ffb545');
    const lit = Math.random()<0.75;
    s+=`<circle cx="${(x+i*gap).toFixed(1)}" cy="${y}" r="2" fill="${lit?c:'#26313a'}" ${lit?'class="blink-led" style="animation-delay:'+(Math.random()*3).toFixed(2)+'s"':''}/>`;
  }
  return s;
}
function fanBlades(){
  let s='';
  for(let i=0;i<4;i++){
    s+=`<g transform="rotate(${i*90})"><path d="M 0 0 Q 5 -12 0 -13 Q -5 -12 0 0 Z" fill="url(#metalSurface)" stroke="#172330" stroke-width=".7"/></g>`;
  }
  return s;
}
function ventLines(x,y,w,h){
  let s='';
  for(let i=0;i<5;i++){
    const lx=x+i*(w/4);
    s+=`<line x1="${lx}" y1="${y}" x2="${lx}" y2="${y+h}" stroke="#20262b" stroke-width="1.6"/>`;
  }
  return s;
}

/* ============================================================
   ICON LIBRARY — every icon is drawn centered on (0,0)
   ============================================================ */
const ICONS = {};

ICONS.resistor = () => `
  <line x1="-23" y1="0" x2="-10" y2="0" stroke="url(#metalSurface)" stroke-width="2.4"/>
  <line x1="10" y1="0" x2="23" y2="0" stroke="url(#metalSurface)" stroke-width="2.4"/>
  <rect x="-10" y="-6.5" width="20" height="13" rx="2.5" fill="url(#resistorSurface)" ${OUTLINE}/>
  <rect x="-6.5" y="-6.5" width="2.4" height="13" fill="#7a4a22"/>
  <rect x="-1.2" y="-6.5" width="2.4" height="13" fill="#c94141"/>
  <rect x="4" y="-6.5" width="2.4" height="13" fill="#d99a2b"/>`;

ICONS.capacitor = () => `
  <rect x="-9" y="-15" width="18" height="25" rx="3" fill="url(#darkMetalSurface)" ${OUTLINE}/>
  <rect x="-9" y="-15" width="18" height="6" rx="3" fill="url(#metalSurface)"/>
  <line x1="-4" y1="10" x2="-4" y2="21" stroke="url(#metalSurface)" stroke-width="2"/>
  <line x1="4" y1="10" x2="4" y2="21" stroke="url(#metalSurface)" stroke-width="2"/>
  <text x="0" y="1" font-size="8" fill="#6fe0ff" text-anchor="middle" font-family="Space Mono, monospace">+</text>`;

ICONS.microchip = () => `
  <rect x="-15" y="-11" width="30" height="22" rx="1.5" fill="url(#darkMetalSurface)" ${OUTLINE}/>
  <circle cx="-10" cy="-6" r="1.7" fill="#46bbdf"/>
  ${pinsSide(15,11,5,'l')}${pinsSide(15,11,5,'r')}
  <text x="0" y="3" font-size="7" fill="#7fdca0" text-anchor="middle" font-family="Space Mono, monospace">IC</text>`;

ICONS.usb_drive = () => `
  <rect x="-14" y="-8" width="28" height="16" rx="2" fill="url(#metalSurface)" ${OUTLINE}/>
  <rect x="-14" y="-8" width="10" height="16" rx="2" fill="url(#circuitSurface)"/>
  <path d="M-10-5 H7" stroke="#eef8fc" stroke-width="1" opacity=".45"/>
  <rect x="10" y="-3" width="8" height="6" fill="url(#metalSurface)"/>
  <rect x="18" y="-2.5" width="4" height="5" fill="url(#darkMetalSurface)"/>`;

ICONS.soldering_iron = () => `
  <rect x="-24" y="-4" width="20" height="8" rx="2" fill="url(#redGripSurface)" ${OUTLINE_T}/>
  <path d="M-21-2.3 H-8" stroke="#a9c5d6" stroke-width="1" opacity=".38"/>
  <rect x="-4" y="-2.6" width="20" height="5.2" fill="url(#metalSurface)" ${OUTLINE_T}/>
  <line x1="16" y1="0" x2="27" y2="0" stroke="#8ca0ae" stroke-width="3" stroke-linecap="round"/>
  <circle cx="28" cy="0" r="1.6" fill="#ffb545"/>`;

ICONS.screwdriver = () => `
  <rect x="-22" y="-4.5" width="14" height="9" rx="3" fill="url(#redGripSurface)" ${OUTLINE_T}/>
  <path d="M-19-2.5 H-11" stroke="#a9c5d6" stroke-width="1" opacity=".45"/>
  <rect x="-8" y="-2" width="4" height="4" fill="url(#darkMetalSurface)"/>
  <rect x="-4" y="-1.6" width="26" height="3.2" fill="url(#metalSurface)" ${OUTLINE_T}/>
  <polygon points="22,-2.4 30,0 22,2.4" fill="#dfe3e6" stroke="#060a0e" stroke-width="1"/>`;

ICONS.multimeter = () => `
  <rect x="-16" y="-13" width="32" height="26" rx="3" fill="url(#safetyYellowSurface)" ${OUTLINE}/>
  <path d="M-12-10 H9" stroke="#ffffff" stroke-width="1.2" opacity=".55"/>
  <rect x="-11" y="-9" width="22" height="10" rx="1.5" fill="url(#screenSurface)"/>
  <text x="0" y="-1.5" font-size="6" fill="#7fffb0" text-anchor="middle" font-family="Space Mono, monospace">0.00</text>
  <circle cx="0" cy="6" r="4.5" fill="url(#darkMetalSurface)" stroke="#0c0f12" stroke-width="1"/>
  <line x1="-6" y1="13" x2="-10" y2="20" stroke="#1d2731" stroke-width="2"/>
  <line x1="6" y1="13" x2="10" y2="20" stroke="#c64246" stroke-width="2"/>`;

ICONS.breadboard = () => `
  <rect x="-24" y="-14" width="48" height="28" rx="2" fill="url(#whitePlasticSurface)" ${OUTLINE}/>
  <path d="M-20-10 H20" stroke="#f8fcff" stroke-width="1" opacity=".7"/>
  <rect x="-24" y="-14" width="48" height="4" fill="#c9494b"/>
  <rect x="-24" y="10" width="48" height="4" fill="#23516e"/>
  ${dotGrid(-19,-6,19,6,7,3)}`;

ICONS.jumper_wires = () => `
  <path d="M -20 8 Q -6 -14 8 6 Q 16 16 24 -6" fill="none" stroke="#c94141" stroke-width="2.6"/>
  <path d="M-19 7 Q-6-12 8 6 Q16 15 23-5" fill="none" stroke="#ffaaa0" stroke-width=".75" opacity=".62"/>
  <path d="M -18 10 Q -2 14 10 -8 Q 18 -18 26 2" fill="none" stroke="#3f97c7" stroke-width="2.6"/>
  <path d="M-17 9 Q-2 12 10-8 Q18-16 25 2" fill="none" stroke="#a5e3ff" stroke-width=".75" opacity=".62"/>
  <path d="M -22 2 Q -4 -6 6 12 Q 14 20 22 8" fill="none" stroke="#e0c23a" stroke-width="2.6"/>
  <path d="M-21 1 Q-4-4 6 12 Q14 19 21 8" fill="none" stroke="#fff0a0" stroke-width=".75" opacity=".62"/>
  <circle cx="-20" cy="8" r="2" fill="#333"/><circle cx="24" cy="-6" r="2" fill="#333"/>
  <circle cx="-18" cy="10" r="2" fill="#333"/><circle cx="26" cy="2" r="2" fill="#333"/>
  <circle cx="-22" cy="2" r="2" fill="#333"/><circle cx="22" cy="8" r="2" fill="#333"/>`;

ICONS.arduino_board = () => `
  <rect x="-24" y="-15" width="48" height="30" rx="2.5" fill="url(#greenPcbSurface)" ${OUTLINE}/>
  <path d="M-20-11 H18" stroke="#9de3ef" stroke-width="1" opacity=".35"/>
  <rect x="-19" y="-10" width="12" height="8" fill="url(#darkMetalSurface)"/>
  <circle cx="10" cy="-8" r="3.4" fill="#2f6fd6"/>
  ${pinsSide(24,15,8,'b')}
  <circle cx="-19" cy="10" r="1.4" fill="#46bbdf"/><circle cx="19" cy="10" r="1.4" fill="#46bbdf"/>`;

ICONS.ethernet_cable = () => `
  <path d="M -26 6 Q -8 -14 12 2 Q 22 10 28 -4" fill="none" stroke="#e2c23a" stroke-width="4" stroke-linecap="round"/>
  <path d="M-22 5 Q-7-10 12 3 Q22 10 27-3" fill="none" stroke="#fff1a5" stroke-width="1" stroke-linecap="round" opacity=".66"/>
  <rect x="24" y="-9" width="10" height="10" rx="1" fill="#e7e9e0" ${OUTLINE_T}/>
  <rect x="26" y="-7" width="2" height="6" fill="#46bbdf"/>`;

ICONS.router = () => `
  <rect x="-22" y="-8" width="44" height="16" rx="3" fill="url(#metalSurface)" ${OUTLINE}/>
  <path d="M-18-5 H15" stroke="#f5fbff" stroke-width="1" opacity=".6"/>
  <line x1="-14" y1="-8" x2="-19" y2="-22" stroke="#33393f" stroke-width="2"/>
  <line x1="14" y1="-8" x2="19" y2="-22" stroke="#33393f" stroke-width="2"/>
  <circle cx="-19" cy="-22" r="1.6" fill="#33393f"/><circle cx="19" cy="-22" r="1.6" fill="#33393f"/>
  <circle cx="-12" cy="0" r="1.8" fill="#3dffb0"/><circle cx="-4" cy="0" r="1.8" fill="#3dffb0"/><circle cx="4" cy="0" r="1.8" fill="#3ff0ff"/>`;

ICONS.network_switch = () => `
  <rect x="-26" y="-9" width="52" height="18" rx="2" fill="url(#darkMetalSurface)" ${OUTLINE}/>
  <path d="M-22-6 H22" stroke="#a2b5c3" stroke-width=".9" opacity=".35"/>
  ${ledRow(-21,0,7,7)}`;

ICONS.ram_module = () => `
  <rect x="-26" y="-6" width="52" height="12" rx="1" fill="url(#greenPcbSurface)" ${OUTLINE}/>
  <path d="M-23-4 H23" stroke="#9de3ef" stroke-width=".8" opacity=".3"/>
  ${chipRow(-20,0,5,7)}
  ${pinsSide(26,6,10,'b')}`;

ICONS.ssd = () => `
  <rect x="-16" y="-11" width="32" height="22" rx="2" fill="url(#darkMetalSurface)" ${OUTLINE}/>
  <path d="M-12-8 H11" stroke="#d8e3eb" stroke-width=".8" opacity=".5"/>
  <rect x="-11" y="-6" width="22" height="3" fill="#3ff0ff" opacity="0.6"/>
  <text x="0" y="7" font-size="6" fill="#9fb0ba" text-anchor="middle" font-family="Space Mono, monospace">SSD</text>`;

ICONS.hard_drive = () => `
  <rect x="-18" y="-11" width="36" height="22" rx="2" fill="url(#metalSurface)" ${OUTLINE}/>
  <path d="M-14-8 H13" stroke="#f3f8fb" stroke-width=".8" opacity=".55"/>
  <circle cx="-4" cy="0" r="7" fill="url(#darkMetalSurface)" stroke="#20262b" stroke-width="1.2"/>
  <circle cx="-4" cy="0" r="2" fill="#c7cdd2"/>
  <rect x="8" y="-6" width="6" height="12" fill="url(#plasticSurface)"/>`;

ICONS.usb_flash_drive = () => `
  <rect x="-10" y="-6" width="20" height="12" rx="2.5" fill="url(#plasticSurface)" ${OUTLINE_T}/>
  <path d="M-7-3.5 H5" stroke="#d4e6ee" stroke-width=".8" opacity=".45"/>
  <rect x="9" y="-3" width="7" height="6" fill="url(#metalSurface)"/>
  <circle cx="-14" cy="0" r="3" fill="none" stroke="#9aa4ab" stroke-width="1.6"/>
  <circle cx="0" cy="-2" r="1.2" fill="#3dffb0"/>`;

ICONS.cooling_fan = () => `
  <circle cx="0" cy="0" r="15" fill="url(#darkMetalSurface)" ${OUTLINE}/>
  ${fanBlades()}
  <circle cx="0" cy="0" r="4" fill="url(#metalSurface)" stroke="#0c0f12" stroke-width="1"/>
  <circle cx="-13" cy="-13" r="1.4" fill="#4a5158"/><circle cx="13" cy="-13" r="1.4" fill="#4a5158"/>
  <circle cx="-13" cy="13" r="1.4" fill="#4a5158"/><circle cx="13" cy="13" r="1.4" fill="#4a5158"/>`;

ICONS.network_card = () => `
  <rect x="-22" y="-13" width="44" height="24" rx="1.5" fill="url(#greenPcbSurface)" ${OUTLINE}/>
  <path d="M-18-10 H18" stroke="#9de3ef" stroke-width=".8" opacity=".32"/>
  <rect x="-22" y="9" width="14" height="6" fill="url(#metalSurface)"/>
  <circle cx="4" cy="-2" r="4" fill="url(#darkMetalSurface)"/>
  ${chipRow(-14,-8,4,5)}`;

ICONS.raspberry_pi = () => `
  <rect x="-20" y="-13" width="40" height="26" rx="2" fill="url(#greenPcbSurface)" ${OUTLINE}/>
  <path d="M-16-10 H15" stroke="#9de3ef" stroke-width=".8" opacity=".32"/>
  <rect x="-15" y="-8" width="10" height="10" fill="url(#darkMetalSurface)"/>
  ${pinsSide(20,13,10,'t')}
  <circle cx="10" cy="6" r="3" fill="#c7cdd2" stroke="#20262b" stroke-width="1"/>`;

ICONS.cpu = () => `
  <rect x="-16" y="-16" width="32" height="32" rx="1.5" fill="url(#ceramicSurface)" ${OUTLINE}/>
  <path d="M-11-12 H10" stroke="#ffffff" stroke-width="1" opacity=".75"/>
  ${pinsSide(16,16,6,'l')}${pinsSide(16,16,6,'r')}${pinsSide(16,16,6,'t')}${pinsSide(16,16,6,'b')}
  <rect x="-9" y="-9" width="18" height="18" fill="url(#darkMetalSurface)"/>
  <circle cx="-13" cy="-13" r="1.6" fill="#c94141"/>`;

ICONS.gpu = () => `
  <rect x="-30" y="-11" width="60" height="22" rx="2" fill="url(#plasticSurface)" ${OUTLINE}/>
  <path d="M-26-8 H25" stroke="#c3d5df" stroke-width=".8" opacity=".4"/>
  <circle cx="-14" cy="0" r="8" fill="url(#darkMetalSurface)" stroke="#0c0f12" stroke-width="1"/>
  <circle cx="10" cy="0" r="8" fill="url(#darkMetalSurface)" stroke="#0c0f12" stroke-width="1"/>
  <rect x="-30" y="11" width="10" height="5" fill="url(#metalSurface)"/>
  <rect x="24" y="-15" width="6" height="4" fill="#3dffb0"/>`;

ICONS.microcontroller = () => `
  <rect x="-11" y="-14" width="22" height="28" rx="1.5" fill="url(#darkMetalSurface)" ${OUTLINE}/>
  ${pinsSide(11,14,7,'l')}${pinsSide(11,14,7,'r')}
  <circle cx="-6" cy="-9" r="1.4" fill="#46bbdf"/>`;

ICONS.pcb = () => `
  <rect x="-24" y="-16" width="48" height="32" rx="1.5" fill="url(#greenPcbSurface)" ${OUTLINE}/>
  <path d="M -18 -10 H 0 V 4 H 14" fill="none" stroke="#c79b58" stroke-width="1.6"/>
  <path d="M -18 10 H -4 V -6 H 10" fill="none" stroke="#c79b58" stroke-width="1.6"/>
  <circle cx="-18" cy="-10" r="1.6" fill="#d8b772"/><circle cx="14" cy="4" r="1.6" fill="#d8b772"/>
  <circle cx="-18" cy="10" r="1.6" fill="#d8b772"/><circle cx="10" cy="-6" r="1.6" fill="#d8b772"/>
  <rect x="-6" y="-16" width="10" height="6" fill="#111214"/>`;

ICONS.oscilloscope_probe = () => `
  <path d="M -24 10 Q -6 -6 10 -10" fill="none" stroke="#33393f" stroke-width="3" stroke-linecap="round"/>
  <path d="M-23 9 Q-6-5 9-10" fill="none" stroke="#99a8b3" stroke-width=".8" stroke-linecap="round" opacity=".55"/>
  <rect x="8" y="-16" width="9" height="20" rx="2" fill="url(#safetyYellowSurface)" ${OUTLINE_T}/>
  <path d="M10-13 H15" stroke="#d8eaf2" stroke-width=".8" opacity=".5"/>
  <line x1="12.5" y1="4" x2="12.5" y2="14" stroke="#46bbdf" stroke-width="2"/>
  <circle cx="-24" cy="10" r="2.4" fill="#111214"/>`;

ICONS.transistor = () => `
  <path d="M -10 6 A 10 10 0 1 1 10 6 Z" fill="url(#plasticSurface)" ${OUTLINE_T}/>
  <path d="M-5-5 Q0-9 5-5" fill="none" stroke="#b1c8d5" stroke-width=".8" opacity=".45"/>
  <line x1="-5" y1="8" x2="-5" y2="20" stroke="url(#metalSurface)" stroke-width="1.8"/>
  <line x1="0" y1="10" x2="0" y2="20" stroke="url(#metalSurface)" stroke-width="1.8"/>
  <line x1="5" y1="8" x2="5" y2="20" stroke="url(#metalSurface)" stroke-width="1.8"/>`;

ICONS.logic_gate_chip = () => `
  <rect x="-15" y="-11" width="30" height="22" rx="1.5" fill="url(#darkMetalSurface)" ${OUTLINE}/>
  ${pinsSide(15,11,5,'l')}${pinsSide(15,11,5,'r')}
  <path d="M -6 -6 H 0 A 6 6 0 0 1 0 6 H -6 Z" fill="none" stroke="#7fdca0" stroke-width="1.4"/>`;

ICONS.sensor = () => `
  <rect x="-11" y="-9" width="22" height="18" rx="2" fill="url(#darkMetalSurface)" ${OUTLINE_T}/>
  <path d="M-8-6 H7" stroke="#c4d6e0" stroke-width=".8" opacity=".35"/>
  <circle cx="0" cy="0" r="6" fill="url(#screenSurface)" stroke="#0c0f12" stroke-width="1"/>
  <circle cx="-1.4" cy="-1.5" r="2.4" fill="#8de9ff" opacity=".86"/>
  <circle cx="1.3" cy="1.3" r="1.2" fill="#173748"/>
  ${pinsSide(11,9,3,'b')}`;

ICONS.fiber_optic_cable = () => `
  <path d="M -26 4 Q -6 -16 16 0" fill="none" stroke="#e3c74c" stroke-width="4" stroke-linecap="round"/>
  <path d="M-24 3 Q-6-14 15 0" fill="none" stroke="#fff0a0" stroke-width=".9" stroke-linecap="round" opacity=".62"/>
  <circle cx="18" cy="1" r="4" fill="#6fe0ff" opacity="0.85"/>
  <circle cx="18" cy="1" r="7" fill="none" stroke="#6fe0ff" stroke-width="1" opacity="0.4"/>`;

ICONS.power_supply = () => `
  <rect x="-22" y="-14" width="44" height="28" rx="2" fill="url(#metalSurface)" ${OUTLINE}/>
  <path d="M-18-11 H17" stroke="#f2f8fb" stroke-width=".9" opacity=".52"/>
  ${ventLines(-16,-8,32,16)}
  <path d="M 22 4 Q 30 4 30 14" fill="none" stroke="#111214" stroke-width="2.4"/>`;

ICONS.eeprom_chip = () => `
  <rect x="-17" y="-10" width="34" height="20" rx="1" fill="url(#darkMetalSurface)" ${OUTLINE}/>
  ${pinsSide(17,10,4,'l')}${pinsSide(17,10,4,'r')}
  <path d="M-11-5h22M-11 5h14" stroke="#8bc5b7" stroke-width="1" opacity=".7"/>
  <text x="1" y="2.5" text-anchor="middle" font-size="6" fill="#a5e9cd" font-family="Space Mono, monospace">16K</text>`;
ICONS.timer_ic = () => `
  <rect x="-13" y="-10" width="26" height="20" rx="1" fill="url(#darkMetalSurface)" ${OUTLINE}/>
  ${pinsSide(13,10,4,'l')}${pinsSide(13,10,4,'r')}
  <circle cx="-9" cy="-6" r="1.5" fill="#e7b36b"/>
  <text x="1" y="3" text-anchor="middle" font-size="8" fill="#f0d198" font-family="Space Mono, monospace">555</text>`;
ICONS.ceramic_capacitor = () => `
  <path d="M-6 10v13M6 10v13" stroke="#a8b8bb" stroke-width="2"/>
  <path d="M-11-7q0-7 11-7T11-7v17q-11 7-22 0z" fill="#d49b56" ${OUTLINE}/>
  <path d="M-7-8q7-4 14 0" fill="none" stroke="#ffe4a4" stroke-width="1.5" opacity=".7"/>`;
ICONS.relay = () => `
  <rect x="-18" y="-13" width="36" height="26" rx="2" fill="#315b69" ${OUTLINE}/>
  <rect x="-14" y="-9" width="28" height="18" rx="1" fill="#6ea8ae" opacity=".8"/>
  <path d="M-9 4h18M-8-4l8 8 8-8" fill="none" stroke="#cce6de" stroke-width="1.5"/>
  ${pinsSide(18,13,3,'b')}`;
ICONS.heatsink = () => `
  <rect x="-20" y="6" width="40" height="9" rx="1" fill="url(#darkMetalSurface)" ${OUTLINE}/>
  ${[-16,-10,-4,2,8,14].map(x=>`<path d="M${x} 6V-14h4V6" fill="url(#metalSurface)" stroke="#14202a" stroke-width="1"/>`).join('')}`;
ICONS.fuse = () => `
  <path d="M-27 0h7m40 0h7" stroke="#aebfc2" stroke-width="3"/>
  <rect x="-20" y="-6" width="40" height="12" rx="5" fill="#b7d9d6" fill-opacity=".72" ${OUTLINE_T}/>
  <path d="M-14 0h28" stroke="#d27b56" stroke-width="1.5"/>
  <path d="M-19-6v12m38-12v12" stroke="#7c9198" stroke-width="5"/>`;
ICONS.rj45_jack = () => `
  <path d="M-18-12h36v24h-36z" fill="url(#metalSurface)" ${OUTLINE}/>
  <path d="M-12-8h24v15h-24z" fill="#153849" stroke="#91abb1" stroke-width="1.3"/>
  ${[-8,-4,0,4,8].map(x=>`<path d="M${x}-7v5" stroke="#d9b067" stroke-width="1.4"/>`).join('')}
  <path d="M-10 8h20" stroke="#a5dae0" stroke-width="2"/>`;
ICONS.logic_analyzer = () => `
  <rect x="-23" y="-12" width="46" height="24" rx="3" fill="url(#darkMetalSurface)" ${OUTLINE}/>
  <rect x="-18" y="-8" width="28" height="16" fill="#0d3444"/>
  <path d="M-16 2h7v-5h6v7h7v-6h5" fill="none" stroke="#81e8c9" stroke-width="1.6"/>
  <circle cx="17" cy="-5" r="2" fill="#f2bb6b"/><circle cx="17" cy="3" r="2" fill="#75d8e9"/>`;
ICONS.stepper_motor = () => `
  <rect x="-15" y="-14" width="30" height="28" rx="3" fill="url(#metalSurface)" ${OUTLINE}/>
  <circle r="10" fill="#334957" stroke="#bbced0" stroke-width="2"/><circle r="4" fill="#d9b672"/>
  <path d="M15-5h13M15 4h13" stroke="#e18965" stroke-width="2.5"/>
  <path d="M-11-17v3m8-3v3m8-3v3m8-3v3" stroke="#71858c" stroke-width="3"/>`;
ICONS.voltage_regulator = () => `
  <rect x="-12" y="-15" width="24" height="27" rx="1" fill="url(#darkMetalSurface)" ${OUTLINE}/>
  <rect x="-12" y="-15" width="24" height="6" fill="url(#metalSurface)"/>
  <circle cx="0" cy="-12" r="1.7" fill="#162531"/>
  <path d="M-7 12v10M0 12v10M7 12v10" stroke="#aeb8bb" stroke-width="2"/>
  <text x="0" y="3" text-anchor="middle" font-size="6" fill="#b4e0cc" font-family="Space Mono, monospace">5V</text>`;

/* ============================================================
   STRUCTURAL / DECORATIVE SCENE HELPERS
   ============================================================ */
function defsBlock(){
  return `<defs>
    <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${defsBlock.wallTop||'#0a121c'}"/>
      <stop offset="100%" stop-color="${defsBlock.wallBottom||'#050a10'}"/>
    </linearGradient>
    <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${defsBlock.floorTop||'#12181f'}"/>
      <stop offset="100%" stop-color="${defsBlock.floorBottom||'#060a0e'}"/>
    </linearGradient>
    <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#bffcff" stop-opacity="0.9"/>
      <stop offset="45%" stop-color="#3ff0ff" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#0d2b30" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="metalSurface" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#d8e3eb"/>
      <stop offset="18%" stop-color="#8c9eaa"/>
      <stop offset="54%" stop-color="#536370"/>
      <stop offset="78%" stop-color="#a8b6c0"/>
      <stop offset="100%" stop-color="#53626e"/>
    </linearGradient>
    <linearGradient id="darkMetalSurface" x1="0" y1="0" x2="0.9" y2="1">
      <stop offset="0%" stop-color="#62788a"/>
      <stop offset="24%" stop-color="#30465a"/>
      <stop offset="70%" stop-color="#111c28"/>
      <stop offset="100%" stop-color="#425565"/>
    </linearGradient>
    <linearGradient id="plasticSurface" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#71889a"/>
      <stop offset="22%" stop-color="#354a5e"/>
      <stop offset="68%" stop-color="#172432"/>
      <stop offset="100%" stop-color="#0b121a"/>
    </linearGradient>
    <linearGradient id="circuitSurface" x1="0" y1="0" x2="0.8" y2="1">
      <stop offset="0%" stop-color="#347f90"/>
      <stop offset="30%" stop-color="#1b5266"/>
      <stop offset="100%" stop-color="#102c3d"/>
    </linearGradient>
    <linearGradient id="screenSurface" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#143d4d"/>
      <stop offset="34%" stop-color="#071923"/>
      <stop offset="100%" stop-color="#0e2c3b"/>
    </linearGradient>
    <linearGradient id="ceramicSurface" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f0f4f6"/>
      <stop offset="26%" stop-color="#bdcbd4"/>
      <stop offset="68%" stop-color="#8597a3"/>
      <stop offset="100%" stop-color="#d4dfe5"/>
    </linearGradient>
    <linearGradient id="whitePlasticSurface" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="28%" stop-color="#eef1ec"/>
      <stop offset="75%" stop-color="#cbd2d1"/>
      <stop offset="100%" stop-color="#f4f6f2"/>
    </linearGradient>
    <linearGradient id="resistorSurface" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff4d6"/>
      <stop offset="30%" stop-color="#dfc99b"/>
      <stop offset="72%" stop-color="#c4a878"/>
      <stop offset="100%" stop-color="#f0dfb9"/>
    </linearGradient>
    <linearGradient id="greenPcbSurface" x1="0" y1="0" x2="0.8" y2="1">
      <stop offset="0%" stop-color="#5b9a70"/>
      <stop offset="28%" stop-color="#31704f"/>
      <stop offset="100%" stop-color="#164331"/>
    </linearGradient>
    <linearGradient id="safetyYellowSurface" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffe16a"/>
      <stop offset="26%" stop-color="#ecc23c"/>
      <stop offset="72%" stop-color="#bd861e"/>
      <stop offset="100%" stop-color="#f4cf48"/>
    </linearGradient>
    <linearGradient id="redGripSurface" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ed7468"/>
      <stop offset="30%" stop-color="#b83d45"/>
      <stop offset="100%" stop-color="#692637"/>
    </linearGradient>
    <pattern id="hazardPat" width="16" height="16" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
      <rect width="16" height="16" fill="#101a27"/>
      <rect width="8" height="16" fill="#237ea1"/>
    </pattern>
    <filter id="softBlur" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="16"/>
    </filter>
  </defs>`;
}
function wallFloor(wallTop,wallBottom,floorTop,floorBottom){
  defsBlock.wallTop=wallTop; defsBlock.wallBottom=wallBottom;
  defsBlock.floorTop=floorTop; defsBlock.floorBottom=floorBottom;
  let s = `<rect x="0" y="0" width="1600" height="580" fill="url(#wallGrad)"/>`;
  s += `<rect x="0" y="580" width="1600" height="320" fill="url(#floorGrad)"/>`;
  for(let i=0;i<7;i++){
    const y = 600+i*44;
    s+=`<line x1="0" y1="${y}" x2="1600" y2="${y}" stroke="#000" stroke-opacity="0.16" stroke-width="1"/>`;
  }
  return s;
}
function shelfUnit(x,y,w,h,shelves){
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#141d29" stroke="#0a0f16" stroke-width="2"/>`;
  for(let i=1;i<shelves;i++){
    const sy = y + h*(i/shelves);
    s+=`<rect x="${x}" y="${sy-3}" width="${w}" height="6" fill="#2a3644"/>`;
  }
  s+=`<rect x="${x}" y="${y}" width="8" height="${h}" fill="#0d141c"/>`;
  s+=`<rect x="${x+w-8}" y="${y}" width="8" height="${h}" fill="#0d141c"/>`;
  return s;
}
function workbench(x,y,w,h){
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#232e3b" stroke="#0a0f16" stroke-width="2"/>`;
  s+= `<rect x="${x}" y="${y}" width="${w}" height="10" fill="#3c4c5c"/>`;
  s+= `<rect x="${x+20}" y="${y+h}" width="14" height="40" fill="#141d29"/>`;
  s+= `<rect x="${x+w-34}" y="${y+h}" width="14" height="40" fill="#141d29"/>`;
  return s;
}
function pegboardPanel(x,y,w,h){
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#182531" stroke="#0a0f16" stroke-width="2"/>`;
  const cols=Math.floor(w/38), rows=Math.floor(h/38);
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      s+=`<circle cx="${x+24+c*38}" cy="${y+24+r*38}" r="2" fill="#0a0f16"/>`;
    }
  }
  return s;
}
function serverRack(x,y,w,h,rows){
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#141a20" stroke="#080b0e" stroke-width="3"/>`;
  const rh = h/rows;
  for(let i=0;i<rows;i++){
    const ry = y+i*rh;
    s+=`<rect x="${x+6}" y="${ry+4}" width="${w-12}" height="${rh-8}" fill="#1c242c" stroke="#0a0f14" stroke-width="1"/>`;
    if(Math.random()<0.6){
      const c = Math.random()<0.5?'#3dffb0':(Math.random()<0.5?'#3ff0ff':'#ffb545');
      s+=`<circle cx="${x+w-18}" cy="${ry+rh/2}" r="2.4" fill="${c}" class="blink-led" style="animation-delay:${(Math.random()*3).toFixed(2)}s"/>`;
    }
    s+=`<rect x="${x+16}" y="${ry+rh/2-1}" width="${w-70}" height="2" fill="#2a333c"/>`;
  }
  return s;
}
function table(x,y,w,h){
  let s=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#1c2733" stroke="#0a0f16" stroke-width="2"/>`;
  s+=`<rect x="${x+10}" y="${y+h}" width="10" height="30" fill="#0d141c"/>`;
  s+=`<rect x="${x+w-20}" y="${y+h}" width="10" height="30" fill="#0d141c"/>`;
  return s;
}
function cableDrape(x1,y1,x2,y2,sag,color,w){
  color = color||'#20262b'; w = w||4;
  const mx=(x1+x2)/2, my=(y1+y2)/2+sag;
  return `<path d="M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" opacity="0.9"/>`;
}
function hazardStripe(x,y,w,h){
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#hazardPat)" opacity="0.85"/>`;
}
function ventGrate(x,y,w,h){
  let s=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#141a1f" stroke="#0a0f14" stroke-width="1.5"/>`;
  const n=Math.floor(w/10);
  for(let i=0;i<n;i++) s+=`<line x1="${x+8+i*10}" y1="${y+3}" x2="${x+8+i*10}" y2="${y+h-3}" stroke="#0a0f14" stroke-width="2"/>`;
  return s;
}
function glowPatch(x,y,r,color,opacity){
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="${opacity==null?0.2:opacity}" filter="url(#softBlur)"/>`;
}
function dustParticles(n,w,h){
  let s='';
  for(let i=0;i<n;i++){
    const x=rand(20,w-20), y=rand(20,h-20), r=rand(1,2.4), dur=rand(6,14), delay=rand(0,8);
    s+=`<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}" fill="#9fd9e6" opacity="0.22" class="dust-particle" style="animation-duration:${dur.toFixed(1)}s; animation-delay:-${delay.toFixed(1)}s"/>`;
  }
  return s;
}
function quantumCore(x,y){
  return `<g transform="translate(${x},${y})">
    <circle r="170" fill="none" stroke="#3ff0ff" stroke-width="1.5" opacity="0.2"/>
    <circle r="120" fill="none" stroke="#38ffb0" stroke-width="1.5" opacity="0.28"/>
    <circle r="72" fill="url(#coreGrad)" class="core-pulse"/>
    <circle r="72" fill="none" stroke="#3ff0ff" stroke-width="2" opacity="0.6"/>
  </g>`;
}
function circuitTraces(x,y,w,h){
  let s='';
  for(let i=0;i<6;i++){
    const yy = y+(h/6)*i+rand(-8,8);
    const x1=x+rand(0,80), x2=x+w-rand(0,80);
    const midx=(x1+x2)/2;
    s+=`<path d="M ${x1} ${yy} H ${midx-40} V ${yy-26} H ${midx+40} V ${yy} H ${x2}" fill="none" stroke="#1c3f4a" stroke-width="1.4" opacity="0.5"/>`;
  }
  return s;
}
function conduitLine(x1,y1,x2,y2){
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#3ff0ff" stroke-width="2" opacity="0.32" class="conduit-glow"/>`;
}

function monitorStation(x,y,scale=1,screen='#67d7ef'){
  let keys='';
  for(let row=0;row<3;row++){
    for(let col=0;col<13;col++){
      keys+=`<rect x="${-78+col*12}" y="${61+row*8}" width="8" height="4" rx="1" fill="${(row+col)%5===0?'#71869b':'#131c27'}"/>`;
    }
  }
  return `<g transform="translate(${x},${y}) scale(${scale})">
    <ellipse cx="0" cy="92" rx="120" ry="12" fill="#02060b" opacity=".48"/>
    <rect x="-98" y="-90" width="196" height="132" rx="7" fill="#1b2938" stroke="#080e16" stroke-width="5"/>
    <rect x="-84" y="-77" width="168" height="104" rx="2" fill="#07131c" stroke="#526b80" stroke-width="3"/>
    <path d="M-72-59 H54 M-72-48 H27 M-72-37 H70 M-72-26 H14 M-72-15 H58 M-72-4 H-3 M-72 7 H40" fill="none" stroke="${screen}" stroke-width="2" opacity=".58"/>
    <path d="M-65 11 L-42 2 L-24 7 L-3 -8 L16 -3 L35 -17 L61 -11" fill="none" stroke="#54cde8" stroke-width="2.4" opacity=".72"/>
    <circle cx="72" cy="34" r="3" fill="#3ff0ff"/>
    <path d="M-24 42 V55 L-43 61 H43 L24 55 V42" fill="#435a70" stroke="#111b28" stroke-width="3"/>
    <path d="M-110 61 Q-110 56 -103 56 H103 Q110 56 110 63 L101 87 H-101 Z" fill="#26394d" stroke="#111b28" stroke-width="3"/>
    ${keys}
    <rect x="-15" y="85" width="30" height="3" rx="1" fill="#7894aa"/>
  </g>`;
}

function partsOrganizer(x,y,cols=10,rows=3,cellW=40,cellH=35){
  const width=cols*cellW, height=rows*cellH;
  let s=`<g transform="translate(${x},${y})"><rect width="${width}" height="${height}" rx="3" fill="#111d2a" stroke="#070d15" stroke-width="6"/><rect x="5" y="5" width="${width-10}" height="${height-10}" fill="#344c63"/>`;
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
    const bx=8+c*cellW, by=8+r*cellH, tint=(r+c)%4;
    const fills=['#26583f','#405a70','#1c4436','#344b61'];
    s+=`<rect x="${bx}" y="${by}" width="${cellW-4}" height="${cellH-4}" fill="${fills[tint]}" stroke="#0f1a27" stroke-width="2"/>`;
    if((r+c)%3===0){
      s+=`<circle cx="${bx+cellW*.34}" cy="${by+cellH*.52}" r="${3+(c%3)}" fill="#c6a96a"/><circle cx="${bx+cellW*.68}" cy="${by+cellH*.47}" r="3" fill="#6b9975"/>`;
    }else if((r+c)%3===1){
      const wire=['#d25d62','#56bddb','#dfbd4e'][c%3];
      s+=`<path d="M${bx+7} ${by+cellH*.65} q8 -14 16 0 t16 0" fill="none" stroke="${wire}" stroke-width="3"/>`;
    }else{
      s+=`<rect x="${bx+7}" y="${by+8}" width="${cellW-19}" height="${cellH-20}" rx="2" fill="#111923"/><circle cx="${bx+cellW-12}" cy="${by+cellH-10}" r="2" fill="${c%2?'#ffb545':'#3ff0ff'}"/>`;
    }
  }
  return s+'</g>';
}

function drawerBank(x,y,w=340,rows=4,cols=3){
  const gap=7, pad=10, drawerW=(w-pad*2-gap*(cols-1))/cols, drawerH=42;
  let s=`<g transform="translate(${x},${y})"><rect width="${w}" height="${rows*(drawerH+gap)+pad}" rx="4" fill="#101a27" stroke="#070d15" stroke-width="7"/><rect x="8" y="8" width="${w-16}" height="${rows*(drawerH+gap)+pad-16}" fill="#25394e"/>`;
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
    const dx=pad+c*(drawerW+gap), dy=pad+r*(drawerH+gap);
    s+=`<rect x="${dx}" y="${dy}" width="${drawerW}" height="${drawerH}" rx="2" fill="${(r+c)%2?'#1a2b3e':'#30475e'}" stroke="#0d1723" stroke-width="2"/><rect x="${dx+drawerW*.3}" y="${dy+6}" width="${drawerW*.4}" height="8" rx="1" fill="#8299ad"/><circle cx="${dx+drawerW/2}" cy="${dy+27}" r="3" fill="#3ff0ff"/><path d="M${dx+6} ${dy+drawerH-5} H${dx+drawerW-6}" stroke="#122235" stroke-width="2"/>`;
  }
  return s+'</g>';
}

function computerTower(x,y,scale=1){
  return `<g transform="translate(${x},${y}) scale(${scale})">
    <ellipse cx="0" cy="12" rx="91" ry="17" fill="#02060b" opacity=".48"/>
    <path d="M-72-146 L62-139 L75 2 L-78 10 Z" fill="#24374c" stroke="#080f18" stroke-width="7"/>
    <path d="M-57-128 L47-123 L54-8 L-62-3 Z" fill="#101c2a" stroke="#69849b" stroke-width="3"/>
    <rect x="-45" y="-114" width="82" height="31" fill="#243a50" stroke="#0c1724" stroke-width="2"/>
    <circle cx="-18" cy="-99" r="10" fill="#101c2a" stroke="#718ba0" stroke-width="2"/><circle cx="-18" cy="-99" r="4" fill="#9acbe0"/>
    <rect x="-43" y="-69" width="75" height="5" fill="#7893a9"/><rect x="-43" y="-58" width="75" height="5" fill="#0d1722"/>
    <rect x="-44" y="-36" width="86" height="20" fill="#245a45" stroke="#0b1621" stroke-width="2"/>
    <path d="M-35-25 H-3 V-36 M-3-25 H23 V-16 M-22-16 V-6" fill="none" stroke="#c6a763" stroke-width="3"/>
    <circle cx="31" cy="-22" r="4" fill="#ff6679"/><circle cx="-33" cy="-22" r="4" fill="#3ff0ff"/>
    <path d="M58-119 l24 13 v111 l-26-4" fill="#18283a" stroke="#080f18" stroke-width="4"/>
    <path d="M-54 13 H57 L73 23 H-68 Z" fill="#425a71" stroke="#111b28" stroke-width="3"/>
  </g>`;
}

function hangingTools(x,y){
  return `<g transform="translate(${x},${y})">
    <rect width="300" height="190" fill="#1a2b3e" stroke="#080f18" stroke-width="6"/>
    <path d="M25 0 V190 M75 0 V190 M125 0 V190 M175 0 V190 M225 0 V190 M275 0 V190" stroke="#30465b" stroke-width="2" opacity=".8"/>
    <path d="M44 28 V105 M35 28 H53 M34 105 L44 119 L54 105 M100 28 L126 75 L112 88 L87 42 M163 26 V116 M151 26 H175 M152 116 Q163 130 174 116 M211 28 V104 M197 28 H225 M197 104 Q211 119 225 104 M256 31 Q242 60 256 86 V125" fill="none" stroke="#8da6bb" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M32 145 H72 M93 150 H128 M145 144 H181 M195 151 H230 M242 145 H274" stroke="#101c2a" stroke-width="5"/>
  </g>`;
}

function oscilloscopeUnit(x,y,scale=1){
  return `<g transform="translate(${x},${y}) scale(${scale})">
    <path d="M-102-70 H93 L105 75 H-110 Z" fill="#2b3e53" stroke="#0b1420" stroke-width="6"/>
    <rect x="-87" y="-53" width="115" height="83" rx="2" fill="#07131c" stroke="#6f8ca3" stroke-width="4"/>
    <path d="M-78-10 H-51 L-41-28 L-22 11 L-5-20 L8 0 H20" fill="none" stroke="#5ce0f5" stroke-width="4"/>
    <circle cx="57" cy="-29" r="12" fill="#839caf" stroke="#172639" stroke-width="3"/><circle cx="57" cy="11" r="10" fill="#4d6880" stroke="#172639" stroke-width="3"/>
    <circle cx="88" cy="-40" r="4" fill="#ff6679"/><circle cx="88" cy="-21" r="4" fill="#3ff0ff"/>
    <path d="M-85 45 H82 M-72 59 H75" stroke="#1a2b3e" stroke-width="5"/>
  </g>`;
}

/* ============================================================
   PER-LEVEL BACKGROUNDS
   ============================================================ */
function buildBgHardwareBay(){
  let s = wallFloor('#101d2b','#09121d','#172638','#080e17');
  s += `<path d="M0 94 H1600 M0 495 H1600" stroke="#0a131e" stroke-width="18"/><path d="M0 102 H1600 M0 503 H1600" stroke="#3e607a" stroke-width="5" opacity=".7"/>`;
  s += `<rect x="40" y="34" width="410" height="24" rx="4" fill="#65839b" opacity=".65"/><rect x="66" y="39" width="358" height="14" rx="7" fill="#a4e9f7" opacity=".5"/>`;
  s += shelfUnit(30,120,1540,340,4);
  s += partsOrganizer(74,157,12,3,40,34);
  s += hangingTools(1010,146);
  s += `<rect x="528" y="160" width="430" height="260" fill="#111d2a" stroke="#09121d" stroke-width="8"/><path d="M548 183 H938 M548 205 H938 M548 227 H938 M548 249 H938 M548 271 H938" stroke="#293d52" stroke-width="8"/>`;
  s += monitorStation(300,365,0.88,'#67d7ef');
  s += monitorStation(748,361,0.73,'#82e9f2');
  s += workbench(18,596,1564,150);
  s += drawerBank(58,448,390,3,4);
  s += oscilloscopeUnit(955,544,0.76);
  s += computerTower(1330,554,0.92);
  s += partsOrganizer(475,574,12,3,42,28);
  s += `<path d="M0 752 H1600 V900 H0 Z" fill="#0c1723" opacity=".96"/><path d="M0 752 H1600" stroke="#070d15" stroke-width="14"/>`;
  s += `<path d="M90 797 C150 744 170 853 242 802 S336 787 390 842 M515 766 C464 824 573 843 615 790 S701 812 752 852 M1010 782 C1070 841 1112 753 1171 813 S1276 854 1334 796" fill="none" stroke="#1d3b52" stroke-width="13" stroke-linecap="round"/>`;
  s += `<rect x="500" y="747" width="235" height="22" rx="3" fill="#405a70" stroke="#0d1723" stroke-width="4"/><path d="M520 755 H702" stroke="#74cce0" stroke-width="4" opacity=".6"/>`;
  s += cableDrape(82,545,455,566,65,'#55343d',9);
  s += cableDrape(870,520,1110,567,45,'#253e54',7);
  s += cableDrape(1230,450,1500,560,42,'#2d453a',8);
  s += ventGrate(1520,600,58,150);
  s += glowPatch(324,330,180,'#5fb9e5',0.09);
  s += glowPatch(1120,370,200,'#4ea9d8',0.07);
  s += dustParticles(20,1600,900);
  return s;
}
function buildBgServerRoom(){
  let s = wallFloor('#0b1420','#060b12','#101c2a','#050a11');
  s += `<path d="M0 86 H1600 M0 498 H1600" stroke="#060c14" stroke-width="24"/><path d="M0 93 H1600 M0 506 H1600" stroke="#304a63" stroke-width="4" opacity=".55"/>`;
  s += `<rect x="420" y="115" width="760" height="270" rx="8" fill="#101c2a" stroke="#070e17" stroke-width="10"/>`;
  for(let row=0;row<4;row++){
    s+=`<rect x="452" y="${147+row*54}" width="696" height="42" fill="#1a2a3c" stroke="#080f18" stroke-width="3"/><path d="M468 ${164+row*54} H1080 M468 ${174+row*54} H1020" stroke="#49637a" stroke-width="4" opacity=".55"/>`;
    s+=ledRow(1110,164+row*54,5,7);
  }
  s += serverRack(36,38,330,764,13);
  s += serverRack(1234,38,330,764,13);
  s += `<rect x="375" y="416" width="850" height="62" fill="#273d53" stroke="#0a121c" stroke-width="8"/><path d="M405 440 H1198" stroke="#7394ad" stroke-width="6" opacity=".58"/>`;
  s += monitorStation(802,393,0.74,'#6be0f4');
  s += workbench(360,610,880,125);
  s += drawerBank(420,504,300,2,4);
  s += oscilloscopeUnit(1008,548,0.65);
  s += partsOrganizer(748,589,9,3,42,25);
  s += computerTower(1205,606,0.74);
  s += `<path d="M0 805 H1600 V900 H0 Z" fill="#080f18" opacity=".94"/>`;
  s += cableDrape(320,250,445,600,74,'#111714',12);
  s += cableDrape(1260,312,1160,598,68,'#111714',11);
  s += cableDrape(690,470,420,604,34,'#1b2b3c',8);
  s += cableDrape(930,468,1100,611,46,'#132235',9);
  s += glowPatch(810,312,250,'#42b6eb',0.1);
  s += dustParticles(15,1600,900);
  s += `<rect x="670" y="39" width="258" height="18" rx="4" fill="#82c6e1" opacity=".42"/>`;
  return s;
}
function buildBgQuantumCore(){
  let s = wallFloor('#101727','#080d16','#172538','#070c14');
  s += `<rect x="0" y="0" width="1600" height="130" fill="#111c2a"/><path d="M0 134 H1600 M0 520 H1600" stroke="#090f18" stroke-width="20"/><path d="M0 142 H1600" stroke="#3c5c78" stroke-width="5" opacity=".62"/>`;
  s += circuitTraces(60,160,1480,280);
  s += shelfUnit(40,178,360,302,3);
  s += shelfUnit(1200,178,360,302,3);
  s += partsOrganizer(68,215,7,3,40,34);
  s += monitorStation(800,258,0.94,'#65e4f4');
  s += table(30,582,500,145);
  s += table(1070,582,500,145);
  s += oscilloscopeUnit(284,556,0.73);
  s += oscilloscopeUnit(1320,558,0.73);
  s += drawerBank(556,605,490,2,5);
  s += conduitLine(800,420,290,610);
  s += conduitLine(800,420,1310,610);
  s += quantumCore(800,420);
  s += `<path d="M0 770 H1600 V900 H0 Z" fill="#0a1420"/><path d="M0 770 H1600" stroke="#070d15" stroke-width="14"/>`;
  s += cableDrape(122,524,555,634,38,'#171d19',10);
  s += cableDrape(1458,520,1041,626,42,'#171d19',10);
  s += glowPatch(800,420,340,'#42bde8',0.14);
  s += dustParticles(18,1600,900);
  return s;
}

/* ============================================================
   LEVEL DATA
   ============================================================ */
const COMPONENT_NAMES = {
  microchip:'Microchip / IC', usb_drive:'USB Drive', usb_flash_drive:'USB Flash Drive',
  ram_module:'RAM Module', ssd:'SSD', cpu:'CPU', gpu:'GPU', pcb:'PCB',
  raspberry_pi:'Raspberry Pi', rj45_jack:'RJ45 Jack', eeprom_chip:'16K EEPROM Chip',
  timer_ic:'555 Timer IC'
};
const SEARCH_SPOTS = [
  [160,650,-8],[360,600,5],[570,660,-12],[760,615,8],[980,650,-5],[1220,610,10],
  [1450,650,-8],[240,760,12],[500,760,-5],[780,770,7],[1070,770,-9],[1370,770,4],
  [140,310,-12],[360,250,8],[590,300,-7],[830,260,11],[1070,310,-8],[1390,280,5],
  [250,430,9],[500,430,-10],[790,420,4],[1130,430,-6],[1400,430,12],
  [430,170,-8],[900,170,6],[1250,170,-11]
];
function makeSearchTargets(ids){
  return ids.map((id,index)=>{
    const [x,y,rot]=SEARCH_SPOTS[index];
    const label=COMPONENT_NAMES[id] || id.split('_').map(word=>word[0].toUpperCase()+word.slice(1)).join(' ');
    return {id,label,x,y,rot,scale:0.92+(index%4)*0.05};
  });
}
const LEVELS = [
  {
    key:'hardware-bay', name:'HARDWARE BAY', sceneLabel:'HARDWARE BAY · ROOM 1',
    time:225, hints:3, difficultyScale:1, buildBg:buildBgHardwareBay,
    mapSummary:'Search the COMPLAB 2 workbench for the first hardware and shutdown clues.',
    mapClue:'The error arrived from inside the lab network. The server logs are the next lead.',
    intro:{
      kicker:'CTU DANAO · INCIDENT 01', title:'THE COMPLAB 2 INCIDENT',
      text:"I'm Fiona, third-year Computer Engineering at CTU Danao. During our practical, a workstation flagged corrupted project files, unauthorized access, and the Circuit Secrets Protocol. Every computer shut down. After restart, our class files and several electronic parts were missing. I'm checking my bench first; a virus is a theory, not a result.",
      cta:'Begin Search'
    },
    clue:"All the monitors shut down in the same second; the circuit supply stayed in range. The hardware tag says CS-TRAIN, and a local log points to the server room. This warning came from inside the lab network, not a random virus.",
    targets:[
      {id:'resistor', label:'Resistor', x:240, y:650, scale:1.3, rot:8},
      {id:'capacitor', label:'Capacitor', x:1080, y:330, scale:1.2, rot:-10},
      {id:'microchip', label:'Microchip / IC', x:1300, y:650, scale:1.15, rot:5},
      {id:'usb_drive', label:'USB Drive', x:140, y:330, scale:1.1, rot:-8},
      {id:'soldering_iron', label:'Soldering Iron', x:400, y:685, scale:1.25, rot:-20},
      {id:'screwdriver', label:'Screwdriver', x:1460, y:150, scale:1.2, rot:25},
      {id:'multimeter', label:'Multimeter', x:800, y:770, scale:1.2, rot:4},
      {id:'breadboard', label:'Breadboard', x:1150, y:420, scale:1.15, rot:-4},
      {id:'jumper_wires', label:'Jumper Wires', x:430, y:220, scale:1.1, rot:10},
      {id:'arduino_board', label:'Arduino Board', x:1350, y:420, scale:1.1, rot:-6},
      {id:'hard_drive', label:'Hard Drive', x:80, y:790, scale:1.05, rot:-6},
      {id:'cooling_fan', label:'Cooling Fan', x:1540, y:300, scale:0.95, rot:0},
      {id:'pcb', label:'PCB', x:700, y:800, scale:0.95, rot:10},
      {id:'cpu', label:'CPU', x:780, y:180, scale:1.2, rot:0},
      {id:'timer_ic', label:'555 Timer IC', x:970, y:690, scale:1, rot:-8}
    ],
    decor:[
      {icon:'hard_drive', x:60, y:790, scale:1, rot:-6},
      {icon:'cooling_fan', x:1540, y:300, scale:0.9, rot:0},
      {icon:'power_supply', x:1200, y:640, scale:0.9, rot:0},
      {icon:'raspberry_pi', x:1220, y:790, scale:0.9, rot:-8},
      {icon:'pcb', x:700, y:800, scale:0.85, rot:10},
      {icon:'transistor', x:900, y:270, scale:1.4, rot:0},
      {icon:'ethernet_cable', x:520, y:120, scale:1.1, rot:15},
      {icon:'ssd', x:1450, y:610, scale:1, rot:-5},
      {icon:'usb_flash_drive', x:1000, y:645, scale:1.2, rot:0},
      {icon:'network_card', x:640, y:660, scale:0.85, rot:-4},
      {icon:'microcontroller', x:620, y:300, scale:1.3, rot:0},
      {icon:'cpu', x:780, y:180, scale:1.1, rot:0},
      {icon:'crt_monitor_placeholder', x:0, y:0, scale:0, rot:0}
    ].filter(d=>d.icon!=='crt_monitor_placeholder')
  },
  {
    key:'server-room', name:'SERVER ROOM', sceneLabel:'SERVER ROOM · ROOM 2',
    time:215, hints:3, difficultyScale:.98, buildBg:buildBgServerRoom,
    mapSummary:'Trace the missing class files through the server racks and recover the access log.',
    mapClue:'The files were moved to an isolated snapshot. Its key points to the Quantum Core.',
    intro:{
      kicker:'LOCATION UNLOCKED · INVESTIGATION 02', title:'SERVER ROOM',
      text:"The CS-TRAIN tag led me to the engineering wing's server racks. If our files were corrupted, storage would show the damage. Instead, the access log is scattered. I'm putting it back together to find where the projects went.",
      cta:'Enter Server Room'
    },
    clue:"The log records a clean transfer into an encrypted class snapshot. Nothing was deleted or infected. CS-TRAIN made the transfer, and a service note encodes its destination. I need to decode it to follow the files.",
    targets:[
      {id:'ethernet_cable', label:'Ethernet Cable', x:800, y:260, scale:1.3, rot:0},
      {id:'router', label:'Router', x:600, y:640, scale:1.05, rot:-4},
      {id:'network_switch', label:'Network Switch', x:200, y:440, scale:1.05, rot:0},
      {id:'ram_module', label:'RAM Module', x:760, y:630, scale:1.2, rot:6},
      {id:'ssd', label:'SSD', x:900, y:650, scale:1.1, rot:-8},
      {id:'hard_drive', label:'Hard Drive', x:1320, y:820, scale:1.05, rot:4},
      {id:'usb_flash_drive', label:'USB Flash Drive', x:700, y:720, scale:1.3, rot:0},
      {id:'cooling_fan', label:'Cooling Fan', x:1400, y:340, scale:1, rot:0},
      {id:'network_card', label:'Network Card', x:150, y:780, scale:1, rot:-10},
      {id:'raspberry_pi', label:'Raspberry Pi', x:980, y:715, scale:1, rot:-5},
      {id:'power_supply', label:'Power Supply', x:1350, y:700, scale:0.95, rot:0},
      {id:'sensor', label:'Sensor', x:350, y:470, scale:1.05, rot:0},
      {id:'oscilloscope_probe', label:'Oscilloscope Probe', x:1470, y:470, scale:0.95, rot:0},
      {id:'fiber_optic_cable', label:'Fiber Optic Cable', x:520, y:230, scale:1.15, rot:-10},
      {id:'logic_gate_chip', label:'Logic Gate Chip', x:1120, y:470, scale:0.95, rot:0},
      {id:'microchip', label:'Microchip / IC', x:1080, y:600, scale:0.9, rot:0},
      {id:'rj45_jack', label:'RJ45 Jack', x:380, y:690, scale:1, rot:9}
    ],
    decor:[
      {icon:'screwdriver', x:730, y:770, scale:0.9, rot:20},
      {icon:'multimeter', x:500, y:700, scale:0.85, rot:-6},
      {icon:'power_supply', x:1350, y:700, scale:0.85, rot:0},
      {icon:'pcb', x:250, y:650, scale:0.75, rot:8},
      {icon:'cpu', x:1450, y:700, scale:0.95, rot:0},
      {icon:'transistor', x:1050, y:760, scale:1.3, rot:0},
      {icon:'gpu', x:1470, y:830, scale:0.75, rot:-4},
      {icon:'resistor', x:450, y:830, scale:1.1, rot:10},
      {icon:'capacitor', x:1150, y:770, scale:0.85, rot:-10},
      {icon:'microchip', x:1080, y:600, scale:0.8, rot:0},
      {icon:'sensor', x:350, y:470, scale:0.95, rot:0},
      {icon:'oscilloscope_probe', x:1470, y:470, scale:0.85, rot:0},
      {icon:'fiber_optic_cable', x:520, y:230, scale:1.1, rot:-10},
      {icon:'logic_gate_chip', x:1120, y:470, scale:0.85, rot:0}
    ]
  },
  {
    key:'quantum-core', name:'QUANTUM CORE', sceneLabel:'QUANTUM CORE · ROOM 3',
    time:205, hints:3, difficultyScale:.96, buildBg:buildBgQuantumCore,
    mapSummary:'Enter the shielded test bay and inspect the isolated class-file snapshot.',
    mapClue:'The snapshot contains a route marker for the Signal Vault.',
    intro:{
      kicker:'LOCATION UNLOCKED · INVESTIGATION 03', title:'QUANTUM CORE',
      text:"Everyone calls this shielded bay the Quantum Core. Its Faraday enclosure keeps experiments off the campus network, so an isolated backup makes sense here. I'm checking the equipment without disturbing the snapshot.",
      cta:'Enter Quantum Core'
    },
    clue:"The project files are intact in the snapshot, behind a four-digit lock. The audit shows the corruption warning was generated before shutdown. A route marker points me to the Signal Vault and the trigger.",
    targets:[
      {id:'cpu', label:'CPU', x:150, y:610, scale:1.2, rot:-6},
      {id:'gpu', label:'GPU', x:1150, y:600, scale:1, rot:4},
      {id:'microcontroller', label:'Microcontroller', x:420, y:660, scale:1.3, rot:0},
      {id:'pcb', label:'PCB', x:1350, y:590, scale:1, rot:-4},
      {id:'oscilloscope_probe', label:'Oscilloscope Probe', x:160, y:780, scale:1.1, rot:10},
      {id:'transistor', label:'Transistor', x:1480, y:700, scale:1.5, rot:0},
      {id:'logic_gate_chip', label:'Logic Gate Chip', x:320, y:580, scale:1.1, rot:0},
      {id:'sensor', label:'Sensor', x:640, y:330, scale:1.2, rot:0},
      {id:'fiber_optic_cable', label:'Fiber Optic Cable', x:980, y:460, scale:1.3, rot:-20},
      {id:'power_supply', label:'Power Supply', x:1440, y:800, scale:1, rot:0},
      {id:'router', label:'Router', x:1480, y:600, scale:0.85, rot:0},
      {id:'ram_module', label:'RAM Module', x:100, y:700, scale:0.95, rot:0},
      {id:'ssd', label:'SSD', x:1350, y:700, scale:0.95, rot:-6},
      {id:'usb_flash_drive', label:'USB Flash Drive', x:350, y:760, scale:1.1, rot:0},
      {id:'ethernet_cable', label:'Ethernet Cable', x:200, y:460, scale:1.05, rot:10},
      {id:'hard_drive', label:'Hard Drive', x:1300, y:780, scale:0.9, rot:-4},
      {id:'cooling_fan', label:'Cooling Fan', x:80, y:420, scale:0.85, rot:0},
      {id:'network_switch', label:'Network Switch', x:1530, y:440, scale:0.85, rot:0},
      {id:'eeprom_chip', label:'16K EEPROM Chip', x:840, y:720, scale:.95, rot:5}
    ],
    decor:[
      {icon:'arduino_board', x:460, y:760, scale:0.9, rot:-8},
      {icon:'breadboard', x:1420, y:650, scale:0.8, rot:6},
      {icon:'jumper_wires', x:500, y:780, scale:1, rot:0},
      {icon:'resistor', x:1250, y:820, scale:1.1, rot:0},
      {icon:'capacitor', x:240, y:700, scale:0.85, rot:-10},
      {icon:'router', x:1480, y:600, scale:0.75, rot:0},
      {icon:'ram_module', x:100, y:700, scale:0.85, rot:0},
      {icon:'ssd', x:1350, y:700, scale:0.85, rot:-6},
      {icon:'usb_flash_drive', x:350, y:760, scale:1, rot:0},
      {icon:'network_card', x:1120, y:760, scale:0.8, rot:8},
      {icon:'ethernet_cable', x:200, y:460, scale:0.95, rot:10},
      {icon:'hard_drive', x:1300, y:780, scale:0.8, rot:-4},
      {icon:'cooling_fan', x:80, y:420, scale:0.75, rot:0},
      {icon:'network_switch', x:1530, y:440, scale:0.75, rot:0}
    ]
  },
  {
    key:'signal-vault', name:'SIGNAL VAULT', sceneLabel:'SIGNAL VAULT · ROOM 4',
    time:200, hints:3, difficultyScale:.94, buildBg:buildBgServerRoom,
    mapSummary:'Read the diagnostics trace and identify what launched the protocol warning.',
    mapClue:'A class workstation routed the alert through the Fabrication Deck.',
    intro:{
      kicker:'LOCATION UNLOCKED · INVESTIGATION 04', title:'SIGNAL VAULT',
      text:"The Signal Vault keeps old scopes and diagnostic records. Its backup circuit logged through the Lab 2 shutdown. I'm recovering the trace to identify which workstation launched the warning.",
      cta:'Search Signal Vault'
    },
    clue:"The campus feed never failed. A scheduled command from a classroom terminal shut down the computers while the diagnostic circuit kept running. Its next handoff passed through the Fabrication Deck; several missing parts were scanned there.",
    targets:[
      {id:'fiber_optic_cable', label:'Fiber Optic Cable', x:250, y:230, scale:1.2, rot:-12},
      {id:'network_switch', label:'Network Switch', x:430, y:380, scale:1, rot:0},
      {id:'router', label:'Router', x:720, y:620, scale:1.05, rot:5},
      {id:'sensor', label:'Sensor', x:1120, y:320, scale:1.15, rot:0},
      {id:'ram_module', label:'RAM Module', x:1280, y:630, scale:1.15, rot:-6},
      {id:'ssd', label:'SSD', x:920, y:700, scale:1.1, rot:8},
      {id:'power_supply', label:'Power Supply', x:1450, y:770, scale:1, rot:0},
      {id:'logic_gate_chip', label:'Logic Gate Chip', x:180, y:760, scale:1.05, rot:-4},
      {id:'oscilloscope_probe', label:'Oscilloscope Probe', x:1460, y:420, scale:1, rot:0},
      {id:'microcontroller', label:'Microcontroller', x:560, y:760, scale:1.15, rot:0},
      {id:'usb_flash_drive', label:'USB Flash Drive', x:820, y:450, scale:1.25, rot:-10},
      {id:'cpu', label:'CPU', x:1340, y:220, scale:1.15, rot:0},
      {id:'fuse', label:'Fuse', x:360, y:680, scale:1, rot:11},
      {id:'relay', label:'Relay', x:1030, y:750, scale:.94, rot:-7},
      {id:'logic_analyzer', label:'Logic Analyzer', x:610, y:560, scale:.9, rot:6},
      {id:'timer_ic', label:'555 Timer IC', x:1180, y:220, scale:.88, rot:-9},
      {id:'eeprom_chip', label:'16K EEPROM Chip', x:260, y:550, scale:.9, rot:7},
      {id:'rj45_jack', label:'RJ45 Jack', x:1500, y:590, scale:.9, rot:-5},
      {id:'voltage_regulator', label:'Voltage Regulator', x:720, y:270, scale:1, rot:4},
      {id:'ceramic_capacitor', label:'Ceramic Capacitor', x:1040, y:530, scale:.94, rot:-8}
    ],
    decor:[
      {icon:'hard_drive', x:100, y:820, scale:0.9, rot:0},
      {icon:'cooling_fan', x:1540, y:300, scale:0.85, rot:0},
      {icon:'multimeter', x:520, y:700, scale:0.8, rot:-8},
      {icon:'pcb', x:1050, y:760, scale:0.8, rot:8},
      {icon:'resistor', x:300, y:650, scale:1, rot:10},
      {icon:'capacitor', x:1160, y:760, scale:0.9, rot:-8},
      {icon:'network_card', x:1380, y:520, scale:0.8, rot:0}
    ]
  },
  {
    key:'fabrication-deck', name:'FABRICATION DECK', sceneLabel:'FABRICATION DECK · ROOM 5',
    time:210, hints:3, difficultyScale:.92, buildBg:buildBgHardwareBay,
    mapSummary:'Inspect the fabrication benches for the missing class components.',
    mapClue:'The components were staged in antistatic trays; their checkout leads to the ESD Archive.',
    intro:{
      kicker:'LOCATION UNLOCKED · INVESTIGATION 05', title:'FABRICATION DECK',
      text:"The Fabrication Deck is all soldering stations and half-finished projects. I recognize the labels from our practical, but the parts aren't at their usual benches. I'm rebuilding the checkout trail from what's left.",
      cta:'Search Fabrication Deck'
    },
    clue:"The missing components were packed in labeled antistatic trays; they weren't stolen. A nearby schematic repeats our practical's wiring fault and carries the same CS-TRAIN mark as the server log. The inventory continues in the ESD Archive.",
    targets:[
      {id:'arduino_board', label:'Arduino Board', x:260, y:420, scale:1.1, rot:-5},
      {id:'breadboard', label:'Breadboard', x:560, y:630, scale:1.15, rot:4},
      {id:'jumper_wires', label:'Jumper Wires', x:900, y:240, scale:1.15, rot:-8},
      {id:'soldering_iron', label:'Soldering Iron', x:1100, y:700, scale:1.25, rot:18},
      {id:'transistor', label:'Transistor', x:1440, y:260, scale:1.45, rot:0},
      {id:'capacitor', label:'Capacitor', x:780, y:340, scale:1.25, rot:-12},
      {id:'resistor', label:'Resistor', x:180, y:760, scale:1.35, rot:12},
      {id:'pcb', label:'PCB', x:1320, y:600, scale:1.05, rot:-7},
      {id:'multimeter', label:'Multimeter', x:720, y:770, scale:1.15, rot:0},
      {id:'microchip', label:'Microchip / IC', x:1180, y:410, scale:1.1, rot:6},
      {id:'cooling_fan', label:'Cooling Fan', x:1510, y:470, scale:1, rot:0},
      {id:'power_supply', label:'Power Supply', x:420, y:780, scale:1, rot:0},
      {id:'stepper_motor', label:'Stepper Motor', x:950, y:560, scale:.95, rot:8},
      {id:'heatsink', label:'Heatsink', x:520, y:250, scale:.95, rot:-6},
      {id:'relay', label:'Relay', x:350, y:580, scale:.9, rot:5},
      {id:'fuse', label:'Fuse', x:1450, y:700, scale:.92, rot:-10},
      {id:'voltage_regulator', label:'Voltage Regulator', x:1180, y:720, scale:.9, rot:6},
      {id:'eeprom_chip', label:'16K EEPROM Chip', x:220, y:330, scale:.88, rot:-6},
      {id:'timer_ic', label:'555 Timer IC', x:850, y:470, scale:.88, rot:9},
      {id:'ceramic_capacitor', label:'Ceramic Capacitor', x:1060, y:280, scale:.92, rot:-8},
      {id:'logic_analyzer', label:'Logic Analyzer', x:620, y:680, scale:.9, rot:4}
    ],
    decor:[
      {icon:'hard_drive', x:80, y:790, scale:0.9, rot:-6},
      {icon:'router', x:1380, y:780, scale:0.8, rot:0},
      {icon:'ram_module', x:940, y:790, scale:0.85, rot:0},
      {icon:'network_card', x:620, y:680, scale:0.8, rot:-4},
      {icon:'usb_flash_drive', x:1020, y:640, scale:1, rot:0},
      {icon:'cpu', x:640, y:180, scale:1, rot:0},
      {icon:'logic_gate_chip', x:1280, y:180, scale:0.9, rot:0}
    ]
  },
  {
    key:'esd-archive', name:'ESD ARCHIVE', sceneLabel:'ESD ARCHIVE · ROOM 6',
    time:225, hints:3, difficultyScale:.90, buildBg:buildBgHardwareBay,
    mapSummary:'Find the sealed replacement parts and reconstruct the checkout record.',
    mapClue:'The parts were signed out under a training token for a test in the Robotics Lab.',
    intro:{
      kicker:'LOCATION UNLOCKED · INVESTIGATION 06', title:'ESD ARCHIVE',
      text:"The ESD Archive's terminal is still on. Every drawer looks almost identical, which is a great system if you enjoy opening the wrong one. I'm finding our parts, then checking the checkout record without disturbing the stock.",
      cta:'Search ESD Archive'
    },
    clue:"CS-TRAIN accounts for every missing part. The record predates class and marks a controlled exercise, but the approving name is masked. A reserved rig in Robotics may show what the parts were meant to test.",
    targets:makeSearchTargets([
      'eeprom_chip','timer_ic','ceramic_capacitor','relay','heatsink','fuse','rj45_jack','logic_analyzer',
      'voltage_regulator','microchip','pcb','ram_module','ssd','hard_drive','usb_flash_drive',
      'network_card','power_supply','transistor','capacitor','resistor','cooling_fan','usb_drive'
    ]),
    decor:[]
  },
  {
    key:'robotics-lab', name:'ROBOTICS LAB', sceneLabel:'ROBOTICS LAB · ROOM 7',
    time:235, hints:3, difficultyScale:.88, buildBg:buildBgQuantumCore,
    mapSummary:'Inspect the isolated rig and reproduce the COMPLAB 2 interruption safely.',
    mapClue:'The rig confirms a scripted trigger; Power Systems holds the switch record.',
    intro:{
      kicker:'LOCATION UNLOCKED · INVESTIGATION 07', title:'ROBOTICS LAB',
      text:"The Robotics Lab's isolated rig can repeat a circuit fault without touching the classroom computers. I'm checking its controllers, relays, and sensors against our shutdown trace. If the trace matches, this wasn't a hardware failure.",
      cta:'Enter Robotics Lab'
    },
    clue:"The rig produces the warning only when its programmed relay fires. It doesn't spread or rewrite files. Someone built a controlled sequence with real hardware and code. The relay's power record is in Power Systems.",
    targets:makeSearchTargets([
      'stepper_motor','arduino_board','raspberry_pi','sensor','microcontroller','pcb','jumper_wires',
      'breadboard','relay','transistor','voltage_regulator','fuse','logic_analyzer','oscilloscope_probe',
      'heatsink','eeprom_chip','timer_ic','usb_drive','screwdriver','soldering_iron','capacitor',
      'resistor','cooling_fan'
    ]),
    decor:[]
  },
  {
    key:'power-systems', name:'POWER SYSTEMS', sceneLabel:'POWER SYSTEMS · ROOM 8',
    time:245, hints:3, difficultyScale:.86, buildBg:buildBgServerRoom,
    mapSummary:'Read the relay and power sequence behind the classroom shutdown.',
    mapClue:'A safe local relay was used; the command source is in the Firmware Studio.',
    intro:{
      kicker:'LOCATION UNLOCKED · INVESTIGATION 08', title:'POWER SYSTEMS',
      text:"Power Systems keeps the protected supplies and relay logs. I'm rebuilding the switch sequence to tell a dangerous outage from a local shutdown, and to check whether our circuits were ever at risk.",
      cta:'Inspect Power Systems'
    },
    clue:"At 09:18, a protected relay disconnected only the COMPLAB 2 workstations. Building power and student circuits stayed safe. Its 12V / 05A training tag links the switch to a command package in the Firmware Studio.",
    targets:makeSearchTargets([
      'power_supply','relay','fuse','voltage_regulator','capacitor','ceramic_capacitor','resistor',
      'transistor','multimeter','oscilloscope_probe','sensor','heatsink','cooling_fan','microchip',
      'pcb','logic_analyzer','timer_ic','eeprom_chip','arduino_board','jumper_wires','breadboard',
      'network_switch','hard_drive','usb_flash_drive'
    ]),
    decor:[]
  },
  {
    key:'firmware-studio', name:'FIRMWARE STUDIO', sceneLabel:'FIRMWARE STUDIO · ROOM 9',
    time:255, hints:3, difficultyScale:.84, buildBg:buildBgServerRoom,
    mapSummary:'Recover the program that displayed the error and moved the class files.',
    mapClue:'The protocol source points to a final audit console in the Demo Theater.',
    intro:{
      kicker:'LOCATION UNLOCKED · INVESTIGATION 09', title:'FIRMWARE STUDIO',
      text:"The Firmware Studio keeps build records and diagnostic scripts. If the protocol was programmed, its source should be here. I'm checking the old drives and debug boards for the command that put those warnings on my screen.",
      cta:'Trace Firmware Build'
    },
    clue:"The source generated the corruption and unauthorized-access warnings as simulations. It moved our class projects into a restorable snapshot and recorded every component location. The author's signature is sealed in the Demo Theater audit console.",
    targets:makeSearchTargets([
      'eeprom_chip','timer_ic','microchip','logic_gate_chip','microcontroller','ram_module','ssd',
      'usb_flash_drive','usb_drive','router','network_switch','network_card','rj45_jack',
      'ethernet_cable','fiber_optic_cable','raspberry_pi','pcb','logic_analyzer','sensor',
      'voltage_regulator','capacitor','resistor','hard_drive','cooling_fan','fuse'
    ]),
    decor:[]
  },
  {
    key:'demo-theater', name:'DEMO THEATER', sceneLabel:'DEMO THEATER · ROOM 10',
    time:270, hints:3, difficultyScale:.82, buildBg:buildBgHardwareBay,
    mapSummary:'Open the audit console, restore the class work, and identify the protocol author.',
    mapClue:'Fiona exposed a supervised engineering test; the class files and components are safe.',
    intro:{
      kicker:'FINAL LOCATION · INVESTIGATION 10', title:'DEMO THEATER',
      text:"The final audit console is in the Demo Theater. I have evidence from hardware, networks, power, and code. One last sweep, then I can open the protocol's control mode and identify who built it.",
      cta:'Begin Final Sweep'
    },
    clue:"The final audit confirms the project files can be restored and the parts returned. Every clue points to one coordinated system, not a virus. The author's identity sits behind the last control string. I have enough evidence to decode it.",
    targets:makeSearchTargets([
      'arduino_board','breadboard','jumper_wires','soldering_iron','screwdriver','multimeter','pcb',
      'microchip','cpu','gpu','power_supply','relay','fuse','voltage_regulator','eeprom_chip',
      'timer_ic','stepper_motor','sensor','logic_analyzer','oscilloscope_probe','rj45_jack',
      'ethernet_cable','usb_drive','ram_module','heatsink','ceramic_capacitor'
    ]),
    decor:[]
  }
];
