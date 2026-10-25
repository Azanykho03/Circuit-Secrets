import * as THREE from 'three';

const palette = {
  shell: 0x263b49, dark: 0x18252e, black: 0x111a20, steel: 0x9aadb5,
  silver: 0xc4d0ce, copper: 0xba7145, gold: 0xe3bd65, pcb: 0x267e70,
  pcbDark: 0x286077, blue: 0x418cae, cream: 0xd8c5a1, red: 0xc86557,
  orange: 0xd89548, green: 0x6bbc91, glass: 0x77b9c3
};
const materials = Object.fromEntries(Object.entries(palette).map(([name, color]) => [name,
  new THREE.MeshStandardMaterial({ color, roughness: name === 'steel' || name === 'silver' ? .28 : .58,
    metalness: ['steel', 'silver', 'gold', 'copper'].includes(name) ? .65 : .16 })
]));
const geo = new Map();
function box(parent, x, y, z, w, h, d, mat = 'shell') {
  const key = `${w},${h},${d}`;
  if (!geo.has(key)) geo.set(key, new THREE.BoxGeometry(w, h, d));
  const mesh = new THREE.Mesh(geo.get(key), materials[mat]);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
function cylinder(parent, x, y, z, radius, height, mat = 'steel', segments = 12) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, segments), materials[mat]);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}
function tube(parent, points, radius, mat) {
  const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 14, radius, 5, false), materials[mat]);
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}
function topMark(parent, text, width = .48, z = 0, y = .17) {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 80;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#17242a'; ctx.fillRect(0, 0, 256, 80);
  ctx.fillStyle = '#c7dbda'; ctx.font = '700 35px "Space Mono", monospace';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 43, 238);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const label = new THREE.Mesh(new THREE.PlaneGeometry(width, width * .3),
    new THREE.MeshBasicMaterial({ map: texture, transparent: false, side: THREE.DoubleSide }));
  label.rotation.x = -Math.PI / 2;
  label.position.set(0, y, z);
  parent.add(label);
}
function circuitBoard(parent, width = .9, depth = .65, tone = 'pcb') {
  box(parent, 0, .045, 0, width, .09, depth, tone);
  for (let i = 0; i < 6; i++) {
    const x = -width * .38 + i * width * .15;
    box(parent, x, .095, depth * (i % 2 ? .2 : -.18), .1, .012, .018, 'gold');
  }
  for (let i = 0; i < 3; i++) cylinder(parent, -width * .25 + i * width * .25, .11,
    -depth * .3, .025, .035, i === 1 ? 'red' : 'silver', 8);
}
function chip(parent, name, width = .62, depth = .37, pins = 4) {
  box(parent, 0, .135, 0, width, .2, depth, 'black');
  for (let i = 0; i < pins; i++) {
    const x = -width * .38 + i * width * .76 / Math.max(1, pins - 1);
    for (const side of [-1, 1]) box(parent, x, .045, side * (depth / 2 + .09), .045, .04, .2, 'silver');
  }
  topMark(parent, name, Math.min(.49, width * .74), 0, .24);
}
function axial(parent, kind) {
  const body = kind === 'fuse' ? 'glass' : kind === 'resistor' ? 'cream' : 'orange';
  const shaft = cylinder(parent, 0, .12, 0, kind === 'fuse' ? .095 : .105, .48, body);
  shaft.rotation.z = Math.PI / 2;
  for (const side of [-1, 1]) {
    const cap = cylinder(parent, side * .23, .12, 0, .11, .08, 'silver');
    cap.rotation.z = Math.PI / 2;
    box(parent, side * .43, .12, 0, .34, .026, .026, 'steel');
  }
  if (kind === 'resistor') for (const [x, tone] of [[-.13, 'red'], [-.04, 'gold'], [.05, 'dark'], [.14, 'red']]) {
    const band = cylinder(parent, x, .12, 0, .108, .035, tone);
    band.rotation.z = Math.PI / 2;
  }
}
function capacitor(parent, ceramic = false) {
  if (ceramic) {
    const disc = cylinder(parent, 0, .25, 0, .25, .1, 'orange', 20);
    disc.rotation.x = Math.PI / 2;
    for (const x of [-.12, .12]) box(parent, x, .13, 0, .025, .25, .025, 'silver');
  } else {
    cylinder(parent, 0, .28, 0, .19, .48, 'blue', 20);
    cylinder(parent, 0, .525, 0, .18, .026, 'silver', 20);
    for (const x of [-.09, .09]) box(parent, x, .025, 0, .025, .07, .025, 'silver');
    box(parent, 0, .32, .185, .2, .055, .01, 'cream');
  }
}
function boardWithChip(parent, name, wide = false) {
  circuitBoard(parent, wide ? 1.18 : .92, wide ? .72 : .66);
  const core = new THREE.Group(); core.position.set(.04, .07, .02); parent.add(core);
  chip(core, name, wide ? .55 : .43, .35, 4);
  for (let i = 0; i < 2; i++) box(parent, -.36 + i * .64, .15, -.2, .1, .14, .12, i ? 'silver' : 'black');
}
function storage(parent, kind) {
  if (kind === 'ram_module') {
    circuitBoard(parent, 1.22, .3, 'pcb');
    for (let i = 0; i < 5; i++) box(parent, -.44 + i * .22, .115, 0, .14, .08, .17, 'black');
    for (let i = 0; i < 12; i++) box(parent, -.52 + i * .095, .042, .17, .06, .012, .065, 'gold');
  } else if (kind === 'usb_drive' || kind === 'usb_flash_drive') {
    box(parent, -.11, .12, 0, .63, .19, .3, kind === 'usb_drive' ? 'blue' : 'black');
    box(parent, .33, .105, 0, .29, .14, .25, 'silver');
    box(parent, .475, .11, 0, .015, .07, .16, 'dark');
  } else {
    const isHdd = kind === 'hard_drive';
    box(parent, 0, .135, 0, .87, .27, .64, isHdd ? 'steel' : 'black');
    box(parent, 0, .276, 0, .66, .014, .43, isHdd ? 'silver' : 'pcbDark');
    if (isHdd) {
      cylinder(parent, -.08, .292, 0, .19, .018, 'steel', 24);
      cylinder(parent, -.08, .306, 0, .045, .02, 'dark');
      box(parent, .24, .3, -.07, .18, .025, .08, 'dark').rotation.y = -.4;
    } else topMark(parent, 'SSD', .44, 0, .288);
  }
}
function connector(parent, kind) {
  if (kind === 'rj45_jack') {
    box(parent, 0, .18, 0, .48, .36, .42, 'silver');
    box(parent, 0, .18, -.215, .33, .22, .02, 'black');
    for (let i = 0; i < 6; i++) box(parent, -.16 + i * .065, .28, -.22, .035, .05, .02, 'gold');
  } else {
    const tone = kind === 'fiber_optic_cable' ? 'orange' : kind === 'jumper_wires' ? 'red' : 'blue';
    for (let i = 0; i < (kind === 'jumper_wires' ? 3 : 2); i++) {
      const z = -.13 + i * .13;
      tube(parent, [[-.5, .045, z], [-.18, .075, z + .12], [.15, .06, z - .06], [.5, .045, z]], .022, i % 2 ? 'gold' : tone);
      for (const x of [-.52, .52]) box(parent, x, .075, z, .15, .1, .1, kind === 'ethernet_cable' ? 'silver' : 'black');
    }
  }
}
function tool(parent, kind) {
  const isMeter = ['multimeter', 'logic_analyzer'].includes(kind);
  if (isMeter) {
    box(parent, 0, .18, 0, .68, .34, .85, kind === 'multimeter' ? 'orange' : 'shell');
    box(parent, 0, .37, -.17, .51, .018, .29, 'black');
    box(parent, 0, .383, -.17, .42, .008, .18, 'glass');
    for (let i = 0; i < 3; i++) cylinder(parent, -.2 + i * .2, .37, .18, .055, .025, i === 0 ? 'red' : 'black');
  } else if (kind === 'soldering_iron' || kind === 'oscilloscope_probe' || kind === 'screwdriver') {
    const handleTone = kind === 'soldering_iron' ? 'blue' : kind === 'screwdriver' ? 'red' : 'black';
    const handle = cylinder(parent, -.16, .13, 0, .1, .53, handleTone);
    handle.rotation.z = Math.PI / 2;
    const tip = cylinder(parent, .3, .13, 0, .045, .43, 'steel');
    tip.rotation.z = Math.PI / 2;
    box(parent, .55, .13, 0, .12, .025, .025, 'silver');
    if (kind === 'oscilloscope_probe') tube(parent, [[-.43, .12, 0], [-.58, .1, -.1], [-.48, .08, -.35]], .018, 'black');
  }
}
function fan(parent) {
  box(parent, 0, .13, 0, .7, .25, .7, 'shell');
  cylinder(parent, 0, .27, 0, .29, .025, 'black', 24);
  for (let i = 0; i < 5; i++) {
    const blade = box(parent, .13, .29, 0, .32, .018, .1, 'steel');
    blade.rotation.y = i * Math.PI * 2 / 5;
  }
  cylinder(parent, 0, .305, 0, .07, .025, 'silver');
}
function power(parent, kind) {
  if (kind === 'heatsink') {
    box(parent, 0, .045, 0, .78, .09, .55, 'steel');
    for (let i = 0; i < 8; i++) box(parent, -.33 + i * .094, .23, 0, .045, .36, .53, 'steel');
  } else if (kind === 'stepper_motor') {
    cylinder(parent, 0, .29, 0, .33, .55, 'shell', 8);
    cylinder(parent, 0, .58, 0, .18, .04, 'steel');
    cylinder(parent, 0, .72, 0, .045, .26, 'steel');
  } else {
    const w = kind === 'power_supply' ? 1.0 : .62;
    box(parent, 0, .24, 0, w, .47, .65, kind === 'power_supply' ? 'steel' : 'black');
    if (kind === 'power_supply') {
      cylinder(parent, -.24, .49, 0, .17, .025, 'dark', 20);
      for (let i = 0; i < 5; i++) box(parent, .3, .49, -.23 + i * .11, .2, .02, .025, 'dark');
    } else {
      box(parent, 0, .49, 0, .39, .025, .37, kind === 'relay' ? 'blue' : 'steel');
      for (const x of [-.24, .24]) box(parent, x, .025, 0, .04, .1, .04, 'silver');
    }
  }
}

export function createComponentModel(id) {
  const group = new THREE.Group();
  switch (id) {
    case 'resistor': case 'fuse': axial(group, id); break;
    case 'capacitor': case 'ceramic_capacitor': capacitor(group, id === 'ceramic_capacitor'); break;
    case 'timer_ic': chip(group, '555', .56, .36, 4); break;
    case 'eeprom_chip': chip(group, '16K', .66, .38, 5); break;
    case 'logic_gate_chip': chip(group, 'AND', .58, .36, 4); break;
    case 'microchip': case 'cpu': chip(group, id === 'cpu' ? 'CPU' : 'IC', .72, .65, 6); break;
    case 'transistor': case 'voltage_regulator':
      box(group, 0, .24, 0, .33, .43, .14, 'black');
      for (let i = 0; i < 3; i++) box(group, -.12 + i * .12, .07, .16, .027, .08, .35, 'silver');
      if (id === 'voltage_regulator') box(group, 0, .49, 0, .32, .08, .13, 'steel');
      break;
    case 'usb_drive': case 'usb_flash_drive': case 'hard_drive': case 'ssd': case 'ram_module': storage(group, id); break;
    case 'jumper_wires': case 'ethernet_cable': case 'fiber_optic_cable': case 'rj45_jack': connector(group, id); break;
    case 'multimeter': case 'logic_analyzer': case 'soldering_iron': case 'screwdriver': case 'oscilloscope_probe': tool(group, id); break;
    case 'cooling_fan': fan(group); break;
    case 'power_supply': case 'relay': case 'heatsink': case 'stepper_motor': power(group, id); break;
    case 'router': case 'network_switch':
      box(group, 0, .13, 0, 1.08, .25, .58, 'shell');
      for (let i = 0; i < (id === 'router' ? 3 : 7); i++) box(group, -.42 + i * (id === 'router' ? .42 : .14), .16, .305, .09, .07, .025, i === 0 ? 'green' : 'gold');
      if (id === 'router') for (const x of [-.33, .33]) box(group, x, .41, -.2, .035, .64, .035, 'black');
      break;
    case 'breadboard':
      box(group, 0, .08, 0, 1.02, .16, .65, 'cream');
      for (let i = 0; i < 9; i++) for (const z of [-.18, .18]) cylinder(group, -.4 + i * .1, .165, z, .011, .005, 'dark', 6);
      break;
    case 'gpu': case 'network_card':
      circuitBoard(group, 1.24, .54, 'pcbDark');
      chip(group, id === 'gpu' ? 'GPU' : 'LAN', .55, .37, 4);
      box(group, -.58, .2, 0, .06, .4, .57, 'steel');
      break;
    case 'arduino_board': case 'raspberry_pi': case 'microcontroller': case 'pcb': case 'sensor':
      boardWithChip(group, id === 'arduino_board' ? 'UNO' : id === 'raspberry_pi' ? 'PI' : id === 'sensor' ? 'SENS' : id === 'pcb' ? 'PCB' : 'MCU', id === 'arduino_board');
      break;
    default: boardWithChip(group, 'IC');
  }
  group.rotation.y = (id.length % 5 - 2) * .12;
  return group;
}
