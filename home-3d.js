import * as THREE from 'three';

const host=document.querySelector('#home-3d');
if(host){
  const signalReady=()=>{
    if(window.HomeLab3DReady)return;
    window.HomeLab3DReady=true;
    window.dispatchEvent(new Event('home-lab-ready'));
  };
  const readout=document.querySelector('#desk-status-text');
  const temperatureReadout=document.querySelector('#desk-temp');
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reduceEffects=()=>reducedMotion||Boolean(window.CircuitVisualPrefs?.reducedEffects);
  let renderer;

  try{
    renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  }catch(error){
    host.classList.add('webgl-unavailable');
    if(readout) readout.textContent='SIGNAL LOST // 3D SCENE UNAVAILABLE';
    window.HomeLab3DFailed=true;
    window.dispatchEvent(new Event('home-lab-error'));
  }

  if(renderer){
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.7));
    renderer.setSize(host.clientWidth,host.clientHeight,false);
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.18;
    renderer.shadowMap.enabled=true;
    renderer.shadowMap.type=THREE.PCFShadowMap;
    renderer.domElement.tabIndex=-1;
    renderer.domElement.setAttribute('aria-hidden','true');
    host.appendChild(renderer.domElement);
    host.classList.add('has-webgl');

    const scene=new THREE.Scene();
    scene.background=new THREE.Color(0x08111a);
    scene.fog=new THREE.Fog(0x08111a,18,36);
    const camera=new THREE.PerspectiveCamera(58,host.clientWidth/host.clientHeight,.12,60);
    const startingPosition=new THREE.Vector3(0,1.7,8.35);
    let homeEntranceSeen=false;
    try{homeEntranceSeen=sessionStorage.getItem('circuit-secrets-home-intro-seen')==='1';}catch(error){}
    const cameraEntranceEnabled=!reduceEffects()&&!homeEntranceSeen;
    const cameraEntrancePosition=startingPosition.clone().add(new THREE.Vector3(0,.1,1.05));
    camera.position.copy(cameraEntranceEnabled?cameraEntrancePosition:startingPosition);
    let yaw=cameraEntranceEnabled?-.035:0;
    let pitch=cameraEntranceEnabled?-.035:-.055;
    let cameraEntrance=cameraEntranceEnabled?{from:camera.position.clone(),to:startingPosition.clone(),fromYaw:yaw,fromPitch:pitch,start:performance.now(),duration:1580}:null;
    camera.rotation.order='YXZ';
    camera.rotation.set(pitch,yaw,0,'YXZ');

    const hemi=new THREE.HemisphereLight(0xb8dfef,0x11151a,1.15);
    scene.add(hemi);
    const keyLight=new THREE.DirectionalLight(0xd8ebf2,2.1);
    keyLight.position.set(-4,8,5);
    keyLight.castShadow=true;
    keyLight.shadow.mapSize.set(1536,1536);
    keyLight.shadow.camera.left=-11;
    keyLight.shadow.camera.right=11;
    keyLight.shadow.camera.top=10;
    keyLight.shadow.camera.bottom=-10;
    keyLight.shadow.bias=-.00018;
    keyLight.shadow.normalBias=.025;
    scene.add(keyLight);
    const rimLight=new THREE.DirectionalLight(0x68d9f0,.42);
    rimLight.position.set(5.5,3.4,-3.8);
    scene.add(rimLight);
    const windowFill=new THREE.PointLight(0x66bfe5,42,16,1.8);
    windowFill.position.set(0,3.7,-5.8);
    scene.add(windowFill);
    const benchFill=new THREE.PointLight(0x168eb7,18,8,2);
    benchFill.position.set(0,2.9,1.4);
    scene.add(benchFill);
    const taskLight=new THREE.PointLight(0xffcf91,17,5,2);
    taskLight.position.set(-3.7,3.4,.3);
    scene.add(taskLight);
    const workbenchSweep=new THREE.PointLight(0x4bd8ec,3.2,5.2,2);
    workbenchSweep.position.set(-5.1,2.45,1.6);
    scene.add(workbenchSweep);

    let seed=404;
    const random=()=>{
      seed=(seed*1664525+1013904223)>>>0;
      return seed/4294967296;
    };
    function canvasTexture(draw,width=512,height=512,repeatX=1,repeatY=1){
      const canvas=document.createElement('canvas');
      canvas.width=width; canvas.height=height;
      const context=canvas.getContext('2d');
      draw(context,width,height);
      const texture=new THREE.CanvasTexture(canvas);
      texture.colorSpace=THREE.SRGBColorSpace;
      texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
      texture.repeat.set(repeatX,repeatY);
      texture.anisotropy=renderer.capabilities.getMaxAnisotropy();
      return texture;
    }
    const floorTexture=canvasTexture((ctx,w,h)=>{
      ctx.fillStyle='#313941'; ctx.fillRect(0,0,w,h);
      for(let y=0;y<h;y+=128){
        ctx.fillStyle='rgba(5,11,17,.24)'; ctx.fillRect(0,y,w,2);
        for(let x=0;x<w;x+=128){
          ctx.fillStyle=`rgba(193,213,221,${.012+random()*.026})`;
          ctx.fillRect(x+8+random()*80,y+8+random()*80,18+random()*65,1+random()*2);
        }
      }
      for(let i=0;i<2300;i++){
        const shade=125+Math.floor(random()*80);
        ctx.fillStyle=`rgba(${shade},${shade+5},${shade+8},${random()*.07})`;
        ctx.fillRect(random()*w,random()*h,1+random()*3,1+random()*3);
      }
    },768,768,7,8);
    const laminateTexture=canvasTexture((ctx,w,h)=>{
      ctx.fillStyle='#202b33'; ctx.fillRect(0,0,w,h);
      for(let y=0;y<h;y+=6){
        ctx.strokeStyle=`rgba(172,196,205,${.012+random()*.025})`;
        ctx.beginPath(); ctx.moveTo(0,y+random()*2); ctx.lineTo(w,y+random()*2); ctx.stroke();
      }
      for(let i=0;i<900;i++){
        ctx.fillStyle=`rgba(190,210,216,${random()*.06})`;
        ctx.fillRect(random()*w,random()*h,1+random()*4,1);
      }
    },512,512,4,2);
    const circuitTexture=canvasTexture((ctx,w,h)=>{
      ctx.fillStyle='#155742'; ctx.fillRect(0,0,w,h);
      ctx.strokeStyle='rgba(115,203,154,.45)'; ctx.lineWidth=3;
      for(let i=0;i<21;i++){
        const x=20+random()*(w-40), y=20+random()*(h-40), mid=x+(random()-.5)*130;
        ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(mid,y); ctx.lineTo(mid,y+(random()-.5)*90); ctx.lineTo(w*(random()>.5?.82:.18),y+(random()-.5)*120); ctx.stroke();
      }
      for(let i=0;i<80;i++){
        ctx.fillStyle=i%3?'#c68b48':'#c9d5d0';
        ctx.fillRect(18+random()*(w-36),18+random()*(h-36),4+random()*7,4+random()*7);
      }
    },512,384,1,1);

    function screenTexture(label,accent='#5ad8f5'){
      return canvasTexture((ctx,w,h)=>{
        const bg=ctx.createLinearGradient(0,0,0,h);
        bg.addColorStop(0,'#102b40'); bg.addColorStop(.58,'#0a1d2d'); bg.addColorStop(1,'#091723');
        ctx.fillStyle=bg; ctx.fillRect(0,0,w,h);
        ctx.fillStyle='#08131d'; ctx.fillRect(0,0,w,48);
        ctx.fillStyle=accent; ctx.fillRect(22,17,10,10);
        ctx.font='700 17px "Space Mono", monospace'; ctx.fillText(label.toUpperCase(),46,29);
        ctx.fillStyle='#57788a'; ctx.font='400 12px "Space Mono", monospace'; ctx.fillText('COMPLAB 2 / TRACE',w-255,29);
        ctx.strokeStyle='rgba(112,172,193,.15)'; ctx.lineWidth=1;
        for(let x=28;x<w;x+=45){ctx.beginPath();ctx.moveTo(x,68);ctx.lineTo(x,h-25);ctx.stroke();}
        for(let y=78;y<h-20;y+=36){ctx.beginPath();ctx.moveTo(20,y);ctx.lineTo(w-22,y);ctx.stroke();}
        ctx.strokeStyle=accent; ctx.lineWidth=3; ctx.beginPath();
        for(let x=26;x<w-22;x+=3){
          const value=Math.sin(x*.035+label.length)*30+Math.sin(x*.011)*50+Math.sin(x*.003)*24;
          const y=h*.56+value;
          if(x===26) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.shadowColor=accent; ctx.shadowBlur=12; ctx.stroke(); ctx.shadowBlur=0;
        ctx.fillStyle='#b6dbe4'; ctx.font='400 12px "Space Mono", monospace';
        ctx.fillText('VOLTAGE TRACE  /  CH-01',28,h-25);
        ctx.fillStyle='#47d9aa'; ctx.fillRect(w-102,h-34,70,9);
      },768,432,1,1);
    }
    const signalFragmentTexture=canvasTexture((ctx,w,h)=>ctx.clearRect(0,0,w,h),768,432,1,1);
    function paintSignalFragment(fragment){
      const canvas=signalFragmentTexture.image;
      const ctx=canvas.getContext('2d');
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle='rgba(3,11,18,.87)';ctx.fillRect(0,0,canvas.width,canvas.height);
      for(let band=0;band<13;band++){
        const y=22+random()*(canvas.height-44);
        ctx.fillStyle=band%3?'rgba(92,224,245,.34)':'rgba(248,194,104,.42)';
        ctx.fillRect(random()*canvas.width,y,canvas.width*(.16+random()*.8),2+random()*7);
      }
      ctx.save();
      ctx.font='700 27px "Space Mono", monospace';ctx.shadowColor='#80f3ff';ctx.shadowBlur=14;
      ctx.fillStyle='#c4f6fb';ctx.fillText(fragment,24,218);
      ctx.fillStyle='#ffcf78';ctx.font='700 17px "Space Mono", monospace';ctx.fillText('FRAME DAMAGED // 09:18',26,258);
      ctx.restore();
      ctx.globalCompositeOperation='destination-out';
      for(let cut=0;cut<8;cut++) ctx.fillRect(random()*canvas.width,random()*canvas.height,24+random()*180,3+random()*8);
      ctx.globalCompositeOperation='source-over';
      signalFragmentTexture.needsUpdate=true;
    }

    const mat=(color,roughness=.65,metalness=.08,extras={})=>new THREE.MeshStandardMaterial({color,roughness,metalness,...extras});
    const wallMat=mat(0x28323b,.87,.08);
    const wallInsetMat=mat(0x111b24,.76,.22);
    const frameMat=mat(0x34414b,.36,.72);
    const steelMat=mat(0x5d6870,.31,.74);
    const blackMetal=mat(0x171e25,.42,.68);
    const deskMat=mat(0x27323a,.42,.16,{map:laminateTexture});
    const cabinetMat=mat(0x37414a,.48,.52);
    const floorMat=mat(0xffffff,.88,.04,{map:floorTexture});
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(15,18),floorMat);
    floor.rotation.x=-Math.PI/2; floor.position.set(0,-.035,.2); floor.receiveShadow=true; scene.add(floor);

    function box(parent,size,position,material,options={}){
      const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),material);
      mesh.position.set(...position);
      mesh.castShadow=options.castShadow!==false;
      mesh.receiveShadow=options.receiveShadow!==false;
      if(options.name) mesh.name=options.name;
      parent.add(mesh);
      return mesh;
    }
    function cylinder(parent,rTop,rBottom,height,position,material,segments=24,options={}){
      const mesh=new THREE.Mesh(new THREE.CylinderGeometry(rTop,rBottom,height,segments),material);
      mesh.position.set(...position);
      mesh.castShadow=options.castShadow!==false;
      mesh.receiveShadow=options.receiveShadow!==false;
      parent.add(mesh);
      return mesh;
    }
    function sphere(parent,radius,position,material,scale=[1,1,1]){
      const mesh=new THREE.Mesh(new THREE.SphereGeometry(radius,20,14),material);
      mesh.position.set(...position); mesh.scale.set(...scale); mesh.castShadow=true; parent.add(mesh); return mesh;
    }
    function tube(parent,points,radius,material){
      const curve=new THREE.CatmullRomCurve3(points.map(point=>new THREE.Vector3(...point)));
      const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(24,points.length*8),radius,7,false),material);
      mesh.castShadow=true; mesh.receiveShadow=true; parent.add(mesh); return mesh;
    }

    const windowGlass=mat(0x5790a9,.22,.28,{transparent:true,opacity:.31,emissive:0x0a2637,emissiveIntensity:.22,side:THREE.DoubleSide});
    const skyMat=new THREE.MeshBasicMaterial({color:0x27485d});
    box(scene,[15,5.8,.2],[0,2.9,-7.6],wallMat,{castShadow:false});
    box(scene,[.2,5.8,16],[-7.5,2.9,.2],wallMat,{castShadow:false});
    box(scene,[.2,5.8,16],[7.5,2.9,.2],wallMat,{castShadow:false});
    box(scene,[9.7,1.35,.24],[0,.675,-7.43],wallInsetMat);
    box(scene,[9.7,.95,.24],[0,5.3,-7.43],wallInsetMat);
    box(scene,[2.65,3.0,.24],[-6.175,2.75,-7.43],wallInsetMat);
    box(scene,[2.65,3.0,.24],[6.175,2.75,-7.43],wallInsetMat);
    const sky=new THREE.Mesh(new THREE.PlaneGeometry(9.55,3.02),skyMat);
    sky.position.set(0,3,-7.51); scene.add(sky);
    for(let i=0;i<13;i++){
      const width=.42+random()*.48, height=.65+random()*2.2, x=-4.6+i*.75;
      const building=box(scene,[width,height,.08],[x,1.52+height/2,-7.43],mat(i%2?0x263a4b:0x30465a,.9,.04),{castShadow:false,receiveShadow:false});
      building.material.color.multiplyScalar(.7);
      for(let floorIndex=0;floorIndex<Math.floor(height/.34);floorIndex++){
        const window=box(scene,[.075,.08,.035],[x-width*.22,1.68+floorIndex*.34,-7.36],mat(0x70b4c3,.32,.1,{emissive:0x3d93a7,emissiveIntensity:.25}),{castShadow:false,receiveShadow:false});
        window.material.transparent=true;
      }
    }
    for(let x=-4.75;x<=4.751;x+=2.37) box(scene,[.07,3.1,.11],[x,3,-7.28],frameMat,{castShadow:false});
    box(scene,[9.6,.075,.11],[0,1.52,-7.28],frameMat,{castShadow:false});
    box(scene,[9.6,.075,.11],[0,3.03,-7.28],frameMat,{castShadow:false});
    box(scene,[9.6,.075,.11],[0,4.53,-7.28],frameMat,{castShadow:false});
    box(scene,[15,.18,.3],[0,.12,-7.32],blackMetal);
    box(scene,[15,.16,.3],[0,5.68,-7.32],blackMetal);
    for(let side of [-1,1]){
      box(scene,[.2,.18,16],[side*7.36,.12,.2],blackMetal);
      for(let z=-5.9;z<6;z+=2.2){
        box(scene,[.04,5.1,.035],[side*7.38,2.9,z],mat(0x46545d,.65,.38),{castShadow:false});
      }
    }

    function makeWallSign(){
      const texture=canvasTexture((ctx,w,h)=>{
        ctx.fillStyle='#0b1822';ctx.fillRect(0,0,w,h);
        ctx.strokeStyle='#32778c';ctx.lineWidth=5;ctx.strokeRect(8,8,w-16,h-16);
        ctx.fillStyle='#b9e7eb';ctx.font='700 22px "Space Mono", monospace';ctx.fillText('COMPLAB 2',28,57);
        ctx.fillStyle='#68cbe1';ctx.font='400 17px "Space Mono", monospace';ctx.fillText('CTU DANAO ENGINEERING',28,91);
        ctx.fillStyle='#52d9a4';ctx.fillRect(28,111,110,5);
      },380,145,1,1);
      const plate=new THREE.Mesh(new THREE.PlaneGeometry(2.25,.86),new THREE.MeshStandardMaterial({map:texture,emissive:0x133646,emissiveIntensity:.5,roughness:.6}));
      plate.position.set(0,5.05,-7.22); scene.add(plate);
    }
    makeWallSign();

    function makeNoticeTexture(title,lines,accent='#79c8c2'){
      return canvasTexture((ctx,w,h)=>{
        ctx.fillStyle='#10202a';ctx.fillRect(0,0,w,h);
        ctx.strokeStyle='#55747b';ctx.lineWidth=9;ctx.strokeRect(8,8,w-16,h-16);
        ctx.fillStyle=accent;ctx.fillRect(20,20,w-40,7);
        ctx.fillStyle='#d5e2de';ctx.font='700 21px "Space Mono", monospace';ctx.fillText(title,22,60);
        ctx.fillStyle='#9ab2b4';ctx.font='400 14px "Barlow Semi Condensed", sans-serif';
        lines.forEach((line,index)=>ctx.fillText(line,22,92+index*24));
        for(let i=0;i<4;i++){
          ctx.fillStyle='#929b93';ctx.beginPath();ctx.arc(i%2?w-20:20,i<2?20:h-20,4,0,Math.PI*2);ctx.fill();
        }
        ctx.fillStyle='#6c8a8b';ctx.fillRect(22,h-36,w-44,2);
      },320,380,1,1);
    }
    const noticeTexture=makeNoticeTexture('BENCH NOTE',['ESD strap before handling','Return leads to drawer 04','Log values before swapping parts']);
    const notice=new THREE.Mesh(new THREE.PlaneGeometry(1.25,1.55),new THREE.MeshStandardMaterial({map:noticeTexture,roughness:.9,metalness:.02}));
    notice.position.set(6.12,2.53,-7.455);scene.add(notice);

    function makeWorkbench(x,z,width,depth,height=.92,rotate=false){
      const parent=new THREE.Group(); parent.position.set(x,0,z); if(rotate) parent.rotation.y=Math.PI/2; scene.add(parent);
      box(parent,[width,.15,depth],[0,height,0],deskMat);
      box(parent,[width*.92,.12,depth*.88],[0,height-.115,0],blackMetal);
      for(const sx of [-1,1]) for(const sz of [-1,1]){
        box(parent,[.12,height-.12,.12],[sx*(width/2-.17),(height-.12)/2,sz*(depth/2-.17)],steelMat);
      }
      box(parent,[width-.24,.13,.1],[0,.52,-depth/2+.13],cabinetMat);
      box(parent,[width-.24,.13,.1],[0,.52,depth/2-.13],cabinetMat);
      for(let drawer=0;drawer<3;drawer++){
        const drawerWidth=(width-.55)/3, dx=-width/2+.28+drawerWidth/2+drawer*drawerWidth;
        box(parent,[drawerWidth-.035,.31,.08],[dx,.75,depth/2+.045],cabinetMat);
        box(parent,[.22,.025,.03],[dx,.77,depth/2+.093],steelMat,{castShadow:false});
      }
      return parent;
    }
    makeWorkbench(0,-5.3,11.6,1.6,.94);
    makeWorkbench(-6.35,-1.4,1.55,8,.93,true);
    makeWorkbench(6.35,-1.4,1.55,8,.93,true);
    const island=makeWorkbench(0,.65,7.1,2.45,.96);
    island.name='central test bench';
    const checkoutTexture=canvasTexture((ctx,w,h)=>{
      ctx.fillStyle='#18262c';ctx.fillRect(0,0,w,h);
      ctx.strokeStyle='#9ca69b';ctx.lineWidth=7;ctx.strokeRect(6,6,w-12,h-12);
      ctx.fillStyle='#d7d7c8';ctx.font='700 19px "Space Mono", monospace';ctx.fillText('METER CHECKOUT',18,32);
      ctx.fillStyle='#9daead';ctx.font='400 15px "Barlow Semi Condensed", sans-serif';ctx.fillText('RETURN AFTER PRACTICAL',18,55);
      ctx.fillStyle='#d4ad62';ctx.fillRect(18,h-10,w-36,3);
    },320,72,1,1);
    const checkoutLabel=new THREE.Mesh(new THREE.PlaneGeometry(.92,.21),new THREE.MeshStandardMaterial({map:checkoutTexture,roughness:.84,metalness:.08}));
    checkoutLabel.position.set(-2.15,.77,1.34);island.add(checkoutLabel);

    const taskFixtures=[];
    function makeTaskLight(x,z){
      const group=new THREE.Group(); group.position.set(x,0,z); scene.add(group);
      cylinder(group,.035,.045,.15,[0,1.08,0],blackMetal,14);
      tube(group,[[0,1.12,0],[0,1.42,0],[.08,1.66,.08],[.28,1.77,.16]],.035,steelMat);
      const shade=new THREE.Mesh(new THREE.ConeGeometry(.33,.24,28,1,true),steelMat);
      shade.position.set(.37,1.77,.16); shade.rotation.z=-Math.PI/2.8; group.add(shade);
      const bulbMaterial=new THREE.MeshStandardMaterial({color:0xffe0a7,emissive:0xffcb73,emissiveIntensity:0,roughness:.2});
      const bulb=new THREE.Mesh(new THREE.SphereGeometry(.095,14,10),bulbMaterial);
      bulb.position.set(.31,1.68,.16);group.add(bulb);
      const light=new THREE.PointLight(0xffd99c,0,4.5,2);light.position.set(.36,1.65,.18);group.add(light);
      taskFixtures.push({light,material:bulbMaterial});
      return group;
    }
    makeTaskLight(-3.8,-.4);
    makeTaskLight(4.6,-3.2);

    const screenMaterials=[];
    const screenSignals=[];
    let signalGlitch=null;
    const heroCoreParts=[];
    const idleEquipment=[];
    function addIdleEquipment(group,amplitude=.008){
      idleEquipment.push({group,baseY:group.position.y,baseRotationY:group.rotation.y,baseRotationZ:group.rotation.z,amplitude,phase:random()*Math.PI*2});
    }
    function addAnimatedSignal(parent,color,{centerY,width,z,amplitude,phase=random()*Math.PI*2,count=56}){
      const positions=new Float32Array(count*3);
      for(let i=0;i<count;i++){
        const t=i/(count-1);
        positions[i*3]=-width*.5+t*width;
        positions[i*3+1]=centerY+Math.sin(t*Math.PI*8.5+phase)*amplitude*.52;
        positions[i*3+2]=z;
      }
      const geometry=new THREE.BufferGeometry();
      const positionAttribute=new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage);
      geometry.setAttribute('position',positionAttribute);
      geometry.setDrawRange(0,count);
      const material=new THREE.LineBasicMaterial({color,transparent:true,opacity:.88,depthWrite:false,toneMapped:false});
      const line=new THREE.Line(geometry,material);
      line.frustumCulled=false;
      line.renderOrder=3;
      parent.add(line);
      screenSignals.push({geometry,positions,count,centerY,width,z,amplitude,phase});
    }
    function makePositionedGroup(position){
      const group=new THREE.Group();group.position.set(...position);scene.add(group);
      return group;
    }

    function makeMonitor(x,z,label,accent,storyMonitor=false){
      const group=makePositionedGroup([x,0,z]);
      box(group,[1.72,1.1,.14],[0,2.05,0],blackMetal);
      box(group,[1.61,.99,.035],[0,2.055,.088],frameMat,{castShadow:false});
      const texture=screenTexture(label,accent);
      const displayMaterial=new THREE.MeshStandardMaterial({map:texture,emissive:0x23748d,emissiveMap:texture,emissiveIntensity:.58,roughness:.28,metalness:.12});
      const display=new THREE.Mesh(new THREE.PlaneGeometry(1.45,.82),displayMaterial);
      display.position.set(0,2.05,.111);group.add(display);screenMaterials.push(displayMaterial);
      if(storyMonitor){
        const interferenceMaterial=new THREE.MeshBasicMaterial({map:signalFragmentTexture,transparent:true,opacity:0,depthWrite:false,toneMapped:false});
        const interference=new THREE.Mesh(new THREE.PlaneGeometry(1.45,.82),interferenceMaterial);
        interference.position.set(0,2.05,.114);interference.visible=false;group.add(interference);
        signalGlitch={mesh:interference,material:interferenceMaterial};
      }
      addAnimatedSignal(group,accent,{centerY:1.99,width:1.27,z:.116,amplitude:.052});
      box(group,[.18,.45,.19],[0,1.47,-.015],steelMat);
      box(group,[.74,.09,.4],[0,1.26,.08],blackMetal);
      box(group,[1.16,.07,.42],[0,1.06,.38],blackMetal);
      for(let key=0;key<13;key++){
        box(group,[.055,.012,.045],[-.49+(key%7)*.15,1.101,.25+Math.floor(key/7)*.12],mat(0x9baab0,.5,.15),{castShadow:false,receiveShadow:false});
      }
      addIdleEquipment(group,.008);
      return group;
    }
    makeMonitor(-3.45,-4.27,'COMPLAB 2 trace','#5ad8f5');
    makeMonitor(0,-4.25,'Recovered trace: 09:18','#70ecc3',true);
    makeMonitor(3.45,-4.27,'Project archive: missing','#91baff');

    function makeOscilloscope(x,z){
      const group=makePositionedGroup([x,0,z]);
      box(group,[1.03,.64,.82],[0,1.38,0],mat(0x66727a,.48,.42));
      box(group,[.61,.36,.035],[-.13,1.42,.43],mat(0x101d25,.28,.2));
      const graphMat=new THREE.MeshBasicMaterial({color:0x4de1d1});
      tube(group,[[-.4,1.42,.465],[-.32,1.44,.465],[-.26,1.56,.465],[-.18,1.31,.465],[-.09,1.47,.465],[.02,1.45,.465],[.11,1.34,.465],[.2,1.56,.465],[.37,1.43,.465]],.012,graphMat);
      addAnimatedSignal(group,0x70f4d1,{centerY:1.42,width:.54,z:.469,amplitude:.09,count:40});
      for(let dial=0;dial<4;dial++){
        cylinder(group,.07,.07,.04,[.34+(dial%2)*.2,1.5-Math.floor(dial/2)*.19,.445],steelMat,18);
        sphere(group,.016,[.34+(dial%2)*.2,1.5-Math.floor(dial/2)*.19,.475],mat(0x9ed3db,.3,.1));
      }
      addIdleEquipment(group,.004);
      return group;
    }
    makeOscilloscope(-5.7,-2.3);
    makeOscilloscope(5.7,-1.3);

    function makePrototype(){
      const group=makePositionedGroup([0,0,.45]);
      box(group,[2.35,.105,1.52],[0,1.1,0],new THREE.MeshStandardMaterial({color:0xffffff,map:circuitTexture,roughness:.48,metalness:.21}));
      const socketMat=mat(0x26343a,.3,.78,{emissive:0x0c5360,emissiveIntensity:.2});
      const socketEdgeMat=mat(0x6acbd2,.28,.68,{emissive:0x1b8290,emissiveIntensity:.25});
      box(group,[.9,.026,.78],[.1,1.16,-.02],socketMat,{castShadow:false});
      box(group,[.9,.012,.018],[.1,1.18,-.401],socketEdgeMat,{castShadow:false,receiveShadow:false});
      box(group,[.9,.012,.018],[.1,1.18,.361],socketEdgeMat,{castShadow:false,receiveShadow:false});
      const chip=mat(0x171d22,.3,.56,{emissive:0x0d6677,emissiveIntensity:.42});
      const heroCore=box(group,[.73,.2,.65],[.1,1.255,-.02],chip,{name:'mounted protocol chip'});
      heroCoreParts.push({mesh:heroCore,material:chip,baseRotationY:heroCore.rotation.y,phase:random()*Math.PI*2});
      box(group,[.43,.14,.36],[-.73,1.22,.33],mat(0x33404a,.24,.73));
      box(group,[.27,.16,.32],[.74,1.23,-.36],mat(0x202b34,.25,.63));
      for(let pin=0;pin<8;pin++){
        box(group,[.052,.03,.11],[-.21+pin*.088,1.22,-.34],steelMat,{castShadow:false});
        box(group,[.052,.03,.11],[-.21+pin*.088,1.22,.3],steelMat,{castShadow:false});
      }
      for(let i=0;i<5;i++){
        cylinder(group,.07,.07,.19,[-.88+i*.25,1.27,-.48],mat(0x8b9aa3,.28,.7),20);
      }
      const leds=[];
      for(let i=0;i<3;i++){
        const ledMaterial=new THREE.MeshStandardMaterial({color:0xffffff,emissive:i===1?0xffb34f:0x48f2c6,emissiveIntensity:.28,roughness:.26});
        leds.push(ledMaterial);
        sphere(group,.055,[-.88+i*.18,1.22,.55],ledMaterial,[1,.62,1]);
      }
      const heatsink=mat(0x87959b,.28,.82);
      for(let i=0;i<9;i++) box(group,[.07,.21,.44],[.25+i*.085,1.34,.02],heatsink,{castShadow:false});
      const gold=mat(0xb89058,.32,.78);
      for(const x of [-1,1]) for(const z of [-.62,.62]) cylinder(group,.048,.048,.04,[x*1.03,1.16,z],gold,16);
      tube(group,[[-3.25,1.005,.9],[-2.9,1.01,.9],[-2.55,1.05,.85],[-2.2,1.01,.83]],.027,mat(0xc44344,.34,.22));
      tube(group,[[3.2,1.005,.63],[2.8,1.01,.59],[2.46,1.04,.52],[2.16,1.01,.46]],.024,mat(0x17232d,.39,.24));
      group.userData.leds=leds;
      return group;
    }
    const prototype=makePrototype();

    function makeCabinet(x,z){
      const group=new THREE.Group();group.position.set(x,0,z);scene.add(group);
      box(group,[1.25,2.35,.72],[0,1.18,0],cabinetMat);
      for(let shelf=0;shelf<4;shelf++){
        const y=.4+shelf*.52;
        box(group,[1.05,.035,.08],[0,y,.38],steelMat,{castShadow:false});
        for(let item=0;item<3;item++){
          box(group,[.17,.18+random()*.17,.16],[-.35+item*.35,y+.12,.23],item%2?blackMetal:frameMat,{castShadow:false});
        }
      }
      for(let drawer=0;drawer<3;drawer++){
        box(group,[1.05,.29,.065],[0,1.95-drawer*.39,.374],mat(0x2b353d,.51,.46));
        box(group,[.17,.025,.024],[0,1.95-drawer*.39,.42],steelMat,{castShadow:false});
      }
    }
    makeCabinet(-6.5,-5.5);
    makeCabinet(6.5,-5.5);

    function makeToolStation(){
    const group=makePositionedGroup([-5.9,0,.1]);
      box(group,[.88,.44,.62],[0,1.27,0],mat(0x323d45,.38,.44));
      box(group,[.56,.28,.035],[0,1.31,.33],mat(0x0d1921,.24,.2));
      for(let i=0;i<4;i++) sphere(group,.025,[-.16+i*.1,1.36,.355],mat(0x4cd7b1,.3,.1,{emissive:0x38d8aa,emissiveIntensity:.3}));
      tube(group,[[.17,1.45,0],[.28,1.7,.1],[.43,1.89,.28],[.62,1.91,.34]],.025,steelMat);
      cylinder(group,.09,.07,.23,[.49,1.89,.32],blackMetal,18);
      return group;
    }
    makeToolStation();

    function makeChair(x,z){
      const group=new THREE.Group();group.position.set(x,0,z);scene.add(group);
      const seat=mat(0x1b2834,.54,.22);
      box(group,[.9,.15,.82],[0,.92,0],seat);
      box(group,[.84,.98,.13],[0,1.43,-.38],seat);
      cylinder(group,.07,.07,.75,[0,.46,0],blackMetal,18);
      for(let i=0;i<5;i++){
        const angle=i*Math.PI*2/5;
        tube(group,[[0,.19,0],[Math.cos(angle)*.43,.08,Math.sin(angle)*.43]],.038,blackMetal);
        cylinder(group,.07,.07,.035,[Math.cos(angle)*.46,.055,Math.sin(angle)*.46],mat(0x89959b,.42,.38),14);
      }
      for(const xSide of [-.35,.35]) tube(group,[[xSide,.92,.12],[xSide,1.13,.12],[xSide,1.31,-.19]],.032,steelMat);
    }
    makeChair(3.2,3.75);
    makeChair(-4.55,2.4);

    function makeCable(points,color=0xd3454c,radius=.025){
      tube(scene,points,radius,mat(color,.38,.3));
    }
    makeCable([[-3.1,1.04,1.1],[-2.6,1.07,1.45],[-1.8,1.05,1.32],[-1.2,1.02,.92],[-.5,1.04,.95]],0xd34b4c,.024);
    makeCable([[3.35,1.04,1.25],[2.9,1.08,1.6],[2.3,1.05,1.45],[1.85,1.02,1.0],[1.25,1.02,.8]],0x1c2730,.028);
    makeCable([[-2.8,1.05,-4.65],[-2.5,1.09,-4.1],[-1.85,1.05,-3.9],[-1.5,1.05,-4.4]],0xd2a047,.018);

    const ceilingFixtures=[];
    for(let i=0;i<6;i++){
      const x=-5+i*2;
      box(scene,[.16,.12,13.5],[x,5.56,0],blackMetal,{castShadow:false});
      const lamp=box(scene,[.72,.07,.48],[x,5.46,.4],new THREE.MeshStandardMaterial({color:0xf4f2de,emissive:0xc0eaff,emissiveIntensity:0,roughness:.2}),{castShadow:false});
      lamp.material.toneMapped=false;
      const light=new THREE.PointLight(0xc9edff,0,7,2);light.position.set(x,5.05,.2);scene.add(light);
      ceilingFixtures.push({light,material:lamp.material});
    }
    for(let z=-5.8;z<=5.5;z+=2.8){
      box(scene,[.12,.13,.12],[0,5.33,z],frameMat,{castShadow:false});
    }
    for(let x=-6.4;x<=6.41;x+=.55) box(scene,[.025,.12,.15],[x,.34,-6.98],steelMat,{castShadow:false});

    const ambientScreen=new THREE.MeshBasicMaterial({color:0x68d6ef,transparent:true,opacity:.055,side:THREE.DoubleSide});
    const reflection=new THREE.Mesh(new THREE.PlaneGeometry(8.8,2.8),ambientScreen);
    reflection.position.set(0,3.1,-7.08);scene.add(reflection);

    const particleCount=74;
    const dustPositions=new Float32Array(particleCount*3);
    const dustMotion=[];
    for(let i=0;i<particleCount;i++){
      dustPositions[i*3]=(random()-.5)*12;
      dustPositions[i*3+1]=1.1+random()*4.1;
      dustPositions[i*3+2]=(random()-.5)*12;
      dustMotion.push({phase:random()*Math.PI*2,speed:.045+random()*.045,drift:.003+random()*.007});
    }
    const dustGeometry=new THREE.BufferGeometry();
    dustGeometry.setAttribute('position',new THREE.BufferAttribute(dustPositions,3));
    const dust=new THREE.Points(dustGeometry,new THREE.PointsMaterial({color:0xb6e4ef,size:.022,transparent:true,opacity:.38,depthWrite:false,sizeAttenuation:true}));
    scene.add(dust);

    const powered=true;
    const powerLevel=1;
    let active=false;
    let raf=0;
    let lastFrame=0;
    const homeSceneStart=performance.now();
    const ambientDelay=cameraEntranceEnabled?2.38:0;
    let nextAmbientFlicker=ambientDelay+5+Math.random()*4;
    let ambientFlickerStart=-1;
    let nextSignalGlitch=ambientDelay+7+Math.random()*5;
    let signalGlitchStart=-1;
    let signalGlitchDuration=0;
    const signalFragments=['FI...ONA // TRACE ENDS HERE','PROJECT ROUTE // [DAMAGED]','CIRCUIT SECRETS // FRAGMENT 03'];
    function applyPowerLighting(level,elapsed=0){
      const mix=(off,on)=>THREE.MathUtils.lerp(off,on,level);
      hemi.intensity=mix(.48,1.9);
      keyLight.intensity=mix(1.1,2.9);
      windowFill.intensity=mix(19,62);
      benchFill.intensity=mix(4,38)+(reduceEffects()?0:Math.sin(elapsed*1.1)*level*.8);
      taskLight.intensity=mix(2,27);
      renderer.toneMappingExposure=mix(1.05,1.48);
      for(const fixture of ceilingFixtures){
        fixture.light.intensity=mix(0,28);
        fixture.material.emissiveIntensity=mix(.015,2.1);
      }
      for(const fixture of taskFixtures){
        fixture.light.intensity=mix(0,24);
        fixture.material.emissiveIntensity=mix(.015,1.5);
      }
      screenMaterials.forEach(material=>material.emissiveIntensity=mix(.58,1.14));
      ambientScreen.opacity=mix(.035,.11);
      dust.material.opacity=mix(.24,.58);
      if(prototype.userData.leds){
        prototype.userData.leds.forEach((material,index)=>{
          material.emissiveIntensity=mix(.2,.9)+(reduceEffects()?0:Math.sin(elapsed*(powered?2.6:1.7)+index)*mix(.04,.22));
        });
      }
    }
    function updateCamera(){
      camera.rotation.set(pitch,yaw,0,'YXZ');
    }
    function finishCameraEntrance(){
      if(cameraEntrance){
        cameraEntrance=null;
        camera.position.copy(startingPosition);
        yaw=0;pitch=-.055;updateCamera();
      }
    }

    function render(now){
      raf=0;
      if(!active||document.hidden) return;
      const dt=Math.min(.05,(now-lastFrame)/1000||0);
      lastFrame=now;
      const elapsed=(now-homeSceneStart)/1000;
      camera.rotation.set(pitch,yaw,0,'YXZ');
      const ambientTime=Math.max(0,elapsed-ambientDelay);
      applyPowerLighting(powerLevel,elapsed);
      if(cameraEntrance){
        const progress=THREE.MathUtils.clamp((now-cameraEntrance.start)/cameraEntrance.duration,0,1);
        const eased=1-Math.pow(1-progress,3);
        camera.position.lerpVectors(cameraEntrance.from,cameraEntrance.to,eased);
        yaw=cameraEntrance.fromYaw*(1-eased);
        pitch=THREE.MathUtils.lerp(cameraEntrance.fromPitch,-.055,eased);
        updateCamera();
        if(progress>=1) cameraEntrance=null;
      }
      if(!reduceEffects()){
        workbenchSweep.position.x=Math.sin(ambientTime*.22)*5.1;
        workbenchSweep.position.y=2.45+Math.sin(ambientTime*.34)*.12;
        workbenchSweep.position.z=1.6+Math.cos(ambientTime*.18)*.35;
        workbenchSweep.intensity=4.2+Math.sin(ambientTime*.9)*.45;
        const points=dustGeometry.attributes.position.array;
        for(let i=0;i<particleCount;i++){
          const motion=dustMotion[i];
          points[i*3+1]+=motion.speed*dt;
          points[i*3]+=Math.sin(elapsed*.18+motion.phase)*motion.drift*dt;
          points[i*3+2]+=Math.cos(elapsed*.15+motion.phase)*motion.drift*dt;
          if(points[i*3+1]>5.4){points[i*3+1]=1.1;points[i*3]=(random()-.5)*12;points[i*3+2]=(random()-.5)*12;}
        }
        dustGeometry.attributes.position.needsUpdate=true;
        dust.rotation.y=Math.sin(elapsed*.08)*.018;
        for(const idle of idleEquipment){
          const drift=ambientTime*.48+idle.phase;
          idle.group.position.y=idle.baseY+Math.sin(drift)*idle.amplitude;
          idle.group.rotation.y=idle.baseRotationY+Math.sin(drift*.72+1.1)*.004;
          idle.group.rotation.z=idle.baseRotationZ+Math.sin(drift*.53+2.2)*.002;
        }
        for(const signal of screenSignals){
          const pulsePosition=(ambientTime*.12+signal.phase/(Math.PI*2))%1;
          for(let i=0;i<signal.count;i++){
            const t=i/(signal.count-1);
            const phase=t*Math.PI*8.5+ambientTime*1.8+signal.phase;
            const pulse=Math.exp(-Math.pow((t-pulsePosition)/.075,2));
            signal.positions[i*3]=-signal.width*.5+t*signal.width;
            signal.positions[i*3+1]=signal.centerY+Math.sin(phase)*signal.amplitude*.52+Math.sin(phase*.43-ambientTime*1.15)*signal.amplitude*.3+pulse*signal.amplitude*.55;
            signal.positions[i*3+2]=signal.z;
          }
          signal.geometry.attributes.position.needsUpdate=true;
        }
        for(const core of heroCoreParts){
          const pulse=.5+.5*Math.sin(ambientTime*.62+core.phase);
          core.mesh.rotation.y=core.baseRotationY+Math.sin(ambientTime*.28+core.phase)*.035;
          core.material.emissiveIntensity=(.34+pulse*.2)*(powered?1.12:.82);
        }
        if(elapsed>=nextAmbientFlicker){
          ambientFlickerStart=elapsed;
          nextAmbientFlicker=elapsed+6+Math.random()*8;
        }
        if(signalGlitch&&elapsed>=nextSignalGlitch){
          paintSignalFragment(signalFragments[Math.floor(Math.random()*signalFragments.length)]);
          signalGlitchStart=elapsed;
          signalGlitchDuration=.82+Math.random()*.34;
          signalGlitch.mesh.visible=true;
          nextSignalGlitch=elapsed+12+Math.random()*14;
        }
        if(signalGlitch&&signalGlitchStart>=0){
          const progress=(elapsed-signalGlitchStart)/signalGlitchDuration;
          if(progress>=1){
            signalGlitch.mesh.visible=false;
            signalGlitch.material.opacity=0;
            signalGlitchStart=-1;
          }else{
            const flicker=progress<.14?.78:progress<.28?.2:progress<.64?.7:progress<.78?.16:.55*(1-progress)/.22;
            signalGlitch.material.opacity=Math.max(0,flicker);
          }
        }
        if(ambientFlickerStart>=0){
          const flickerTime=elapsed-ambientFlickerStart;
          const strength = flickerTime < .075 ? .54 : flickerTime < .13 ? 1 : flickerTime < .18 ? .72 : flickerTime < .34 ? THREE.MathUtils.lerp(.72,1,(flickerTime-.18)/.16) : 1;
          if(flickerTime<.34){
            windowFill.intensity*=strength;
            if(screenMaterials[1]) screenMaterials[1].emissiveIntensity*=strength;
          }else ambientFlickerStart=-1;
        }
      }
      if(temperatureReadout) temperatureReadout.textContent=powered?'41.6 C':'34.8 C';
      renderer.render(scene,camera);
      signalReady();
      if(!reduceEffects()) raf=requestAnimationFrame(render);
    }
    function draw(){
      if(!active||document.hidden) return;
      if(!raf) raf=requestAnimationFrame(render);
    }
    function syncActive(){
      active=host.closest('.screen')?.classList.contains('active')&&!document.hidden;
      if(active) draw();
      else if(raf){cancelAnimationFrame(raf);raf=0;}
    }
    const screenObserver=new MutationObserver(syncActive);
    screenObserver.observe(document.querySelector('#screen-title'),{attributes:true,attributeFilter:['class']});
    document.addEventListener('visibilitychange',syncActive);
    const resizeObserver=new ResizeObserver(()=>{
      const width=Math.max(1,host.clientWidth),height=Math.max(1,host.clientHeight);
      camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height,false);
      if(reduceEffects()) renderer.render(scene,camera);
    });
    resizeObserver.observe(host);
    updateCamera();
    applyPowerLighting(powerLevel);
    const syncVisualEffects=()=>{
      const reduced=reduceEffects();
      dust.visible=!reduced;
      renderer.shadowMap.enabled=!reduced;
      keyLight.castShadow=!reduced;
      if(reduced){
        finishCameraEntrance();
        if(raf){cancelAnimationFrame(raf);raf=0;}
        if(active)draw();
      }else if(active)draw();
    };
    document.addEventListener('circuit-visual-settings-change',syncVisualEffects);
    syncVisualEffects();
    syncActive();

    window.HomeLab3D={
      skipEntrance(){finishCameraEntrance();draw();},
      setActive(value){active=Boolean(value)&&!document.hidden;if(active)draw();else if(raf){cancelAnimationFrame(raf);raf=0;}}
    };
  }
}
