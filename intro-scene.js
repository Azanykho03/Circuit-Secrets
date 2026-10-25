import * as THREE from 'three';

const host = document.querySelector('#intro-scene');
const screen = document.querySelector('#screen-prologue');

if (host && screen) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' });
  } catch (error) {
    host.dataset.unavailable = 'true';
  }

  if (renderer) {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1528);
    scene.fog = new THREE.Fog(0x0a1528, 19, 38);
    const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 55);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute('role', 'img');
    renderer.domElement.setAttribute('aria-label', 'Animated story of Fiona and her classmates investigating the CTU Danao Computer Lab 2 shutdown.');
    host.appendChild(renderer.domElement);

    const ambient = new THREE.HemisphereLight(0xc7e8ff, 0x334061, 2.2);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xffe8c9, 3.2);
    key.position.set(-4, 8, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, { left: -8, right: 8, top: 8, bottom: -6, near: 0.5, far: 28 });
    key.shadow.normalBias = 0.035;
    key.shadow.bias = -0.0002;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x69beff, 2.8);
    rim.position.set(5, 5, -4);
    scene.add(rim);
    const benchLight = new THREE.PointLight(0x3acbff, 10, 8, 2);
    benchLight.position.set(-1, 3, 2);
    scene.add(benchLight);

    const materials = new Map();
    const geometries = new Map();
    function material(color, options = {}) {
      const id = `${color}:${JSON.stringify(options)}`;
      if (!materials.has(id)) materials.set(id, new THREE.MeshStandardMaterial({ color, roughness: 0.52, metalness: 0.03, ...options }));
      return materials.get(id);
    }
    const navy = material(0x193a64);
    const blue = material(0x245aab);
    const cyan = material(0x33bdd3);
    const mint = material(0x4cdcae);
    const coral = material(0xed6a5f);
    const gold = material(0xf4bd55, { metalness: 0.2 });
    const cream = material(0xe6e2cd);
    const dark = material(0x152439);
    const charcoal = material(0x253149);
    const steel = material(0x718da5, { metalness: 0.5, roughness: 0.3 });
    const white = material(0xeef6f3);
    const hair = material(0x221e2a, { roughness: 0.76 });
    const glow = material(0x70e8ff, { emissive: 0x35bce3, emissiveIntensity: 1.1 });
    const greenGlow = material(0x82ffc9, { emissive: 0x30d894, emissiveIntensity: 0.65 });
    const amberGlow = material(0xffd47a, { emissive: 0xf6a434, emissiveIntensity: 0.7 });
    const alarmRed = material(0xff6d72, { emissive: 0xe52b44, emissiveIntensity: 0.75 });

    function mesh(parent, geometry, mat, position = [0, 0, 0], scale = null) {
      const object = new THREE.Mesh(geometry, mat);
      object.position.set(...position);
      if (scale) object.scale.set(...scale);
      object.castShadow = true;
      object.receiveShadow = true;
      parent.add(object);
      return object;
    }
    function roundedGeometry(w, h, d, radius = 0.08) {
      const key = `rounded:${w}:${h}:${d}:${radius}`;
      if (geometries.has(key)) return geometries.get(key);
      const r = Math.min(radius, w / 3, h / 3, d / 3);
      const x = -w / 2 + r, y = -h / 2 + r, iw = w - r * 2, ih = h - r * 2;
      const shape = new THREE.Shape();
      shape.moveTo(x, y); shape.lineTo(x + iw, y); shape.lineTo(x + iw, y + ih); shape.lineTo(x, y + ih); shape.closePath();
      const geometry = new THREE.ExtrudeGeometry(shape, { depth: d - r * 2, steps: 1, bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: 3, curveSegments: 4 });
      geometry.translate(0, 0, -d / 2 + r);
      geometry.computeVertexNormals();
      geometries.set(key, geometry);
      return geometry;
    }
    function box(parent, w, h, d, mat, x, y, z, radius = 0.06) {
      return mesh(parent, roundedGeometry(w, h, d, radius), mat, [x, y, z]);
    }
    const sphere = new THREE.SphereGeometry(1, 24, 18);
    const cylinder = new THREE.CylinderGeometry(1, 1, 1, 12);
    function oval(parent, mat, position, scale) { return mesh(parent, sphere, mat, position, scale); }
    function limb(parent, start, end, radius, mat, endRadius = radius) {
      const direction = new THREE.Vector3(...end).sub(new THREE.Vector3(...start));
      const cacheKey = `limb:${radius}:${endRadius}:${direction.length().toFixed(4)}`;
      if (!geometries.has(cacheKey)) geometries.set(cacheKey, new THREE.CylinderGeometry(radius, endRadius, direction.length(), 12));
      const object = mesh(parent, geometries.get(cacheKey), mat);
      object.position.copy(new THREE.Vector3(...start).add(new THREE.Vector3(...end)).multiplyScalar(0.5));
      object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
      return object;
    }
    function tube(parent, points, radius, mat) {
      const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));
      return mesh(parent, new THREE.TubeGeometry(curve, Math.max(10, points.length * 4), radius, 6, false), mat);
    }
    function texture(draw, width = 512, height = 256) {
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      draw(canvas.getContext('2d'), width, height);
      const map = new THREE.CanvasTexture(canvas);
      map.colorSpace = THREE.SRGBColorSpace;
      return map;
    }
    function placard(parent, words, w, h, position, background = '#142c49', foreground = '#b6eeff') {
      const map = texture((ctx, width, height) => {
        ctx.fillStyle = background; ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = foreground; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = `bold ${words.length > 18 ? 27 : 37}px Arial`;
        ctx.fillText(words, width / 2, height / 2, width - 38);
      }, 768, 128);
      const object = mesh(parent, new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map }), position);
      object.castShadow = false;
      return object;
    }

    const campus = new THREE.Group();
    const lab = new THREE.Group();
    scene.add(campus, lab);

    // The campus uses shared window instances, keeping the establishing shot inexpensive.
    box(campus, 22, 0.3, 16, material(0x293c59), 0, -0.2, -1);
    box(campus, 10.4, 4.8, 3.2, material(0x3c536f), 0, 2.5, -1.6, 0.15);
    box(campus, 3.3, 6.2, 3.8, navy, -3.8, 3.1, -1.35, 0.15);
    box(campus, 10.9, 0.28, 3.65, dark, 0, 4.95, -1.5);
    box(campus, 5.7, 0.24, 4.4, blue, 1.55, 2.2, -0.8);
    box(campus, 3.6, 0.2, 4.1, glow, -3.8, 6.22, -1.35);
    const windowGeometry = roundedGeometry(0.68, 1.22, 0.07, 0.025);
    const windows = new THREE.InstancedMesh(windowGeometry, material(0x8ce9ff, { emissive: 0x46b2cc, emissiveIntensity: 0.38, roughness: 0.22, metalness: 0.35 }), 16);
    const matrix = new THREE.Matrix4();
    for (let index = 0; index < 16; index++) {
      const x = index % 8 * 1.12 - 4;
      const y = index < 8 ? 1.23 : 3.45;
      windows.setMatrixAt(index, matrix.makeTranslation(x, y, 0.045));
      windows.setColorAt(index, new THREE.Color(index % 5 === 0 ? 0xffdc9b : index % 3 === 0 ? 0x80d5bf : 0x98dcff));
    }
    campus.add(windows);
    box(campus, 2.45, 2.65, 0.25, dark, -0.08, 1.33, 0.5);
    box(campus, 2.12, 2.45, 0.07, material(0x102b44), -0.08, 1.25, 0.65);
    const campusDoors = [];
    for (const sign of [-1, 1]) {
      const door = new THREE.Group();
      door.position.set(-0.08 + sign * 0.525, 1.25, 0.735);
      campus.add(door);
      box(door, 1.035, 2.35, 0.07, material(0x2c7b91, { metalness: 0.28, roughness: 0.25 }), 0, 0, 0, 0.025);
      box(door, 0.72, 1.37, 0.075, material(0x74c5c8, { metalness: 0.32, roughness: 0.3 }), 0, 0.38, 0.028, 0.02);
      box(door, 0.055, 0.43, 0.1, steel, -sign * 0.39, 0.07, 0.085, 0.015);
      campusDoors.push({ door, baseX: door.position.x, sign });
    }
    box(campus, 3.0, 0.15, 1.25, steel, -0.08, 0.05, 1.02);
    placard(campus, 'CTU DANAO ENGINEERING', 5.15, 0.53, [1.16, 4.54, 0.13]);
    placard(campus, 'COMPLAB 2', 2.1, 0.43, [-0.08, 2.76, 0.72], '#163153', '#79f3ca');
    placard(campus, 'LAB CLASS', 1.93, 0.42, [-3.8, 5.36, 0.61], '#245aab', '#fff0b5');
    for (const x of [-4, 4]) {
      box(campus, 1.7, 0.5, 1.2, material(0x647086), x, 0.24, 1.32);
      box(campus, 1.55, 0.63, 1.02, material(0x438f69), x, 0.7, 1.32, 0.15);
    }
    for (let i = 0; i < 5; i++) box(campus, 2.4, 0.04, 0.52, material(0x6d849b), -0.08, 0.0, 2.2 + i * 0.8, 0.01);
    box(campus, 0.12, 3.5, 0.12, steel, 5.7, 1.75, 2.5);
    box(campus, 0.72, 0.12, 0.37, glow, 5.5, 3.52, 2.5);
    for (const side of [-1, 1]) {
      const x = side * 4.1;
      box(campus, 1.85, 0.1, 1.34, steel, x, 0.93, 1.32, 0.035);
      oval(campus, material(0x388773), [x - 0.3, 1.21, 1.37], [0.47, 0.39, 0.42]);
      oval(campus, material(0x4ba677), [x + 0.29, 1.33, 1.27], [0.41, 0.46, 0.39]);
      oval(campus, material(0x67bc86), [x, 1.51, 1.35], [0.3, 0.3, 0.3]);
    }
    for (const side of [-1, 1]) {
      box(campus, 0.055, 4.38, 0.1, steel, side * 4.75, 2.42, 0.105, 0.012);
      box(campus, 0.07, 0.78, 0.08, glow, side * 4.75, 3.9, 0.17, 0.018);
    }
    box(campus, 2.65, 0.06, 0.08, greenGlow, -0.08, 0.23, 1.64, 0.012);

    box(lab, 13, 0.25, 10, material(0x27364c), 0, -0.12, -0.3);
    box(lab, 13, 6.5, 0.2, material(0x263b58), 0, 3.15, -3.65);
    box(lab, 0.18, 6.5, 9, material(0x20324c), -6.4, 3.15, 0.75);
    box(lab, 9.8, 0.08, 0.12, glow, 0, 4.82, -3.46, 0.02);
    box(lab, 6.2, 2.1, 0.12, dark, -0.7, 3.14, -3.45);
    box(lab, 5.85, 1.83, 0.06, material(0x216678, { metalness: 0.35, roughness: 0.3 }), -0.7, 3.14, -3.37);
    box(lab, 0.08, 1.87, 0.08, steel, -0.7, 3.14, -3.31, 0.015);
    box(lab, 5.95, 0.07, 0.08, steel, -0.7, 3.18, -3.31, 0.015);
    placard(lab, 'CTU DANAO   /   COMPUTER LAB 2', 4.2, 0.44, [-0.45, 4.28, -3.45]);
    box(lab, 1.55, 3.3, 0.86, charcoal, 4.45, 1.65, -2.85);
    const serverSlots = new THREE.InstancedMesh(roundedGeometry(1.27, 0.29, 0.08, 0.02), steel, 6);
    const serverLeds = new THREE.InstancedMesh(roundedGeometry(0.11, 0.06, 0.035, 0.009), greenGlow, 6);
    for (let i = 0; i < 6; i++) {
      serverSlots.setMatrixAt(i, matrix.makeTranslation(4.45, 0.52 + i * 0.44, -2.37));
      serverLeds.setMatrixAt(i, matrix.makeTranslation(4.87, 0.52 + i * 0.44, -2.31));
    }
    lab.add(serverSlots, serverLeds);
    for (const y of [0.77, 1.24, 1.71, 2.18]) {
      box(lab, 0.78, 0.025, 0.04, dark, 4.35, y, -2.3, 0.008);
      box(lab, 0.19, 0.035, 0.045, amberGlow, 4.01, y, -2.25, 0.008);
    }
    const wallSignals = new THREE.Group();
    lab.add(wallSignals);
    for (let i = 0; i < 5; i++) {
      const x = -3.17 + i * 1.14;
      box(wallSignals, 0.75, 0.05, 0.06, i % 2 ? mint : cyan, x, 3.71, -3.27, 0.01);
      box(wallSignals, 0.055, 0.46 + (i % 3) * 0.11, 0.05, i % 2 ? mint : cyan, x - 0.34, 3.39, -3.27, 0.01);
      box(wallSignals, 0.16, 0.16, 0.065, i === 2 ? gold : greenGlow, x + 0.34, 3.7, -3.24, 0.015);
    }
    box(lab, 2.25, 0.11, 0.5, charcoal, -4.6, 3.05, -2.8, 0.02);
    for (let i = 0; i < 5; i++) {
      box(lab, 0.27, 0.39, 0.37, i % 2 ? steel : blue, -5.48 + i * 0.4, 3.27, -2.8, 0.035);
    }
    box(lab, 1.8, 1.5, 1.2, blue, -4.45, 0.78, -2.35);
    box(lab, 2.1, 0.12, 1.4, steel, -4.4, 1.58, -2.3);
    box(lab, 1.05, 0.58, 0.72, cream, -4.5, 1.93, -2.3);
    box(lab, 0.8, 0.36, 0.025, dark, -4.5, 1.93, -1.92, 0.035);
    box(lab, 5.7, 0.2, 1.83, material(0x668198), 0, 1.5, 0.63, 0.1);
    box(lab, 5.8, 0.075, 0.08, cyan, 0, 1.49, 1.56, 0.018);
    box(lab, 0.22, 1.46, 1.24, charcoal, -2.4, 0.73, 0.68);
    box(lab, 0.22, 1.46, 1.24, charcoal, 2.4, 0.73, 0.68);
    box(lab, 2.1, 0.055, 1.22, material(0x245e65), 0.22, 1.626, 0.88, 0.015);
    const activityBoard = new THREE.Group();
    activityBoard.position.set(0.18, 1.7, 0.81);
    lab.add(activityBoard);
    box(activityBoard, 0.98, 0.07, 0.68, material(0x259c74), 0, 0, 0, 0.02);
    box(activityBoard, 0.34, 0.13, 0.28, dark, 0.02, 0.075, 0, 0.025);
    box(activityBoard, 0.35, 0.065, 0.075, gold, 0.03, 0.045, 0.31, 0.015);
    box(activityBoard, 0.12, 0.15, 0.11, steel, -0.33, 0.08, 0.12);
    box(activityBoard, 0.12, 0.15, 0.11, coral, -0.33, 0.08, -0.12);
    box(activityBoard, 0.06, 0.045, 0.06, greenGlow, 0.32, 0.065, 0.2, 0.01);
    const boardIndicators = [];
    for (let i = 0; i < 4; i++) {
      box(activityBoard, 0.09, 0.045, 0.15, i % 2 ? gold : steel, -0.29 + i * 0.17, 0.068, -0.16 + (i % 2) * 0.08, 0.012);
      const led = oval(activityBoard, i % 2 ? amberGlow : greenGlow, [-0.28 + i * 0.18, 0.079, 0.24], [0.029, 0.025, 0.029]);
      boardIndicators.push(led);
    }
    for (const z of [-0.19, 0.01, 0.17]) box(activityBoard, 0.22, 0.008, 0.025, gold, 0.21, 0.043, z, 0.003);
    tube(lab, [[0.32, 1.69, 0.9], [0.68, 1.69, 1.24], [1.28, 1.7, 1.3], [1.78, 1.8, 0.94]], 0.025, coral);
    tube(lab, [[-0.1, 1.68, 0.7], [-0.58, 1.68, 0.35], [-0.95, 1.7, 0.57], [-1.4, 1.86, 0.37]], 0.022, gold);
    box(lab, 0.3, 0.47, 0.2, gold, 1.76, 1.84, 0.85);
    box(lab, 0.23, 0.18, 0.025, dark, 1.76, 1.94, 0.966, 0.015);
    oval(lab, charcoal, [1.76, 1.73, 0.97], [0.07, 0.07, 0.025]);
    box(lab, 0.46, 0.055, 0.57, coral, 2.27, 1.657, 0.98, 0.02).rotation.y = -0.24;
    box(lab, 0.42, 0.025, 0.48, cream, 2.27, 1.695, 0.96, 0.01).rotation.y = -0.24;
    box(lab, 0.18, 0.36, 0.18, cyan, -2.28, 1.79, 1.12, 0.045);
    box(lab, 0.07, 0.07, 0.39, gold, -1.01, 1.66, 1.23, 0.015).rotation.y = 0.6;

    const traceCanvas = document.createElement('canvas');
    traceCanvas.width = 512; traceCanvas.height = 320;
    const traceContext = traceCanvas.getContext('2d');
    const traceMap = new THREE.CanvasTexture(traceCanvas);
    traceMap.colorSpace = THREE.SRGBColorSpace;
    const wallCanvas = document.createElement('canvas');
    wallCanvas.width = 768; wallCanvas.height = 240;
    const wallContext = wallCanvas.getContext('2d');
    const wallMap = new THREE.CanvasTexture(wallCanvas);
    wallMap.colorSpace = THREE.SRGBColorSpace;
    mesh(lab, new THREE.PlaneGeometry(5.75, 1.72), new THREE.MeshBasicMaterial({ map: wallMap, toneMapped: false }), [-0.7, 3.15, -3.27]).castShadow = false;
    box(lab, 1.42, 0.99, 0.47, cream, -1.88, 2.13, 0.22, 0.095);
    box(lab, 1.22, 0.77, 0.03, dark, -1.88, 2.13, 0.474, 0.05);
    mesh(lab, new THREE.PlaneGeometry(1.1, 0.65), new THREE.MeshBasicMaterial({ map: traceMap }), [-1.88, 2.15, 0.496]).castShadow = false;
    box(lab, 0.48, 0.16, 0.38, steel, -1.88, 1.67, 0.23);
    const warning = placard(lab, 'PROTOCOL ACTIVE', 1.42, 0.32, [0.12, 2.57, -3.23], '#312831', '#ffab6a');
    warning.visible = false;
    const emergencyRail = box(lab, 5.2, 0.075, 0.08, alarmRed, -0.7, 4.2, -3.24, 0.015);
    emergencyRail.visible = false;
    const emergencyLight = new THREE.PointLight(0xff667c, 0, 7, 2);
    emergencyLight.position.set(0, 3.7, -0.5);
    lab.add(emergencyLight);

    const characters = [];
    function character({ skinColor, jacket, hairColor = hair, professor = false, bob = false }) {
      const root = new THREE.Group();
      const skin = material(skinColor, { roughness: 0.64 });
      const skinShadow = material(professor ? 0xab7159 : 0xbc8068);
      const head = new THREE.Group();
      head.position.set(0, 2.86, 0);
      root.add(head);
      const faceGeometry = sphere.clone();
      const positions = faceGeometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const y = positions.getY(i);
        const taper = y < -0.05 ? 0.84 + (y + 1) * 0.18 : 1;
        positions.setXYZ(i, positions.getX(i) * 0.47 * taper, y * 0.59, positions.getZ(i) * 0.405);
      }
      faceGeometry.computeVertexNormals();
      mesh(head, faceGeometry, skin);
      oval(head, skin, [-0.445, -0.05, 0], [0.105, 0.153, 0.1]);
      oval(head, skin, [0.445, -0.05, 0], [0.105, 0.153, 0.1]);
      const hairGeometry = new THREE.SphereGeometry(1, 24, 14, 0, Math.PI * 2, 0, 1.46);
      const hairPositions = hairGeometry.attributes.position;
      for (let i = 0; i < hairPositions.count; i++) {
        const y = hairPositions.getY(i), front = Math.max(0, hairPositions.getZ(i));
        hairPositions.setY(i, y + 0.3 * front * front * (1 - y));
      }
      hairGeometry.computeVertexNormals();
      const hairCap = mesh(head, hairGeometry, hairColor, [0, 0.045, -0.035], [0.505, 0.62, 0.445]);
      hairCap.rotation.z = bob ? -0.07 : 0.045;
      if (bob) {
        oval(head, hairColor, [-0.425, -0.03, -0.13], [0.17, 0.48, 0.29]);
        oval(head, hairColor, [0.43, 0.02, -0.12], [0.145, 0.45, 0.27]);
        const lock = oval(head, hairColor, [-0.17, 0.35, 0.26], [0.34, 0.175, 0.165]);
        lock.rotation.z = -0.35;
        box(head, 0.11, 0.045, 0.03, gold, 0.37, 0.24, 0.3, 0.012).rotation.z = -0.28;
      } else {
        const fringe = oval(head, hairColor, [-0.12, 0.39, 0.24], [0.35, 0.15, 0.17]);
        fringe.rotation.z = 0.18;
      }
      const eyes = [];
      const pupil = material(0x233142, { roughness: 0.35 });
      for (const sign of [-1, 1]) {
        const eye = new THREE.Group();
        eye.position.set(sign * 0.188, 0.08, 0.356);
        head.add(eye);
        oval(eye, white, [0, 0, 0], [0.114, 0.105, 0.053]);
        oval(eye, pupil, [0.008, -0.004, 0.042], [0.056, 0.071, 0.025]);
        oval(eye, white, [-0.011, 0.022, 0.064], [0.018, 0.018, 0.012]);
        eyes.push(eye);
        tube(head, [[sign * 0.095, 0.222, 0.365], [sign * 0.185, 0.248, 0.379], [sign * 0.279, 0.22, 0.338]], 0.021, hairColor);
      }
      oval(head, skin, [0, -0.09, 0.395], [0.083, 0.13, 0.091]);
      tube(head, bob
        ? [[-0.105, -0.272, 0.342], [0, -0.266, 0.36], [0.105, -0.272, 0.342]]
        : [[-0.13, -0.262, 0.332], [0, -0.296, 0.36], [0.13, -0.257, 0.333]], 0.018, skinShadow);
      if (professor) {
        const frame = material(0x3b3433, { metalness: 0.35 });
        for (const sign of [-1, 1]) {
          tube(head, [[sign * 0.07, 0.17, 0.432], [sign * 0.29, 0.17, 0.427], [sign * 0.32, 0.03, 0.421], [sign * 0.27, -0.035, 0.429], [sign * 0.09, -0.025, 0.438], [sign * 0.07, 0.17, 0.432]], 0.016, frame);
        }
        tube(head, [[-0.07, 0.095, 0.444], [0, 0.12, 0.459], [0.07, 0.095, 0.444]], 0.016, frame);
      }
      limb(root, [0, 2.25, 0], [0, 2.48, 0], 0.16, skin);
      const torsoShape = new THREE.Shape();
      torsoShape.moveTo(-0.31, 1.29); torsoShape.lineTo(0.31, 1.29); torsoShape.lineTo(0.42, 2.11); torsoShape.quadraticCurveTo(0.36, 2.31, 0.17, 2.32); torsoShape.lineTo(-0.17, 2.32); torsoShape.quadraticCurveTo(-0.36, 2.31, -0.42, 2.11); torsoShape.closePath();
      const torsoGeometry = new THREE.ExtrudeGeometry(torsoShape, { depth: 0.31, bevelEnabled: true, bevelThickness: 0.095, bevelSize: 0.065, bevelSegments: 3, steps: 1, curveSegments: 6 });
      torsoGeometry.translate(0, 0, -0.165);
      mesh(root, torsoGeometry, jacket);
      box(root, 0.055, 0.84, 0.045, professor ? gold : cyan, 0, 1.85, 0.257, 0.015);
      const collarLeft = box(root, 0.18, 0.28, 0.075, professor ? steel : cyan, -0.14, 2.2, 0.22, 0.035);
      collarLeft.rotation.z = 0.35;
      const collarRight = box(root, 0.18, 0.28, 0.075, professor ? steel : cyan, 0.14, 2.2, 0.22, 0.035);
      collarRight.rotation.z = -0.35;
      box(root, 0.17, 0.16, 0.035, cream, -0.245, 1.99, 0.262, 0.02);
      box(root, 0.12, 0.035, 0.041, professor ? gold : coral, -0.245, 1.99, 0.282, 0.005);
      for (const sign of [-1, 1]) {
        limb(root, [sign * 0.18, 1.32, 0], [sign * 0.21, 0.22, 0], 0.18, material(0x263952), 0.13);
        box(root, 0.34, 0.19, 0.58, dark, sign * 0.21, 0.12, 0.14, 0.075);
        box(root, 0.34, 0.04, 0.59, cream, sign * 0.21, 0.052, 0.14, 0.01);
      }
      const arms = [];
      for (const sign of [-1, 1]) {
        const arm = new THREE.Group();
        arm.position.set(sign * 0.4, 2.14, 0);
        root.add(arm);
        limb(arm, [0, 0, 0], [sign * 0.16, -0.45, 0.09], 0.155, jacket, 0.128);
        oval(arm, jacket, [0, -0.04, 0], [0.18, 0.205, 0.18]);
        limb(arm, [sign * 0.16, -0.45, 0.09], [sign * 0.21, -0.59, 0.48], 0.13, jacket, 0.095);
        oval(arm, skin, [sign * 0.21, -0.61, 0.51], [0.115, 0.095, 0.16]);
        oval(arm, skin, [sign * 0.115, -0.58, 0.5], [0.055, 0.06, 0.09]);
        arms.push(arm);
      }
      if (professor) {
        const clipboard = box(root, 0.51, 0.62, 0.06, gold, 0.48, 1.83, 0.63, 0.035);
        clipboard.rotation.z = -0.15;
        box(clipboard, 0.43, 0.5, 0.018, cream, 0, -0.02, 0.041, 0.01);
        box(clipboard, 0.18, 0.07, 0.025, steel, 0, 0.25, 0.053, 0.01);
      }
      const person = { root, head, eyes, arms, professor, bob, seed: characters.length * 1.73 };
      characters.push(person);
      return person;
    }

    const fiona = character({ skinColor: 0xdb9a78, jacket: navy, bob: true });
    fiona.root.position.set(-0.34, 0, -0.48);
    fiona.root.rotation.y = 0.1;
    lab.add(fiona.root);
    const teammate = character({ skinColor: 0xbd8061, jacket: material(0xa54f4c) });
    teammate.root.position.set(1.69, 0, -0.94);
    teammate.root.rotation.y = -0.24;
    teammate.root.scale.setScalar(0.95);
    lab.add(teammate.root);
    const professor = character({ skinColor: 0xbc8669, jacket: charcoal, hairColor: material(0x89949c), professor: true });
    professor.root.position.set(1.42, 0, -0.42);
    professor.root.rotation.y = -0.07;
    lab.add(professor.root);

    let index = 0, paused = false, active = false, frame = 0, lastTime = 0, elapsed = 0, traceTime = -1;
    let width = 1, height = 1, firstFrame = false;
    const cameraPosition = new THREE.Vector3();
    const cameraTarget = new THREE.Vector3();
    const frameTarget = new THREE.Vector3();
    const desiredPosition = new THREE.Vector3();
    const desiredTarget = new THREE.Vector3();
    const descriptions = [
      'CTU Danao engineering building before a Computer Lab 2 class.',
      'Fiona and a classmate work on a circuit activity at a colorful 3D laboratory bench.',
      'Fiona sees the Circuit Secrets Protocol error as the lab computers shut down.',
      'Engr. Danlag briefs Fiona after the project files and components go missing.'
    ];

    function compose() {
      const portrait = width / height < 1;
      if (index === 0) {
        desiredPosition.set(portrait ? 5.9 : 10.6, portrait ? 6.5 : 7.4, portrait ? 21.9 : 16.4);
        desiredTarget.set(-0.1, 2.55, -0.6);
      } else if (index === 3) {
        desiredPosition.set(portrait ? 0.35 : 1.0, 3.02, portrait ? 8.55 : 7.9);
        desiredTarget.set(0.13, 2.06, 0.1);
      } else {
        desiredPosition.set(portrait ? 1.45 : 2.6, 3.24, portrait ? 9.7 : 8.9);
        desiredTarget.set(index === 2 ? 0.2 : 0.25, index === 2 ? 1.89 : 2.07, 0.12);
      }
      cameraPosition.copy(desiredPosition);
      cameraTarget.copy(desiredTarget);
      camera.aspect = width / height;
      if (height > 500 && width > height) camera.setViewOffset(width, height, 0, height * 0.105, width, height);
      else camera.clearViewOffset();
      camera.updateProjectionMatrix();
    }

    function drawTrace(time) {
      const ctx = traceContext, w = 512, h = 320;
      const alert = index === 2;
      const restarted = index === 3;
      ctx.fillStyle = alert ? '#170f1c' : restarted ? '#091322' : '#092938';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#204251'; ctx.lineWidth = 1;
      for (let x = 0; x <= w; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y <= h; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      ctx.fillStyle = alert ? '#ffb06b' : restarted ? '#a8cbef' : '#80f4c2';
      ctx.font = 'bold 23px monospace';
      ctx.fillText(alert ? 'SYSTEM ERROR' : restarted ? 'PROJECT FILES MISSING' : 'CIRCUIT PRACTICAL', 24, 38);
      ctx.strokeStyle = alert ? '#f7a965' : restarted ? '#7ebade' : '#65fbc3';
      ctx.lineWidth = 4; ctx.beginPath();
      for (let x = 16; x < w - 16; x += 2) {
        const wave = alert || restarted ? Math.sin(x * 0.033) * 2 : Math.sin(x * 0.046 - time * 2.1) * 38 + Math.sin(x * 0.012 - time) * 18;
        const y = 164 + wave;
        if (x === 16) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.font = '18px monospace';
      ctx.fillStyle = '#aacfe0';
      ctx.fillText(alert ? 'PROTOCOL ACTIVE / POWER DOWN' : restarted ? 'CHECK BACKUP / LOCAL SNAPSHOT' : 'CH 1   5.00 V   24.1 mA', 24, 289);
      traceMap.needsUpdate = true;
      drawWallDisplay(time);
    }

    function drawWallDisplay(time) {
      const ctx = wallContext, outage = index === 2, restarted = index === 3;
      ctx.fillStyle = outage ? '#211320' : restarted ? '#102538' : '#0b3444';
      ctx.fillRect(0, 0, 768, 240);
      ctx.strokeStyle = outage ? '#502d3c' : '#1d6474';
      ctx.lineWidth = 1;
      for (let x = 0; x <= 768; x += 32) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 240); ctx.stroke();
      }
      for (let y = 0; y <= 240; y += 32) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(768, y); ctx.stroke();
      }
      ctx.font = 'bold 20px monospace';
      ctx.fillStyle = outage ? '#ffb59d' : '#bdfff0';
      ctx.fillText(outage ? 'SYSTEM ERROR: PROJECT FILES CORRUPTED' : restarted ? 'PROJECT DIRECTORY  /  EMPTY' : 'CTU DANAO  /  CIRCUIT PRACTICAL', 28, 47);
      if (outage || restarted) {
        ctx.fillStyle = outage ? '#ffd8ba' : '#b7e8f4';
        ctx.font = 'bold 21px monospace';
        ctx.fillText(outage ? 'UNAUTHORIZED ACCESS DETECTED' : 'PROJECT FILES MISSING', 29, 107);
        ctx.fillStyle = outage ? '#ff9a91' : '#8fe6c7';
        ctx.fillText(outage ? 'CIRCUIT SECRETS PROTOCOL ACTIVATED' : 'COMPONENT INVENTORY INCOMPLETE', 29, 165);
        wallMap.needsUpdate = true;
        return;
      }
      ctx.font = '14px monospace';
      ctx.fillStyle = '#8ee5e3';
      ctx.fillText('CH 01  -  5.0 V  -  SIGNAL ROUTE', 29, 211);
      const activeColor = '#7ee7c2';
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = 5;
      ctx.beginPath();
      const route = [[68, 122], [175, 122], [175, 100], [310, 100], [310, 148], [460, 148], [460, 90], [645, 90]];
      route.forEach(([x, y], routeIndex) => routeIndex ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
      ctx.stroke();
      for (let routeIndex = 0; routeIndex < route.length; routeIndex++) {
        const [x, y] = route[routeIndex];
        ctx.fillStyle = routeIndex === 4 ? '#ffd26c' : activeColor;
        ctx.fillRect(x - 9, y - 9, 18, 18);
        ctx.fillStyle = '#123443';
        ctx.fillRect(x - 4, y - 4, 8, 8);
      }
      const cursor = 72 + (time * 94) % 564;
      ctx.fillStyle = '#f7e48f';
      ctx.fillRect(cursor, 114, 12, 12);
      wallMap.needsUpdate = true;
    }

    function animatePeople(time) {
      for (const person of characters) {
        if (!person.root.visible) continue;
        const t = time + person.seed;
        person.head.rotation.y = Math.sin(t * 0.7) * (person.bob ? 0.13 : 0.09);
        person.head.rotation.z = Math.sin(t * 0.53) * 0.035;
        person.head.position.y = 2.86 + Math.sin(t * 1.2) * 0.018;
        const blinkTime = (t + 0.7) % 4.6;
        const blink = blinkTime < 0.16 ? Math.max(0.08, Math.abs(blinkTime - 0.08) / 0.08) : 1;
        for (const eye of person.eyes) eye.scale.y = blink;
        if (person === fiona) {
          const reach = Math.max(0, Math.sin(t * 0.72));
          person.head.rotation.y += 0.08;
          person.arms[0].rotation.x = -0.22 - reach * 0.34;
          person.arms[0].rotation.z = -0.06 - reach * 0.1;
          person.arms[1].rotation.x = -0.08 + Math.sin(t * 1.4) * 0.12;
        } else if (person === teammate) {
          person.head.rotation.x = 0.09 + Math.sin(t * 0.9) * 0.05;
          person.arms[0].rotation.x = -0.1 + Math.sin(t * 3.2) * 0.11;
          person.arms[1].rotation.x = -0.12 + Math.sin(t * 2.9 + 1.3) * 0.1;
        } else {
          person.head.rotation.x = Math.sin(t * 0.7) * 0.035;
          person.arms[0].rotation.z = -0.1 + Math.sin(t * 0.85) * 0.25;
          person.arms[0].rotation.x = -0.22 + Math.sin(t * 0.7) * 0.1;
          person.arms[1].rotation.x = -0.16 + Math.sin(t * 0.7) * 0.05;
        }
      }
    }

    function render() {
      const time = motionQuery.matches ? 1.6 : elapsed;
      animatePeople(time);
      if (index === 0) {
        const opened = THREE.MathUtils.smoothstep(time, 1.4, 4.0);
        for (const { door, baseX, sign } of campusDoors) door.position.x = baseX + sign * opened * 0.33;
      }
      boardIndicators.forEach((light, lightIndex) => { light.visible = index === 1 && (Math.floor(time * 3 + lightIndex) % 4 !== 0); });
      emergencyLight.intensity = index === 2 ? 5.5 + Math.sin(time * 3.8) * 3.5 : 0;
      if (index === 2) emergencyRail.material.emissiveIntensity = 0.65 + Math.sin(time * 3.8) * 0.3;
      camera.position.copy(cameraPosition);
      if (!motionQuery.matches) {
        const move = 1 - Math.exp(-time * 0.21);
        camera.position.x += Math.sin(time * 0.29) * (index === 0 ? 0.3 : 0.16);
        camera.position.z -= move * (index === 0 ? 1.45 : index === 3 ? 0.72 : 0.94);
      }
      frameTarget.copy(cameraTarget);
      if (!motionQuery.matches) frameTarget.y += Math.sin(time * 0.35) * 0.045;
      camera.lookAt(frameTarget);
      key.intensity = index === 2 ? 1.4 : 3.2;
      rim.intensity = index === 2 ? 1.7 : 2.8;
      benchLight.intensity = index === 2 ? 2.2 : 10;
      if (index === 2 && !motionQuery.matches && elapsed < 1.1) {
        const dip = Math.sin(elapsed * 13) > 0.55 ? 0.62 : 1;
        key.intensity *= dip;
      }
      if (Math.abs(time - traceTime) > 0.08 || traceTime < 0) { drawTrace(time); traceTime = time; }
      renderer.render(scene, camera);
      if (!firstFrame) {
        firstFrame = true;
        screen.classList.add('has-game-scene');
      }
    }

    function tick(now) {
      frame = 0;
      if (!active || paused || document.hidden) { lastTime = 0; return; }
      if (lastTime) elapsed += Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      render();
      if (!motionQuery.matches) frame = requestAnimationFrame(tick);
    }
    function wake() {
      if (active && !paused && !document.hidden && !frame) frame = requestAnimationFrame(tick);
    }
    function setShot(nextIndex) {
      index = Math.max(0, Math.min(3, Number(nextIndex) || 0));
      elapsed = 0; lastTime = 0; traceTime = -1; active = true; paused = false;
      campus.visible = index === 0;
      lab.visible = index !== 0;
      fiona.root.visible = index >= 1;
      teammate.root.visible = index === 1 || index === 2;
      professor.root.visible = index === 3;
      activityBoard.visible = index === 1;
      warning.visible = index === 2;
      wallSignals.visible = index !== 2;
      emergencyRail.visible = index === 2;
      renderer.domElement.setAttribute('aria-label', descriptions[index]);
      compose(); render(); wake();
    }
    function setPaused(value) {
      paused = Boolean(value); lastTime = 0;
      if (paused) { cancelAnimationFrame(frame); frame = 0; }
      else wake();
    }
    function stop() {
      active = false; lastTime = 0;
      cancelAnimationFrame(frame); frame = 0;
    }
    function resize() {
      width = Math.max(1, host.clientWidth); height = Math.max(1, host.clientHeight);
      if (width < 2 || height < 2) return;
      renderer.setSize(width, height, false);
      compose();
      if (active) render();
    }

    window.CircuitIntroScene = { setShot, setPaused, stop };
    document.addEventListener('circuit-intro-shot', event => setShot(event.detail.index));
    document.addEventListener('circuit-intro-playback', event => setPaused(event.detail.paused));
    document.addEventListener('circuit-intro-stop', stop);
    document.addEventListener('visibilitychange', () => {
      lastTime = 0;
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
      else wake();
    });
    motionQuery.addEventListener('change', () => {
      if (!active) return;
      if (motionQuery.matches) { cancelAnimationFrame(frame); frame = 0; render(); }
      else wake();
    });
    renderer.domElement.addEventListener('webglcontextlost', event => {
      event.preventDefault(); stop(); screen.classList.remove('has-game-scene');
      host.dataset.unavailable = 'true';
    });
    new ResizeObserver(resize).observe(host);
    resize();
    if (screen.classList.contains('active')) {
      setShot(screen.dataset.shot || 0);
      setPaused(screen.classList.contains('is-paused'));
    }
  }
}
