// Selected Lucide icons. License: assets/lucide-LICENSE.txt.
(function(){
'use strict';
const nodes={
  home:[['path',{d:'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8'}],['path',{d:'M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'}]],
  back:[['path',{d:'m12 19-7-7 7-7'}],['path',{d:'M19 12H5'}]],
  play:[['path',{d:'M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z'}]],
  pause:[['rect',{x:14,y:3,width:5,height:18,rx:1}],['rect',{x:5,y:3,width:5,height:18,rx:1}]],
  sound:[['path',{d:'M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z'}],['path',{d:'M16 9a5 5 0 0 1 0 6'}],['path',{d:'M19.364 18.364a9 9 0 0 0 0-12.728'}]],
  muted:[['path',{d:'M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z'}],['line',{x1:22,x2:16,y1:9,y2:15}],['line',{x1:16,x2:22,y1:9,y2:15}]],
  map:[['path',{d:'M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z'}],['path',{d:'M15 5.764v15'}],['path',{d:'M9 3.236v15'}]],
  book:[['path',{d:'M12 7v14'}],['path',{d:'M3 18V5a2 2 0 0 1 2-2h4a3 3 0 0 1 3 3 3 3 0 0 1 3-3h4a2 2 0 0 1 2 2v13h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z'}]],
  reset:[['path',{d:'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8'}],['path',{d:'M3 3v5h5'}]],
  close:[['path',{d:'M18 6 6 18M6 6l12 12'}]],
  zoomIn:[['circle',{cx:11,cy:11,r:8}],['path',{d:'m21 21-4.35-4.35'}],['path',{d:'M11 8v6'}],['path',{d:'M8 11h6'}]],
  zoomOut:[['circle',{cx:11,cy:11,r:8}],['path',{d:'m21 21-4.35-4.35'}],['path',{d:'M8 11h6'}]],
  search:[['circle',{cx:11,cy:11,r:7}],['path',{d:'m20 20-4-4'}]],
  clock:[['circle',{cx:12,cy:12,r:9}],['path',{d:'M12 7v5l3 2'}]],
  lightbulb:[['path',{d:'M9 18h6'}],['path',{d:'M10 22h4'}],['path',{d:'M8.5 14.5a7 7 0 1 1 7 0c-.9.7-1.4 1.5-1.5 2.5h-4c-.1-1-.6-1.8-1.5-2.5z'}]],
  file:[['path',{d:'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'}],['path',{d:'M14 2v6h6M8 13h8M8 17h8'}]],
  info:[['circle',{cx:12,cy:12,r:9}],['path',{d:'M12 11v5'}],['path',{d:'M12 8h.01'}]],
  alert:[['path',{d:'m10.3 3.9-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3.1l-8-14a2 2 0 0 0-3.4 0z'}],['path',{d:'M12 9v4'}],['path',{d:'M12 17h.01'}]],
  unlock:[['rect',{x:4,y:11,width:16,height:10,rx:2}],['path',{d:'M8 11V7a4 4 0 0 1 7.5-2'}],['path',{d:'M12 15v2'}]],
  lock:[['rect',{x:4,y:11,width:16,height:10,rx:2}],['path',{d:'M8 11V7a4 4 0 0 1 8 0v4'}],['path',{d:'M12 15v2'}]],
  network:[['rect',{x:9,y:3,width:6,height:5,rx:1}],['rect',{x:3,y:16,width:6,height:5,rx:1}],['rect',{x:15,y:16,width:6,height:5,rx:1}],['path',{d:'M12 8v4M6 16v-4h12v4'}]],
  keyboard:[['rect',{x:2,y:5,width:20,height:14,rx:2}],['path',{d:'M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M8 15h8'}]],
  scan:[['path',{d:'M3 7V5a2 2 0 0 1 2-2h2'}],['path',{d:'M17 3h2a2 2 0 0 1 2 2v2'}],['path',{d:'M21 17v2a2 2 0 0 1-2 2h-2'}],['path',{d:'M7 21H5a2 2 0 0 1-2-2v-2'}],['path',{d:'M7 12h10'}]],
  power:[['path',{d:'M12 2v10'}],['path',{d:'M18.4 6.6a8 8 0 1 1-12.8 0'}]]
};
window.CircuitIcons={markup(name){
  const body=nodes[name].map(([tag,attributes])=>`<${tag} ${Object.entries(attributes).map(([key,value])=>`${key}="${value}"`).join(' ')}></${tag}>`).join('');
  return `<svg class="ui-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
}};
})();
