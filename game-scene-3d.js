import * as THREE from 'three';
import { createComponentModel } from './component-models-3d.js';

const host = document.querySelector('#scene-3d');
const wrap = document.querySelector('#scene-wrap');
const game = document.querySelector('#screen-game');

if (host && wrap && game) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  } catch (error) {
    host.dataset.unavailable = 'true';
  }

  if (renderer) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const reduceEffects = () => reducedMotion.matches || Boolean(window.CircuitVisualPrefs?.reducedEffects);
    const reducedAtLoad = reduceEffects();
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x101b2a);
    scene.fog = new THREE.Fog(0x101b2a, 18, 34);
    const camera = new THREE.PerspectiveCamera(42, 16 / 9, 0.1, 50);
    camera.position.set(0, 5.1, 12.7);
    camera.lookAt(0, 2.15, -0.5);
    const basePixelRatio = Math.min(window.devicePixelRatio || 1, reducedAtLoad ? 1.1 : 1.6);
    const maxZoomPixelRatio = reducedAtLoad ? 1.65 : 2.25;
    let activePixelRatio = basePixelRatio;
    renderer.setPixelRatio(activePixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.48;
    renderer.shadowMap.enabled = !reducedAtLoad;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    host.appendChild(renderer.domElement);

    const mats = new Map();
    function material(color, options = {}) {
      const key = `${color}:${JSON.stringify(options)}`;
      if (!mats.has(key)) mats.set(key, new THREE.MeshStandardMaterial({
        color, roughness: 0.56, metalness: 0.16, ...options
      }));
      return mats.get(key);
    }
    const ink = material(0x172a3c);
    const charcoal = material(0x293949, { metalness: 0.38 });
    const steel = material(0x748da0, { metalness: 0.68, roughness: 0.31 });
    const blue = material(0x315d80, { metalness: 0.35 });
    const pale = material(0xb6c9cc, { metalness: 0.14 });
    const gold = material(0xf1b957, { metalness: 0.3 });
    const coral = material(0xe57868);
    const mint = material(0x53c9a1);
    const cyanGlow = material(0x8ee6fb, { emissive: 0x3eb8e3, emissiveIntensity: 1.6 });
    const mintGlow = material(0x8cfbd1, { emissive: 0x36d5a4, emissiveIntensity: 1.2 });
    const amberGlow = material(0xffd28a, { emissive: 0xe99a3d, emissiveIntensity: 1.25 });
    const redGlow = material(0xff8b85, { emissive: 0xe84245, emissiveIntensity: 1.2 });
    const boxGeometries = new Map();
    function box(parent, size, position, mat, bevel = false) {
      const key = size.join(',');
      if (!boxGeometries.has(key)) boxGeometries.set(key, new THREE.BoxGeometry(...size));
      const object = new THREE.Mesh(boxGeometries.get(key), mat);
      object.position.set(...position);
      object.castShadow = true;
      object.receiveShadow = true;
      parent.add(object);
      if (bevel) {
        const edges = new THREE.LineSegments(new THREE.EdgesGeometry(object.geometry), new THREE.LineBasicMaterial({ color: 0x9bbbd0, transparent: true, opacity: 0.2 }));
        object.add(edges);
      }
      return object;
    }
    function cylinder(parent, radiusTop, radiusBottom, height, position, mat, segments = 16) {
      const object = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments), mat);
      object.position.set(...position);
      object.castShadow = true;
      object.receiveShadow = true;
      parent.add(object);
      return object;
    }
    function sphere(parent, radius, position, mat) {
      const object = new THREE.Mesh(new THREE.SphereGeometry(radius, 16, 12), mat);
      object.position.set(...position);
      object.castShadow = true;
      parent.add(object);
      return object;
    }
    function wire(parent, points, radius, mat) {
      const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));
      const object = new THREE.Mesh(new THREE.TubeGeometry(curve, 32, radius, 6, false), mat);
      parent.add(object);
      return object;
    }
    function label(parent, text, position, width = 2.1, accent = '#9df4d0') {
      const canvas = document.createElement('canvas');
      canvas.width = 512; canvas.height = 128;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#193346'; ctx.fillRect(0, 0, 512, 128);
      ctx.strokeStyle = '#6f9bb0'; ctx.lineWidth = 6; ctx.strokeRect(5, 5, 502, 118);
      ctx.fillStyle = accent; ctx.font = '700 35px "Space Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(text, 256, 66, 470);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(width, width * 0.25), new THREE.MeshBasicMaterial({ map: texture }));
      panel.position.set(...position);
      parent.add(panel);
      return panel;
    }

    const hemi = new THREE.HemisphereLight(0xc5e9ff, 0x4a536c, 2.5);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffdfb4, 3.25);
    sun.position.set(-5, 8, 7); sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 9, bottom: -7, near: 0.5, far: 28 });
    sun.shadow.normalBias = 0.035;
    scene.add(sun);
    const blueLight = new THREE.PointLight(0x58caff, 26, 11, 2);
    blueLight.position.set(4.4, 4.9, 2.1); scene.add(blueLight);
    const benchLight = new THREE.PointLight(0xffbd76, 18, 7, 2);
    benchLight.position.set(-3.8, 3.6, 3.4); scene.add(benchLight);
    const greenLight = new THREE.PointLight(0x55e6b9, 14, 6, 2);
    greenLight.position.set(0.8, 2.4, -0.4); scene.add(greenLight);

    const room = new THREE.Group(); scene.add(room);
    box(room, [19, 0.28, 13], [0, -0.16, 0], material(0x334454));
    box(room, [18.7, 7.8, 0.22], [0, 3.65, -4.35], material(0x2d4355));
    box(room, [0.22, 7.8, 11], [-9.25, 3.65, 0.65], material(0x283c50));
    box(room, [0.22, 7.8, 11], [9.25, 3.65, 0.65], material(0x283c50));
    box(room, [18.8, 0.13, 0.2], [0, 5.92, -4.14], steel);
    box(room, [18.8, 0.13, 0.2], [0, 1.15, -4.14], charcoal);
    for (const x of [-7.6, -3.8, 0, 3.8, 7.6]) {
      box(room, [0.12, 4.7, 0.14], [x, 3.52, -4.12], steel);
      box(room, [0.38, 0.05, 8.4], [x, 6.4, -0.5], charcoal);
      box(room, [0.14, 0.07, 8.2], [x, 6.31, -0.5], cyanGlow);
    }
    for (let x = -8; x <= 8; x += 2) {
      box(room, [0.035, 0.035, 10], [x, -0.008, 0.6], material(0x5b7180));
    }
    for (let z = -3.7; z <= 5; z += 2) {
      box(room, [18, 0.035, 0.035], [0, 0.001, z], material(0x5b7180));
    }

    // The front bench stays in every location, anchoring the 2D search layer to a 3D workspace.
    box(room, [15.5, 0.29, 8.5], [0, 1.53, 3.4], material(0x527486, { roughness: 0.42 }), true);
    box(room, [15.6, 0.09, 0.16], [0, 1.71, 7.63], mintGlow);
    for (const x of [-6.9, 6.9]) {
      box(room, [0.38, 1.44, 2.5], [x, 0.72, 1.5], charcoal, true);
      box(room, [1.25, 0.11, 1.6], [x, 0.78, 1.5], blue);
    }
    box(room, [15.1, 0.12, 0.16], [0, 0.31, 3.05], ink);
    for (const x of [-6.8, -5.85, 5.85, 6.8]) {
      box(room, [0.72, 0.46, 0.84], [x, 1.91, 4.65], x < 0 ? blue : charcoal, true);
      box(room, [0.55, 0.28, 0.03], [x, 1.98, 5.09], material(0x263d4d));
      box(room, [0.2, 0.045, 0.04], [x, 1.95, 5.13], x < 0 ? amberGlow : mintGlow);
    }
    box(room, [2.7, 0.12, 1.55], [-3.65, 1.76, 5.45], material(0x225e61), true);
    for (let i = 0; i < 15; i++) {
      const x = -4.75 + (i % 5) * 0.52;
      const z = 4.95 + Math.floor(i / 5) * 0.42;
      box(room, [0.28, 0.11, 0.23], [x, 1.89, z], i % 4 === 0 ? gold : i % 3 === 0 ? coral : charcoal);
      if (i % 3 === 0) sphere(room, 0.035, [x + 0.1, 1.96, z], mintGlow);
    }
    box(room, [2.32, 0.055, 1.36], [3.9, 1.73, 5.64], material(0xe0d3b3), true);
    for (let i = 0; i < 5; i++) box(room, [1.65 - i * 0.13, 0.018, 0.025], [3.77, 1.77, 5.26 + i * 0.21], blue);
    box(room, [0.45, 0.18, 1.58], [1.2, 1.84, 5.5], coral, true).rotation.y = 0.27;
    box(room, [0.15, 0.1, 0.4], [1.36, 1.85, 6.13], steel);
    cylinder(room, 0.37, 0.37, 0.14, [-0.55, 1.81, 4.96], charcoal);
    for (let i = 0; i < 4; i++) wire(room, [[-0.55, 1.9, 4.96], [-0.65 + i * 0.13, 2.1, 5.12], [-1.1 + i * 0.25, 1.84, 5.74]], 0.016, i % 2 ? gold : coral);
    box(room, [16.4, 0.19, 1.2], [0, 4.52, -3.24], charcoal, true);
    box(room, [16.3, 0.055, 0.07], [0, 4.44, -2.62], cyanGlow);
    for (let i = 0; i < 7; i++) {
      const x = -7.2 + i * 2.4;
      box(room, [1.4, 1.55, 0.75], [x, 3.36, -3.87], i % 2 ? blue : charcoal, true);
      box(room, [1.14, 0.75, 0.06], [x, 3.55, -3.45], material(i % 3 === 0 ? 0x366f75 : 0x18394c));
      box(room, [0.62, 0.04, 0.07], [x, 2.92, -3.42], i % 3 === 0 ? amberGlow : mintGlow);
    }
    for (const x of [-5.8, -2.7, 2.7, 5.8]) {
      box(room, [0.08, 1.25, 0.08], [x, 2.52, -3.1], steel);
      box(room, [0.9, 0.13, 0.36], [x, 3.17, -2.96], steel);
      box(room, [0.77, 0.1, 0.32], [x, 3.05, -2.92], amberGlow);
    }
    wire(room, [[-7.1, 1.76, 3.3], [-6.1, 1.81, 3.65], [-4.5, 1.82, 3.4], [-2.7, 1.82, 4.0]], 0.038, coral);
    wire(room, [[2.4, 1.78, 3.7], [3.4, 1.84, 4.1], [4.8, 1.82, 3.7], [6.4, 1.76, 4.1]], 0.03, gold);
    wire(room, [[-1.2, 1.77, 3.4], [-0.3, 1.9, 3.8], [0.6, 1.82, 3.5], [1.4, 1.8, 4.2]], 0.028, blue);

    const monitorScreens = [];
    function monitor(parent, x, y, z, scale = 1, color = 0x66eac8) {
      const group = new THREE.Group(); group.position.set(x, y, z); group.scale.setScalar(scale); parent.add(group);
      box(group, [1.78, 1.28, 0.31], [0, 0, 0], charcoal, true);
      box(group, [1.53, 0.98, 0.035], [0, 0.04, 0.178], material(0x0c3144, { emissive: 0x12445b, emissiveIntensity: 0.3 }));
      const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 160;
      const ctx = canvas.getContext('2d');
      const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
      const display = new THREE.Mesh(new THREE.PlaneGeometry(1.46, 0.91), new THREE.MeshBasicMaterial({ map: texture }));
      display.position.set(0, 0.04, 0.204); group.add(display);
      box(group, [0.17, 0.31, 0.17], [0, -0.76, 0], steel);
      box(group, [0.84, 0.07, 0.55], [0, -0.92, 0.16], charcoal);
      sphere(group, 0.028, [0.7, -0.55, 0.175], mintGlow);
      monitorScreens.push({ ctx, texture, color, canvas });
      return group;
    }
    monitor(room, -4.65, 2.45, -0.84, 1.12);
    monitor(room, 0, 2.32, -1.0, 1.04, 0x69d8ff);
    monitor(room, 4.55, 2.48, -0.83, 1.14, 0xffbd76);
    box(room, [1.6, 0.09, 0.55], [-4.65, 1.8, -0.03], steel);
    box(room, [1.45, 0.09, 0.55], [0, 1.8, -0.03], steel);
    box(room, [1.6, 0.09, 0.55], [4.55, 1.8, -0.03], steel);

    const locations = new Map();
    function location(key, title, color) {
      const group = new THREE.Group(); group.visible = false; room.add(group);
      label(group, title, [0, 5.64, -4.17], 3.6, color);
      locations.set(key, group);
      return group;
    }
    const hardware = location('hardware-bay', 'HARDWARE BAY', '#99f4d1');
    box(hardware, [2.65, 0.1, 1.3], [-1.45, 1.77, 1.9], material(0x2d9b7f), true);
    for (let i = 0; i < 7; i++) {
      const x = -2.47 + i * 0.32;
      box(hardware, [0.18, 0.16, 0.23], [x, 1.91, 1.7 + (i % 2) * 0.32], i % 3 ? ink : gold);
      box(hardware, [0.09, 0.04, 0.08], [x, 2.01, 1.7 + (i % 2) * 0.32], i % 2 ? mintGlow : amberGlow);
    }
    const scope = box(hardware, [1.72, 0.92, 0.93], [3.12, 2.13, 1.01], pale, true);
    box(scope, [1.06, 0.59, 0.055], [-0.17, 0.08, 0.49], material(0x0c3144));
    for (let i = 0; i < 3; i++) cylinder(scope, 0.07, 0.07, 0.08, [0.63, 0.22 - i * 0.24, 0.49], i ? charcoal : amberGlow).rotation.x = Math.PI / 2;
    wire(hardware, [[-5.4, 1.95, 1.5], [-4.8, 2.4, 0.6], [-3.5, 2.5, -0.8], [-2.2, 2.08, 1.9]], 0.026, coral);
    for (let i = 0; i < 9; i++) box(hardware, [0.08, 0.7 + (i % 3) * 0.16, 0.09], [-5.7 + i * 0.29, 4.13, -2.95], i % 3 ? steel : gold);

    const server = location('server-room', 'SERVER ROOM', '#8ee7ff');
    for (const x of [-5.7, -3.6, 3.6, 5.7]) {
      box(server, [1.85, 3.3, 1.18], [x, 2.82, -2.13], charcoal, true);
      for (let i = 0; i < 8; i++) {
        box(server, [1.54, 0.23, 0.1], [x, 1.55 + i * 0.37, -1.5], i % 2 ? blue : steel);
        sphere(server, 0.035, [x + 0.57, 1.55 + i * 0.37, -1.42], i % 5 ? mintGlow : amberGlow);
      }
    }
    box(server, [2.5, 0.13, 1.25], [0.15, 1.78, 1.7], blue, true);
    for (let i = 0; i < 11; i++) box(server, [0.12, 0.08, 0.34], [-0.9 + i * 0.21, 1.9, 1.7], i % 3 ? charcoal : mintGlow);
    wire(server, [[-5.9, 4.5, -1.6], [-3.8, 4.85, -1.7], [-1.5, 4.55, -3], [0, 4.45, -3.2]], 0.045, gold);

    const quantum = location('quantum-core', 'QUANTUM CORE', '#b5b2ff');
    cylinder(quantum, 1.12, 1.4, 0.32, [0, 1.92, 1.32], charcoal);
    const core = sphere(quantum, 0.43, [0, 2.75, 1.32], material(0x88caff, { emissive: 0x4377da, emissiveIntensity: 1.1, metalness: 0.45 }));
    const rings = [];
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.79 + i * 0.13, 0.055, 8, 48), i === 1 ? gold : cyanGlow);
      ring.position.set(0, 2.75, 1.32); ring.rotation.x = Math.PI / 2 + i * 0.45;
      quantum.add(ring); rings.push(ring);
    }
    for (const x of [-4.1, 4.1]) {
      cylinder(quantum, 0.37, 0.42, 1.2, [x, 2.15, 1.4], steel);
      sphere(quantum, 0.22, [x, 2.88, 1.4], mintGlow);
    }

    const signal = location('signal-vault', 'SIGNAL VAULT', '#ffc58d');
    for (const x of [-5.5, 5.5]) {
      box(signal, [2.1, 2.4, 0.86], [x, 2.74, -2.3], steel, true);
      box(signal, [1.65, 1.2, 0.07], [x, 2.98, -1.8], material(0x183c53));
      for (let i = 0; i < 5; i++) box(signal, [1.45, 0.055, 0.08], [x, 2.2 + i * 0.24, -1.71], i % 2 ? mintGlow : amberGlow);
    }
    const dish = new THREE.Mesh(new THREE.SphereGeometry(1.05, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), material(0x7c9daa, { metalness: 0.72, side: THREE.DoubleSide }));
    dish.rotation.x = -0.37; dish.position.set(0.4, 3.0, 0.9); signal.add(dish);
    cylinder(signal, 0.11, 0.17, 1.3, [0.4, 2.02, 0.9], charcoal);
    sphere(signal, 0.14, [0.4, 3.35, 1.16], amberGlow);
    for (let i = 0; i < 6; i++) wire(signal, [[-3.2 + i * 0.25, 1.84, 1.4], [-1.8 + i * 0.21, 2.1, 0.8], [0.1, 2.38, 1.2]], 0.018, i % 2 ? gold : coral);

    const fabrication = location('fabrication-deck', 'FABRICATION DECK', '#ffd291');
    box(fabrication, [3.1, 0.25, 1.9], [0.3, 1.84, 1.44], steel, true);
    const arm = new THREE.Group(); arm.position.set(2.4, 2.0, 1.0); fabrication.add(arm);
    cylinder(arm, 0.46, 0.56, 0.3, [0, 0, 0], charcoal);
    const lower = box(arm, [0.34, 1.55, 0.42], [-0.3, 0.83, 0], gold, true); lower.rotation.z = 0.38;
    sphere(arm, 0.27, [-0.58, 1.54, 0], steel);
    const upper = box(arm, [1.5, 0.28, 0.36], [-1.25, 1.68, 0], gold, true); upper.rotation.z = -0.19;
    box(arm, [0.32, 0.46, 0.32], [-2.04, 1.49, 0], charcoal);
    for (const x of [-2.14, -1.94]) box(arm, [0.075, 0.31, 0.12], [x, 1.18, 0], steel);
    for (let i = 0; i < 6; i++) box(fabrication, [0.32, 0.29, 0.38], [-4.5 + i * 0.46, 1.85, 1.5], i % 2 ? coral : blue, true);
    for (let i = 0; i < 8; i++) box(fabrication, [0.12, 0.9, 0.11], [-5.9 + i * 0.31, 4.09, -2.85], i % 2 ? steel : gold);

    const archive = location('esd-archive', 'ESD ARCHIVE', '#9ce6c4');
    box(archive, [5.8, 0.08, 1.9], [0, 1.82, 1.9], material(0x326b63), true);
    for (let i = 0; i < 12; i++) {
      const x = -5.8 + (i % 6) * 2.28;
      const y = 2.84 + Math.floor(i / 6) * 0.83;
      box(archive, [1.82, 0.62, 0.42], [x, y, -3.1], i % 3 ? steel : blue, true);
      box(archive, [1.52, 0.11, 0.025], [x, y, -2.86], charcoal);
      sphere(archive, 0.035, [x + 0.67, y - 0.18, -2.83], i % 4 ? mintGlow : amberGlow);
    }
    for (let i = 0; i < 6; i++) box(archive, [0.66, 0.34, 0.59], [-2.3 + i * 0.92, 2.05, 1.85], i % 2 ? charcoal : blue, true);

    const robotics = location('robotics-lab', 'ROBOTICS LAB', '#91daf5');
    box(robotics, [6.7, 0.11, 2.0], [0, 1.82, 1.6], blue, true);
    const robotRig = new THREE.Group(); robotRig.position.set(-0.5, 1.92, 1.25); robotics.add(robotRig);
    cylinder(robotRig, 0.47, 0.52, 0.24, [0, 0.12, 0], charcoal);
    box(robotRig, [0.43, 1.5, 0.42], [-0.38, 0.89, 0], gold, true).rotation.z = 0.28;
    sphere(robotRig, 0.24, [-0.62, 1.57, 0], steel);
    box(robotRig, [1.65, 0.34, 0.38], [-1.33, 1.62, 0], gold, true).rotation.z = -0.16;
    for (const x of [-2.08, -1.87]) box(robotRig, [0.09, 0.42, 0.14], [x, 1.35, 0], steel);
    for (const x of [2.3, 3.2]) {
      cylinder(robotics, 0.38, 0.41, 0.75, [x, 2.22, 1.62], charcoal);
      cylinder(robotics, 0.15, 0.15, 0.1, [x, 2.66, 1.62], steel);
    }
    wire(robotics, [[-5, 1.86, 2.1], [-3.8, 2.07, 1.5], [-2.2, 1.89, 1.8]], 0.03, coral);

    const power = location('power-systems', 'POWER SYSTEMS', '#ffd191');
    for (const x of [-4.8, -2.0, 2.0, 4.8]) {
      box(power, [2.2, 1.6, 0.7], [x, 2.62, -3.05], charcoal, true);
      box(power, [1.64, 0.6, 0.04], [x, 2.82, -2.67], material(0x264e5c));
      for (let i = 0; i < 3; i++) sphere(power, 0.06, [x - 0.54 + i * 0.52, 2.29, -2.63], i ? amberGlow : mintGlow);
    }
    for (const x of [-3.5, 0, 3.5]) {
      cylinder(power, 0.4, 0.43, 0.58, [x, 2.06, 1.76], steel);
      const coil = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.065, 8, 24), gold);
      coil.rotation.x = Math.PI / 2; coil.position.set(x, 2.42, 1.76); power.add(coil);
    }
    wire(power, [[-5.5, 1.84, 2.2], [-3.2, 1.84, 2.8], [0, 1.84, 2.1], [3.2, 1.84, 2.8], [5.5, 1.84, 2.2]], 0.04, coral);

    const firmware = location('firmware-studio', 'FIRMWARE STUDIO', '#8ff4d1');
    for (let i = 0; i < 9; i++) {
      const x = -5.5 + (i % 3) * 5.5;
      const y = 2.35 + Math.floor(i / 3) * 0.58;
      box(firmware, [2.15, 0.47, 0.45], [x, y, -3.18], i % 2 ? charcoal : blue, true);
      box(firmware, [1.42, 0.15, 0.025], [x - 0.18, y, -2.93], material(0x123b45));
      sphere(firmware, 0.034, [x + 0.79, y, -2.9], i % 4 ? mintGlow : amberGlow);
    }
    box(firmware, [3.4, 0.09, 1.65], [0, 1.81, 1.83], material(0x246c62), true);
    for (let i = 0; i < 6; i++) box(firmware, [0.27, 0.12, 0.4], [-1.25 + i * 0.48, 1.96, 1.55], i % 3 ? charcoal : gold);

    const demo = location('demo-theater', 'DEMO THEATER', '#ffda9a');
    box(demo, [9.4, 0.23, 2.1], [0, 1.83, -1.9], material(0x3f5363), true);
    box(demo, [6.4, 2.65, 0.15], [0, 3.8, -3.84], charcoal, true);
    box(demo, [5.95, 2.2, 0.045], [0, 3.83, -3.74], material(0x154657, { emissive: 0x164958, emissiveIntensity: 0.45 }));
    for (let i = 0; i < 4; i++) {
      box(demo, [0.62, 0.08, 0.045], [-2.24 + i * 1.48, 3.18 + (i % 2) * 0.3, -3.7], i === 3 ? amberGlow : mintGlow);
      sphere(demo, 0.14, [-3.55 + i * 2.36, 5.02, -3.1], amberGlow);
    }
    box(demo, [2.9, 0.1, 1.8], [0, 1.82, 1.45], material(0x2d8578), true);
    for (let i = 0; i < 5; i++) box(demo, [0.31, 0.18, 0.35], [-0.9 + i * 0.46, 1.96, 1.33], i % 2 ? gold : charcoal);

    const dustPositions = [];
    for (let i = 0; i < 130; i++) {
      const seed = Math.sin(i * 43.47) * 43758.5453;
      const frac = seed - Math.floor(seed);
      dustPositions.push((frac - 0.5) * 17, 0.6 + ((i * 0.618) % 1) * 5.1, -3 + ((i * 0.373) % 1) * 7);
    }
    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute('position', new THREE.Float32BufferAttribute(dustPositions, 3));
    const dust = new THREE.Points(dustGeometry, new THREE.PointsMaterial({ color: 0xc4eaff, size: 0.028, transparent: true, opacity: 0.34, depthWrite: false }));
    dust.visible = !reduceEffects();
    room.add(dust);

    const searchModels = new THREE.Group();
    room.add(searchModels);
    const modelTemplates = new Map();
    const searchObjects = new Map();
    function syncSearchModels() {
      searchModels.clear();
      searchObjects.clear();
      searchSvg.querySelectorAll('.hidden-object[data-world], .scene-prop[data-world]').forEach(target => {
        const id = target.dataset.id || target.dataset.icon;
        if (!modelTemplates.has(id)) modelTemplates.set(id, createComponentModel(id));
        const model = modelTemplates.get(id).clone(true);
        const [x, y, z] = target.dataset.world.split(',').map(Number);
        const scale = Number(target.dataset.scale) * (target.dataset.surface === 'shelf' ? .85 : 1);
        model.position.set(x, y, z);
        model.rotation.y += Number(target.dataset.rotation || 0) * Math.PI / 180;
        model.scale.setScalar(scale);
        model.userData.baseScale = scale;
        model.userData.baseY = y;
        model.userData.targetElement = target.classList.contains('hidden-object') ? target : null;
        searchModels.add(model);
        searchObjects.set(target, model);
      });
    }

    let width = 0, height = 0, lastDisplayUpdate = -1, ready = false, contextLost = false;
    const searchSvg = document.querySelector('#scene-svg');
    const projectedPoint = new THREE.Vector3();
    const baseCameraTarget = new THREE.Vector3(0, 2.15, -0.5);
    const zoomRaycaster = new THREE.Raycaster();
    let baseFov = 42, zoomLevel = 1, panX = 0, panY = 0;
    const minZoom = 1, maxZoom = 2.5;
    const panLayer = document.querySelector('#scene-pan-layer');

    function updateZoomResolution(force = false) {
      const targetPixelRatio = Math.min(maxZoomPixelRatio, basePixelRatio * zoomLevel);
      if (!force && Math.abs(targetPixelRatio - activePixelRatio) < 0.12) return;
      if (Math.abs(targetPixelRatio - activePixelRatio) < 0.01) return;
      activePixelRatio = targetPixelRatio;
      renderer.setPixelRatio(activePixelRatio);
    }

    function updatePanLayer() {
      const rect = wrap.getBoundingClientRect();
      const maxX = Math.max(0, (zoomLevel - 1) * rect.width / 2);
      const maxY = Math.max(0, (zoomLevel - 1) * rect.height / 2);
      panX = THREE.MathUtils.clamp(panX, -maxX, maxX);
      panY = THREE.MathUtils.clamp(panY, -maxY, maxY);
      if (panLayer) {
        panLayer.style.setProperty('--scene-pan-x', `${panX}px`);
        panLayer.style.setProperty('--scene-pan-y', `${panY}px`);
        panLayer.style.setProperty('--scene-view-zoom', zoomLevel);
      }
    }

    function applyCameraPose() {
      camera.position.set(0, 5.1, 12.7);
      camera.lookAt(baseCameraTarget);
      camera.updateMatrixWorld();
    }

    function updateZoomDisplay(forceResolution = false) {
      updateZoomResolution(forceResolution);
      const output = document.querySelector('#scene-zoom-level');
      const zoomOut = document.querySelector('#btn-scene-zoom-out');
      const zoomIn = document.querySelector('#btn-scene-zoom-in');
      const reset = document.querySelector('#btn-scene-zoom-reset');
      if (output) output.textContent = `${Math.round(zoomLevel * 100)}%`;
      if (zoomOut) zoomOut.disabled = zoomLevel <= minZoom + 0.001;
      if (zoomIn) zoomIn.disabled = zoomLevel >= maxZoom - 0.001;
      if (reset) reset.disabled = zoomLevel <= minZoom + 0.001 && Math.abs(panX) < 0.1 && Math.abs(panY) < 0.1;
      wrap.classList.toggle('zoomed', zoomLevel > 1.001);
      wrap.dispatchEvent(new CustomEvent('scenezoomchange'));
    }

    function setZoom(next, clientX, clientY) {
      next = THREE.MathUtils.clamp(next, minZoom, maxZoom);
      if (Math.abs(next - zoomLevel) < 0.001) return;
      const rect = wrap.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      if (clientX == null || clientY == null) {
        clientX = rect.left + rect.width / 2;
        clientY = rect.top + rect.height / 2;
      }
      const x = clientX - rect.left - rect.width / 2;
      const y = clientY - rect.top - rect.height / 2;
      const localX = (x - panX) / zoomLevel;
      const localY = (y - panY) / zoomLevel;
      zoomLevel = next;
      panX = x - localX * zoomLevel;
      panY = y - localY * zoomLevel;
      updatePanLayer();
      updateZoomDisplay();
    }

    function resetZoom() {
      zoomLevel = minZoom;
      panX = 0; panY = 0;
      updatePanLayer();
      updateZoomDisplay(true);
    }

    function panBy(dx, dy) {
      if (zoomLevel <= minZoom + 0.001) return;
      panX += dx;
      panY += dy;
      updatePanLayer();
      updateZoomDisplay();
    }

    function placeSearchProps() {
      if (!width || !height) return;
      const scale = Math.min(width / 1600, height / 900);
      const insetX = (width - 1600 * scale) / 2;
      const insetY = (height - 900 * scale) / 2;
      const portraitMix = Math.max(0, Math.min(1, (1.55 - width / height) / 0.7));
      camera.updateMatrixWorld();
      searchSvg.querySelectorAll('.hidden-object[data-world], .scene-prop[data-world]').forEach(target => {
        const [x, y, z] = target.dataset.world.split(',').map(Number);
        let surfaceX = x;
        if (portraitMix) {
          projectedPoint.set(0, y, z).project(camera);
          const centerX = projectedPoint.x;
          projectedPoint.set(1, y, z).project(camera);
          const pixelsPerUnit = (projectedPoint.x - centerX) * width / 2;
          const fittedX = (x / 6.5) * width * 0.42 / pixelsPerUnit;
          surfaceX += (fittedX - x) * portraitMix;
        }
        projectedPoint.set(surfaceX, y, z).project(camera);
        if (Math.abs(projectedPoint.x) > 0.8) {
          const edgeX = Math.sign(projectedPoint.x) * 0.8;
          projectedPoint.set(0, y, z).project(camera);
          const centerX = projectedPoint.x;
          projectedPoint.set(1, y, z).project(camera);
          surfaceX = (edgeX - centerX) / (projectedPoint.x - centerX);
          projectedPoint.set(surfaceX, y, z).project(camera);
        }
        const model = searchObjects.get(target);
        if (model) {
          model.position.x = surfaceX;
          if (target.classList.contains('found')) {
            if (!model.userData.pickedAt) model.userData.pickedAt = performance.now();
            const progress = Math.min(1, (performance.now() - model.userData.pickedAt) / 420);
            model.position.y = model.userData.baseY + progress * .36;
            model.scale.setScalar(model.userData.baseScale * (1 - progress));
            model.visible = progress < 1;
          }
        }
        const screenX = ((projectedPoint.x + 1) * width / 2 - insetX) / scale;
        const screenY = ((1 - projectedPoint.y) * height / 2 - insetY) / scale;
        const size = Number(target.dataset.scale) * (target.dataset.surface === 'shelf' ? 0.88 : 1);
        target.setAttribute('transform', `translate(${screenX.toFixed(1)},${screenY.toFixed(1)}) rotate(${target.dataset.rotation}) scale(${size.toFixed(3)})`);
        target.querySelector('.surface-art').setAttribute('transform', target.dataset.surface === 'bench' ? 'translate(0 -7) scale(1 .82)' : 'translate(0 -8) scale(1 .9)');
      });
    }
    let currentKey = host.dataset.level || 'hardware-bay';
    function setLevel(key) {
      currentKey = locations.has(key) ? key : 'hardware-bay';
      for (const [name, group] of locations) group.visible = name === currentKey;
      syncSearchModels();
      resetZoom();
      const lightColors = {
        'hardware-bay': 0x55e6b9, 'server-room': 0x61cfff,
        'quantum-core': 0x9b90ff, 'signal-vault': 0xffbe72,
        'fabrication-deck': 0xffb75b
      };
      greenLight.color.setHex(lightColors[currentKey]);
      resize();
    }
    const searchRaycaster = new THREE.Raycaster();
    function hitTest(clientX, clientY) {
      if (!ready || contextLost) return null;
      const rect = wrap.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      const localX = (clientX - rect.left - rect.width / 2 - panX) / zoomLevel + rect.width / 2;
      const localY = (clientY - rect.top - rect.height / 2 - panY) / zoomLevel + rect.height / 2;
      const x = localX / rect.width * 2 - 1;
      const y = 1 - localY / rect.height * 2;
      camera.updateMatrixWorld();
      searchRaycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const candidates = [...searchObjects.values()].filter(model =>
        model.userData.targetElement && !model.userData.targetElement.classList.contains('found'));
      for (const hit of searchRaycaster.intersectObjects(candidates, true)) {
        let node = hit.object;
        while (node && node !== searchModels) {
          if (node.userData.targetElement) return node.userData.targetElement;
          node = node.parent;
        }
      }
      return null;
    }
    const componentThumbnailCache = new Map();
    function renderComponentThumbnails(ids) {
      const requested = [...new Set(ids)];
      const missing = requested.filter(id => !componentThumbnailCache.has(id));
      if (missing.length && !contextLost) {
        const tileWidth = 96, tileHeight = 64, cellWidth = 2.1, cellHeight = 1.4;
        const columns = Math.min(5, missing.length), rows = Math.ceil(missing.length / columns);
        const targetWidth = columns * tileWidth, targetHeight = rows * tileHeight;
        const previewTarget = new THREE.WebGLRenderTarget(targetWidth, targetHeight, {
          format: THREE.RGBAFormat, type: THREE.UnsignedByteType, depthBuffer: true
        });
        previewTarget.texture.colorSpace = THREE.SRGBColorSpace;
        const previewScene = new THREE.Scene();
        previewScene.background = new THREE.Color(0x0b1a25);
        previewScene.add(new THREE.HemisphereLight(0xe2f8ff, 0x223644, 2.5));
        const previewKey = new THREE.DirectionalLight(0xd7f3ff, 3.1);
        previewKey.position.set(-3, 6, 8);
        previewScene.add(previewKey);
        const previewFill = new THREE.DirectionalLight(0xffd8a2, 1.35);
        previewFill.position.set(4, 2, -4);
        previewScene.add(previewFill);
        const previewCamera = new THREE.OrthographicCamera(
          -columns * cellWidth / 2, columns * cellWidth / 2,
          rows * cellHeight / 2, -rows * cellHeight / 2, 0.1, 50
        );
        previewCamera.position.set(0, 3.2, 18);
        previewCamera.lookAt(0, 0, 0);
        previewCamera.updateProjectionMatrix();

        missing.forEach((id, index) => {
          const model = createComponentModel(id);
          const bounds = new THREE.Box3().setFromObject(model);
          const center = bounds.getCenter(new THREE.Vector3());
          const size = bounds.getSize(new THREE.Vector3());
          const scale = 1.12 / Math.max(size.x, size.y, size.z, 0.01);
          model.scale.setScalar(scale);
          model.position.set(
            -columns * cellWidth / 2 + (index % columns + 0.5) * cellWidth - center.x * scale,
            rows * cellHeight / 2 - (Math.floor(index / columns) + 0.5) * cellHeight - center.y * scale,
            -center.z * scale
          );
          previewScene.add(model);
        });

        const previousTarget = renderer.getRenderTarget();
        const previousViewport = renderer.getViewport(new THREE.Vector4());
        const previousScissor = renderer.getScissor(new THREE.Vector4());
        const previousScissorTest = renderer.getScissorTest();
        try {
          renderer.setRenderTarget(previewTarget);
          renderer.setViewport(0, 0, targetWidth, targetHeight);
          renderer.setScissorTest(false);
          renderer.clear(true, true, true);
          renderer.render(previewScene, previewCamera);
          const pixels = new Uint8Array(targetWidth * targetHeight * 4);
          renderer.readRenderTargetPixels(previewTarget, 0, 0, targetWidth, targetHeight, pixels);
          const sheet = document.createElement('canvas');
          sheet.width = targetWidth; sheet.height = targetHeight;
          const context = sheet.getContext('2d');
          const image = context.createImageData(targetWidth, targetHeight);
          const rowBytes = targetWidth * 4;
          for (let y = 0; y < targetHeight; y++) {
            const sourceStart = (targetHeight - y - 1) * rowBytes;
            image.data.set(pixels.subarray(sourceStart, sourceStart + rowBytes), y * rowBytes);
          }
          context.putImageData(image, 0, 0);
          missing.forEach((id, index) => {
            const tile = document.createElement('canvas');
            tile.width = tileWidth; tile.height = tileHeight;
            tile.getContext('2d').drawImage(
              sheet, (index % columns) * tileWidth, Math.floor(index / columns) * tileHeight,
              tileWidth, tileHeight, 0, 0, tileWidth, tileHeight
            );
            componentThumbnailCache.set(id, tile.toDataURL('image/png'));
          });
        } catch (error) {
          console.warn('Component previews could not be rendered.', error);
        } finally {
          renderer.setRenderTarget(previousTarget);
          renderer.setViewport(previousViewport);
          renderer.setScissor(previousScissor);
          renderer.setScissorTest(previousScissorTest);
          previewTarget.dispose();
          previewScene.traverse(object => {
            if (object.isMesh && object.material?.map) {
              object.material.map.dispose();
              object.material.dispose();
            }
          });
        }
      }
      return Object.fromEntries(requested.filter(id => componentThumbnailCache.has(id))
        .map(id => [id, componentThumbnailCache.get(id)]));
    }
    window.CircuitGameScene = {
      setLevel, hitTest, setZoom, resetZoom, panBy, renderComponentThumbnails,
      getZoom: () => zoomLevel,
      isDefault: () => zoomLevel <= minZoom + 0.001 && Math.abs(panX) < 0.1 && Math.abs(panY) < 0.1
    };
    setLevel(currentKey);

    function resize() {
      const nextWidth = host.clientWidth, nextHeight = host.clientHeight;
      if (!nextWidth || !nextHeight || (width === nextWidth && height === nextHeight)) return;
      width = nextWidth; height = nextHeight;
      camera.aspect = width / height;
      baseFov = width / height < 1.55 ? 49 : 42;
      camera.fov = baseFov;
      camera.updateProjectionMatrix();
      applyCameraPose();
      updatePanLayer();
      renderer.setSize(width, height, false);
    }
    new ResizeObserver(resize).observe(host);
    function updateDisplays(time) {
      monitorScreens.forEach(({ ctx, texture, color, canvas }, index) => {
        const w = canvas.width, h = canvas.height;
        ctx.fillStyle = '#102739'; ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = '#1d4957'; ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 24) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
        for (let y = 0; y < h; y += 24) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
        ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
        ctx.font = '700 14px "Space Mono", monospace'; ctx.fillText(index === 0 ? 'COMPLAB 2 / TRACE' : index === 1 ? 'CLASS / SIGNAL' : 'POWER / LOCAL', 17, 28);
        ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 3; ctx.beginPath();
        for (let x = 16; x < w - 13; x += 3) {
          const y = 96 + Math.sin(x * 0.052 - time * 1.8 + index) * (16 + index * 4) + Math.sin(x * 0.14 + time) * 5;
          if (x === 16) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.fillStyle = '#a6c6cc'; ctx.font = '400 12px "Space Mono", monospace';
        ctx.fillText(`CH-${index + 1}   ${index === 1 ? 'NET OK' : '5.00V'}`, 16, 145);
        texture.needsUpdate = true;
      });
    }
    const sceneStartTime = performance.now();
    let lastFrameRendered = 0;
    function frame(now) {
      requestAnimationFrame(frame);
      if (contextLost) return;
      if (!game.classList.contains('active')) return;
      if (document.querySelector('.overlay.active')) return;
      if (now - lastFrameRendered < (reduceEffects() ? 33.3 : 16.67)) return;
      lastFrameRendered = now;
      resize();
      if (!width || !height) return;
      const time = (now - sceneStartTime) / 1000;
      applyCameraPose();
      if (!reduceEffects()) {
        blueLight.intensity = 24 + Math.sin(time * 1.4) * 2.2;
        greenLight.intensity = 13 + Math.sin(time * 2.1) * 1.1;
        core.position.y = 2.75 + Math.sin(time * 1.4) * 0.06;
        rings.forEach((ring, index) => { ring.rotation.z = time * (index % 2 ? -0.18 : 0.13); });
        dust.rotation.y = Math.sin(time * 0.15) * 0.008;
        arm.rotation.z = Math.sin(time * 0.7) * 0.035;
        robotRig.rotation.y = Math.sin(time * 0.5) * 0.04;
      }
      if (time - lastDisplayUpdate > 0.13) { updateDisplays(time); lastDisplayUpdate = time; }
      placeSearchProps();
      renderer.render(scene, camera);
      if (!ready) { wrap.classList.add('has-3d-scene'); ready = true; }
    }
    requestAnimationFrame(frame);
    document.addEventListener('circuit-visual-settings-change', () => {
      const reduced = reduceEffects();
      dust.visible = !reduced;
      renderer.shadowMap.enabled = !reduced;
    });
    renderer.domElement.addEventListener('webglcontextlost', () => {
      contextLost = true;
      wrap.classList.remove('has-3d-scene');
      searchSvg.querySelectorAll('.hidden-object[data-fallback-transform], .scene-prop[data-fallback-transform]').forEach(target => {
        target.setAttribute('transform', target.dataset.fallbackTransform);
        target.querySelector('.surface-art').removeAttribute('transform');
      });
    }, { once: true });
  } else {
    const searchSvg = document.querySelector('#scene-svg');
    let zoomLevel = 1, panX = 0, panY = 0;
    const minZoom = 1, maxZoom = 2.5;
    function renderFallbackZoom() {
      searchSvg.style.transformBox = 'border-box';
      searchSvg.style.transformOrigin = '50% 50%';
      searchSvg.style.transform = `translate(${panX}px,${panY}px) scale(${zoomLevel})`;
      wrap.classList.toggle('zoomed', zoomLevel > 1.001);
      wrap.dispatchEvent(new CustomEvent('scenezoomchange'));
    }
    function setZoom(next, clientX, clientY) {
      next = Math.min(maxZoom, Math.max(minZoom, next));
      if (Math.abs(next - zoomLevel) < 0.001) return;
      const rect = wrap.getBoundingClientRect();
      const x = (clientX ?? rect.left + rect.width / 2) - rect.left - rect.width / 2;
      const y = (clientY ?? rect.top + rect.height / 2) - rect.top - rect.height / 2;
      const localX = (x - panX) / zoomLevel;
      const localY = (y - panY) / zoomLevel;
      zoomLevel = next;
      panX = x - localX * zoomLevel;
      panY = y - localY * zoomLevel;
      const maxX = (zoomLevel - 1) * rect.width / 2;
      const maxY = (zoomLevel - 1) * rect.height / 2;
      panX = Math.min(maxX, Math.max(-maxX, panX));
      panY = Math.min(maxY, Math.max(-maxY, panY));
      renderFallbackZoom();
    }
    function resetZoom() {
      zoomLevel = 1; panX = 0; panY = 0;
      renderFallbackZoom();
    }
    function panBy(dx, dy) {
      if (zoomLevel <= minZoom + 0.001) return;
      const rect = wrap.getBoundingClientRect();
      const maxX = (zoomLevel - 1) * rect.width / 2;
      const maxY = (zoomLevel - 1) * rect.height / 2;
      panX = Math.min(maxX, Math.max(-maxX, panX + dx));
      panY = Math.min(maxY, Math.max(-maxY, panY + dy));
      renderFallbackZoom();
    }
    window.CircuitGameScene = {
      setLevel: resetZoom, hitTest: () => null, setZoom, resetZoom, panBy,
      getZoom: () => zoomLevel,
      isDefault: () => zoomLevel <= minZoom + 0.001 && Math.abs(panX) < 0.1 && Math.abs(panY) < 0.1
    };
  }
}

const sceneWrap = document.querySelector('#scene-wrap');
if (sceneWrap && window.CircuitGameScene) {
  const zoomOut = document.querySelector('#btn-scene-zoom-out');
  const zoomIn = document.querySelector('#btn-scene-zoom-in');
  const reset = document.querySelector('#btn-scene-zoom-reset');
  const updateControls = () => {
    const zoom = window.CircuitGameScene.getZoom();
    const output = document.querySelector('#scene-zoom-level');
    output.textContent = `${Math.round(zoom * 100)}%`;
    zoomOut.disabled = zoom <= 1.001;
    zoomIn.disabled = zoom >= 2.499;
    reset.disabled = window.CircuitGameScene.isDefault();
  };
  zoomOut.innerHTML = window.CircuitIcons.markup('zoomOut');
  zoomIn.innerHTML = window.CircuitIcons.markup('zoomIn');
  reset.innerHTML = window.CircuitIcons.markup('reset');
  zoomOut.addEventListener('click', () => window.CircuitGameScene.setZoom(window.CircuitGameScene.getZoom() / 1.28));
  zoomIn.addEventListener('click', () => window.CircuitGameScene.setZoom(window.CircuitGameScene.getZoom() * 1.28));
  reset.addEventListener('click', () => window.CircuitGameScene.resetZoom());
  sceneWrap.addEventListener('wheel', event => {
    if (event.target.closest('.scene-zoom-controls')) return;
    event.preventDefault();
    window.CircuitGameScene.setZoom(window.CircuitGameScene.getZoom() * Math.exp(-event.deltaY * 0.001), event.clientX, event.clientY);
  }, { passive: false });

  const touchPoints = new Map();
  let pinchStart = null, pinchMoved = false, dragPan = null, suppressNextSceneClick = false, suppressClickTimer = 0;
  const suppressFollowingClick = () => {
    suppressNextSceneClick = true;
    clearTimeout(suppressClickTimer);
    suppressClickTimer = setTimeout(() => { suppressNextSceneClick = false; }, 0);
  };
  const canStartPan = event => !event.target.closest('.scene-zoom-controls, .scene-label, .zone-telemetry, .zone-reticle, .scene-status, .scene-arrival, .hidden-object')
    && window.CircuitGameScene.getZoom() > 1.001;
  const finishDragPan = pointerId => {
    if (!dragPan || (pointerId != null && dragPan.pointerId !== pointerId)) return false;
    const moved = dragPan.moved;
    dragPan = null;
    sceneWrap.classList.remove('is-panning');
    if (moved) suppressFollowingClick();
    return moved;
  };
  const moveDragPan = event => {
    if (!dragPan || dragPan.pointerId !== event.pointerId) return;
    const distance = Math.hypot(event.clientX - dragPan.startX, event.clientY - dragPan.startY);
    if (!dragPan.moved && distance < 5) return;
    if (!dragPan.moved) {
      try { sceneWrap.setPointerCapture(event.pointerId); } catch {}
    }
    dragPan.moved = true;
    sceneWrap.classList.add('is-panning');
    window.CircuitGameScene.panBy(event.clientX - dragPan.lastX, event.clientY - dragPan.lastY);
    dragPan.lastX = event.clientX;
    dragPan.lastY = event.clientY;
    event.preventDefault();
  };
  const pinchFrame = () => {
    const [a, b] = [...touchPoints.values()];
    return { distance: Math.hypot(a.x - b.x, a.y - b.y), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  };
  sceneWrap.addEventListener('pointerdown', event => {
    if (event.target.closest('.scene-zoom-controls')) return;
    if (event.pointerType === 'touch') {
      touchPoints.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (touchPoints.size === 1) {
        pinchMoved = false;
        if (canStartPan(event)) {
          dragPan = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, lastX: event.clientX, lastY: event.clientY, moved: false };
        }
      }
      if (touchPoints.size === 2) {
        const panned = finishDragPan();
        pinchStart = pinchFrame();
        pinchMoved = panned;
        sceneWrap.classList.add('scene-zooming');
        for (const pointerId of touchPoints.keys()) {
          try { sceneWrap.setPointerCapture(pointerId); } catch {}
        }
        event.preventDefault();
      }
      return;
    }
    if (event.button !== 0 || !canStartPan(event)) return;
    dragPan = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, lastX: event.clientX, lastY: event.clientY, moved: false };
  });
  sceneWrap.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' && touchPoints.has(event.pointerId)) {
      touchPoints.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (touchPoints.size === 2) {
        const next = pinchFrame();
        if (pinchStart?.distance > 0) {
          const zoom = window.CircuitGameScene.getZoom();
          if (Math.abs(next.distance - pinchStart.distance) > 1 || Math.hypot(next.x - pinchStart.x, next.y - pinchStart.y) > 1) pinchMoved = true;
          window.CircuitGameScene.setZoom(zoom * next.distance / pinchStart.distance, next.x, next.y);
        }
        pinchStart = next;
        event.preventDefault();
        return;
      }
      if (touchPoints.size === 1 && dragPan?.pointerId === event.pointerId) {
        moveDragPan(event);
        return;
      }
    }
    moveDragPan(event);
  });
  const releasePointer = event => {
    finishDragPan(event.pointerId);
    if (event.pointerType === 'touch' && touchPoints.has(event.pointerId)) {
      touchPoints.delete(event.pointerId);
      if (touchPoints.size < 2) pinchStart = null;
      if (!touchPoints.size) {
        sceneWrap.classList.remove('scene-zooming');
        if (pinchMoved) suppressFollowingClick();
        pinchMoved = false;
      }
    }
  };
  sceneWrap.addEventListener('pointerup', releasePointer);
  sceneWrap.addEventListener('pointercancel', releasePointer);
  sceneWrap.addEventListener('click', event => {
    if (suppressNextSceneClick) {
      event.preventDefault();
      event.stopImmediatePropagation();
      suppressNextSceneClick = false;
      clearTimeout(suppressClickTimer);
    }
  }, true);
  updateControls();
  sceneWrap.addEventListener('scenezoomchange', updateControls);
}
