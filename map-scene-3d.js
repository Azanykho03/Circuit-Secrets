import * as THREE from 'three';

const host = document.querySelector('#map-scene-3d');
const stage = document.querySelector('#map-stage');
const overlay = document.querySelector('#overlay-map');

if (host && stage && overlay) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  } catch {
    host.dataset.unavailable = 'true';
  }

  if (renderer) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x283b45);
    const camera = new THREE.OrthographicCamera(-50, 50, 100 / 3, -100 / 3, .1, 200);
    camera.up.set(0, 0, -1);
    camera.position.set(0, 76, 55);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.65;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    host.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight(0xc8e6e9, 0x425052, 2.7);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffd8a3, 3.6);
    sun.position.set(-26, 44, 28);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -65, right: 65, top: 55, bottom: -55, near: .5, far: 110 });
    sun.shadow.normalBias = .04;
    scene.add(sun);

    const colors = {
      ground: 0x3f554d, lawn: 0x4c725b, darkLawn: 0x355948,
      road: 0x62747a, path: 0xb0aa88, wall: 0x62757c,
      glass: 0x7cc7c3, roof: 0x2e5c6c, roofLight: 0x538393,
      orange: 0xd48a4f, yellow: 0xf1cd74, coral: 0xc66d5a,
      mint: 0x80d9a8, steel: 0xb3bab0, navy: 0x263e4c, dark: 0x24392f
    };
    const mats = Object.fromEntries(Object.entries(colors).map(([name, color]) => [name,
      new THREE.MeshStandardMaterial({ color, roughness: name === 'glass' || name === 'steel' ? .34 : .82,
        metalness: name === 'glass' || name === 'steel' ? .28 : .04 })
    ]));
    function box(parent, x, y, z, w, h, d, mat) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats[mat]);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    }
    function cylinder(parent, x, y, z, radius, h, mat, sides = 12) {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, h, sides), mats[mat]);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    }
    function sphere(parent, x, y, z, radius, mat) {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 10, 8), mats[mat]);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      parent.add(mesh);
      return mesh;
    }
    function line(parent, a, b, width, mat, y = .16) {
      const dx = b.x - a.x, dz = b.z - a.z;
      const mesh = box(parent, (a.x + b.x) / 2, y, (a.z + b.z) / 2,
        Math.hypot(dx, dz), .12, width, mat);
      mesh.rotation.y = -Math.atan2(dz, dx);
      mesh.castShadow = false;
      return mesh;
    }
    const terrain = new THREE.Group();
    scene.add(terrain);
    box(terrain, 0, -.68, 0, 105, 1.15, 72, 'ground');
    box(terrain, 0, -.09, 0, 96, .14, 60, 'lawn');
    for (let i = 0; i < 40; i++) {
      const x = Math.sin(i * 31.7) * 43;
      const z = Math.cos(i * 18.2) * 25;
      const patch = cylinder(terrain, x, -.005, z, 1.6 + i % 4, .025,
        i % 2 ? 'darkLawn' : 'ground', 8);
      patch.scale.z = .62;
      patch.castShadow = false;
    }

    const pins = [[23,21],[74,21],[23,48],[80,54],[23,76],[50,12],[50,31],[50,51],[50,73],[84,75]];
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -2.2);
    const mapPoints = pins.map(([x, y]) => {
      raycaster.setFromCamera(new THREE.Vector2(x / 50 - 1, 1 - y / 50), camera);
      const hit = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, hit);
      return hit;
    });
    const route = [0,5,1,6,2,7,3,8,4,9];
    for (let index = 1; index < route.length; index++) {
      const from = mapPoints[route[index - 1]], to = mapPoints[route[index]];
      line(terrain, from, to, 2.5, 'road', .035);
      line(terrain, from, to, .24, 'path', .12);
    }
    for (const [a, b] of [[0,2],[2,4],[5,6],[6,7],[7,8],[1,3],[3,9]]) {
      line(terrain, mapPoints[a], mapPoints[b], 1.2, 'road', .02);
    }

    function wallWindows(group, width, depth, y) {
      for (const side of [-1, 1]) {
        for (let i = 0; i < 3; i++) {
          const x = -width * .3 + i * width * .3;
          box(group, x, y, side * (depth / 2 + .03), width * .18, .43, .07, 'glass');
        }
      }
    }
    const buildings = [];
    function building(index, point) {
      const group = new THREE.Group();
      const shiftX = [4, -4, 4, -4, 4, -4, 4, -4, 4, -4][index];
      const shiftZ = index === 5 ? 4 : index % 2 ? -1.3 : 1.3;
      group.position.set(point.x + shiftX, 0, point.z + shiftZ);
      terrain.add(group);
      const width = index === 4 ? 10.4 : index === 9 ? 8.2 : 7.5;
      const depth = index === 4 ? 5.2 : index === 9 ? 7.6 : 6.0;
      const height = index === 1 ? 3.9 : index === 9 ? 2.6 : 2.8;
      const roofTone = ['roofLight','roof','navy','steel','roofLight','orange','roof','coral','navy','roofLight'][index];
      box(group, 0, .14, 0, width + 1.1, .28, depth + 1.1, 'path');
      if (index === 2 || index === 9) {
        cylinder(group, 0, height / 2, 0, width * .44, height, 'wall', index === 2 ? 12 : 16);
        cylinder(group, 0, height + .22, 0, width * .48, .4, roofTone, index === 2 ? 12 : 16);
      } else {
        box(group, 0, height / 2, 0, width, height, depth, 'wall');
        box(group, 0, height + .16, 0, width + .65, .32, depth + .65, roofTone);
        wallWindows(group, width, depth, 1.6);
        box(group, 0, .86, depth / 2 + .08, 1.1, 1.7, .16, 'navy');
        box(group, .35, .88, depth / 2 + .18, .08, .16, .08, 'yellow');
        box(group, 0, 1.92, depth / 2 + .72, 2.15, .18, 1.35, roofTone);
      }
      for (const side of [-1, 1]) box(group, side * width * .38, height + .38, 0, .18, .16, depth * .8, 'steel');
      box(group, 0, height + .36, 0, width * .42, .08, depth * .2, index % 3 ? 'navy' : 'glass');
      if (index === 0) {
        for (let i = 0; i < 4; i++) box(group, -2.4 + i * 1.6, height + .45, 0, .8, .16, 2, i % 2 ? 'orange' : 'glass');
      } else if (index === 1 || index === 8) {
        for (let i = 0; i < 4; i++) box(group, -2.5 + i * 1.6, height + .5, -.6, 1, .32, 1.5, 'navy');
      } else if (index === 2) {
        cylinder(group, 0, height + 1.1, 0, .9, 1.5, 'glass', 16);
        cylinder(group, 0, height + 1.88, 0, 1.25, .09, 'steel', 16);
      } else if (index === 3) {
        cylinder(group, 0, height + 1.15, 0, .22, 1.8, 'steel');
        sphere(group, 0, height + 2.1, 0, .4, 'orange');
      } else if (index === 4) {
        for (let i = 0; i < 3; i++) box(group, -3 + i * 3, height + .52, 0, 2, .35, 2.8, 'glass');
      } else if (index === 5) {
        for (let i = 0; i < 5; i++) box(group, -2.5 + i * 1.25, height + .48, 0, .8, .18, 2.2, 'dark');
      } else if (index === 6) {
        cylinder(group, -.8, height + .85, 0, .23, 1.2, 'orange');
        box(group, -.1, height + 1.4, 0, 1.5, .2, .23, 'steel');
      } else if (index === 7) {
        for (const x of [-2, 0, 2]) cylinder(group, x, height + .87, 0, .38, 1.1, 'steel');
      } else if (index === 9) {
        cylinder(group, 0, height + .8, 0, 2.4, .08, 'glass', 20);
      }
      const lightMat = new THREE.MeshStandardMaterial({ color: 0x7fb4bd, emissive: 0x263a40, emissiveIntensity: .6 });
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(.32, 12, 8), lightMat);
      lamp.position.set(width * .38, height + .68, depth * .32);
      group.add(lamp);
      buildings.push({ lamp, lightMat });
    }
    mapPoints.forEach((point, index) => building(index, point));

    function tree(x, z, scale = 1) {
      cylinder(terrain, x, .4 * scale, z, .12 * scale, .8 * scale, 'dark', 7);
      const crown = sphere(terrain, x, 1.25 * scale, z, .7 * scale,
        (Math.abs(Math.floor(x * 13 + z * 7)) % 3) ? 'darkLawn' : 'lawn');
      crown.scale.y = .75;
    }
    for (let i = 0; i < 78; i++) {
      const x = Math.sin(i * 78.21) * 46;
      const z = Math.cos(i * 19.4) * 28;
      if (mapPoints.every(point => Math.hypot(point.x - x, point.z - z) > 6)) tree(x, z, .7 + (i % 4) * .18);
    }
    for (let i = 0; i < 18; i++) {
      const x = -43 + i * 5;
      const z = i % 2 ? -29 : 29;
      cylinder(terrain, x, 1.2, z, .08, 2.3, 'steel', 7);
      sphere(terrain, x, 2.4, z, .22, 'yellow');
    }

    let width = 0, height = 0, ready = false, contextLost = false;
    function resize() {
      const nextWidth = host.clientWidth, nextHeight = host.clientHeight;
      if (!nextWidth || !nextHeight || (nextWidth === width && nextHeight === height)) return false;
      width = nextWidth; height = nextHeight;
      const halfWidth = 50;
      const halfHeight = halfWidth * height / width;
      camera.left = -halfWidth; camera.right = halfWidth;
      camera.top = halfHeight; camera.bottom = -halfHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      return true;
    }
    function updateStatus() {
      stage.querySelectorAll('.map-room').forEach((button, index) => {
        const entry = buildings[index];
        if (!entry) return;
        const color = button.classList.contains('is-current') ? 0xffd074 :
          button.classList.contains('is-complete') ? 0x84f0ad : 0x9fc1c7;
        entry.lightMat.color.setHex(color);
        entry.lightMat.emissive.setHex(color);
        entry.lightMat.emissiveIntensity = button.classList.contains('is-locked') ? .16 : .75;
      });
    }
    new ResizeObserver(resize).observe(host);
    let lastStatus = 0;
    function frame(now) {
      requestAnimationFrame(frame);
      if (contextLost || !overlay.classList.contains('active')) return;
      const sizeChanged = resize();
      if (!width || !height) return;
      if (now - lastStatus > 500 || sizeChanged || !ready) {
        updateStatus(); lastStatus = now;
        renderer.render(scene, camera);
      }
      if (!ready) { stage.classList.add('has-3d-map'); ready = true; }
    }
    requestAnimationFrame(frame);
    renderer.domElement.addEventListener('webglcontextlost', () => {
      contextLost = true;
      stage.classList.remove('has-3d-map');
    }, { once: true });
  }
}
