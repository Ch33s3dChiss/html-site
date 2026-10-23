import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const loading=document.querySelector('#loading'), objective=document.querySelector('#objective'), message=document.querySelector('#message'), staminaBar=document.querySelector('#stamina'), hint=document.querySelector('#hint'), overlay=document.querySelector('#overlay');
const scene=new THREE.Scene(); scene.background=new THREE.Color(0x070b0a); scene.fog=new THREE.FogExp2(0x080d0b,0.045);
const camera=new THREE.PerspectiveCamera(72,innerWidth/innerHeight,.1,80); camera.position.set(0,1.65,7);
const renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'low-power'}); renderer.setSize(Math.max(1,Math.floor(innerWidth*.72)),Math.max(1,Math.floor(innerHeight*.72)),false); renderer.domElement.style.width='100%';renderer.domElement.style.height='100%';renderer.domElement.style.position='absolute';renderer.domElement.style.inset='0';renderer.domElement.style.filter='contrast(1.15) saturate(.65)';document.body.prepend(renderer.domElement);
renderer.setPixelRatio(1); renderer.shadowMap.enabled=false;
scene.add(new THREE.HemisphereLight(0x87958b,0x171a16,1.15));
const lamp=new THREE.PointLight(0xb6c8a7,18,10,2); camera.add(lamp);scene.add(camera);
const mat=(c,rough=1)=>new THREE.MeshStandardMaterial({color:c,roughness:rough,flatShading:true});
const wallMat=mat(0x303b35), floorMat=mat(0x1b2420), trimMat=mat(0x596258), darkMat=mat(0x101714), redMat=new THREE.MeshBasicMaterial({color:0x9d3028});
function box(x,y,z,sx,sy,sz,m){let o=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),m);o.position.set(x,y,z);scene.add(o);return o}
box(0,-.18,-13,12,.35,42,floorMat);box(0,3,-13,12,.3,42,darkMat);
for(let z=7;z>-34;z-=4){box(-5.8,1.4,z, .4,3.2,4,wallMat);box(5.8,1.4,z,.4,3.2,4,wallMat);box(-5.55,2.9,z,.12,.12,3.7,trimMat);box(5.55,2.9,z,.12,.12,3.7,trimMat);if(z%8===7){box(-2.7,2.83,z,.8,.08,.12,redMat);box(2.8,2.83,z,.7,.08,.12,trimMat)}}
for(let z=4;z>-31;z-=6){box(-3.4,1,z-2,.65,2,1.2,mat(0x252d29));box(3.3,.65,z-1,1.1,1.3,.8,mat(0x28312b));box(-4.4,.4,z-4,.5,.8,.5,trimMat)}
// door and exit
const exitDoor=box(0,1.35,-32,2.2,2.7,.22,mat(0x45564a));box(0,2.75,-32,.9,.08,.08,redMat);
// 2D billboard sprite via canvas texture
function spriteTexture(draw){const c=document.createElement('canvas');c.width=64;c.height=96;const g=c.getContext('2d');draw(g);const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;return t}
const enemyTex=spriteTexture(g=>{g.clearRect(0,0,64,96);g.fillStyle='#020403';g.fillRect(19,18,27,58);g.fillRect(13,35,10,33);g.fillRect(42,35,10,33);g.fillRect(20,70,8,22);g.fillRect(36,70,8,22);g.fillStyle='#c9d7ad';g.fillRect(23,29,6,3);g.fillRect(37,29,6,3);g.fillStyle='#87967b';g.fillRect(26,8,12,16);g.fillRect(22,15,20,8);});
const enemyMat=new THREE.SpriteMaterial({map:enemyTex,transparent:true,depthWrite:false});const enemy=new THREE.Sprite(enemyMat);enemy.scale.set(1.35,2.1,1);enemy.position.set(2,1,-16);scene.add(enemy);
const fuseTex=spriteTexture(g=>{g.fillStyle='#d3d8b7';g.fillRect(25,25,14,48);g.fillStyle='#a4b89a';g.fillRect(20,21,24,10);g.fillRect(20,68,24,8);g.fillStyle='#e5edbd';g.fillRect(28,33,8,27)});
const fuseMat=new THREE.SpriteMaterial({map:fuseTex,transparent:true});const fuses=[];for(const p of [[-2,0,-7],[3,0,-19],[-3,0,-27]]){const s=new THREE.Sprite(fuseMat);s.position.set(p[0],.8,p[2]);s.scale.set(.55,.8,1);scene.add(s);fuses.push({sprite:s,got:false})}
const player={x:0,z:6,y:0,vy:0,yaw:0,stamina:100,jumps:0,items:0,dead:false,won:false};camera.position.set(player.x,1.65,player.z);
const keys={};addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(e.key===' '){e.preventDefault();jump()}if(e.key.toLowerCase()==='e')use()});addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
let stick={x:0,y:0}, running=false, lookTouch=null;
const zone=document.querySelector('#stickZone'), base=document.querySelector('#stickBase'), knob=document.querySelector('#stickKnob');
function stickMove(e){const r=base.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=e.clientX-cx,dy=e.clientY-cy,l=Math.hypot(dx,dy),max=42;if(l>max){dx=dx/l*max;dy=dy/l*max}stick.x=dx/max;stick.y=dy/max;knob.style.transform=`translate(${dx}px,${dy}px)`}
zone.addEventListener('pointerdown',e=>{zone.setPointerCapture(e.pointerId);stickMove(e)});zone.addEventListener('pointermove',e=>{if(e.buttons)stickMove(e)});zone.addEventListener('pointerup',()=>{stick={x:0,y:0};knob.style.transform='translate(0,0)'});zone.addEventListener('pointercancel',()=>{stick={x:0,y:0};knob.style.transform='translate(0,0)'});
document.querySelector('#runBtn').addEventListener('pointerdown',e=>{e.preventDefault();running=true});['pointerup','pointercancel','pointerleave'].forEach(n=>document.querySelector('#runBtn').addEventListener(n,()=>running=false));
document.querySelector('#jumpBtn').addEventListener('pointerdown',e=>{e.preventDefault();jump()});document.querySelector('#useBtn').addEventListener('pointerdown',e=>{e.preventDefault();use()});
document.querySelector('#lookZone').addEventListener('pointerdown',e=>{lookTouch={id:e.pointerId,x:e.clientX,y:e.clientY};e.currentTarget.setPointerCapture(e.pointerId)});document.querySelector('#lookZone').addEventListener('pointermove',e=>{if(lookTouch&&lookTouch.id===e.pointerId){player.yaw-=(e.clientX-lookTouch.x)*.006;lookTouch.x=e.clientX;lookTouch.y=e.clientY}});document.querySelector('#lookZone').addEventListener('pointerup',()=>lookTouch=null);document.querySelector('#lookZone').addEventListener('pointercancel',()=>lookTouch=null);
function jump(){if(player.jumps<2&&!player.dead&&!player.won){player.vy=player.jumps===0?6.4:5.7;player.jumps++}}
function use(){if(player.dead||player.won)return;let nearest=null,dist=2.1;for(const f of fuses){if(!f.got){let d=Math.hypot(player.x-f.sprite.position.x,player.z-f.sprite.position.z);if(d<dist){nearest=f;dist=d}}}if(nearest){nearest.got=true;nearest.sprite.visible=false;player.items++;objective.textContent=`ПРЕДМЕТЫ: ${player.items}/3`;message.textContent=player.items===3?'Все предохранители найдены. Доберись до лифта!':'Предохранитель найден. Ты услышал шаги...';}else if(player.items===3&&Math.hypot(player.x,player.z+32)<2.7){finish(true)}}
function finish(win){player.won=win;overlay.classList.remove('hidden');document.querySelector('#endTitle').textContent=win?'ТЫ ВЫБРАЛСЯ':'СМЕНА ОКОНЧЕНА';document.querySelector('#endText').textContent=win?'Лифт ожил. Но что-то успело войти вместе с тобой.':'Существо настигло тебя в темноте.'}
document.querySelector('#restart').onclick=()=>location.reload();
function collide(x,z){return x<-4.9||x>4.9||z>8||z<-34}
let last=performance.now(),elapsed=0;
function tick(now){requestAnimationFrame(tick);const dt=Math.min(.04,(now-last)/1000);last=now;if(player.dead||player.won){renderer.render(scene,camera);return}elapsed+=dt;
let forward=-(keys.w||keys.arrowup?1:0)+(keys.s||keys.arrowdown?1:0);let side=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0);forward+=-stick.y;side+=stick.x;const len=Math.hypot(forward,side);if(len>1){forward/=len;side/=len}
const sprint=(running||keys.shift)&&player.stamina>1&&Math.abs(forward)+Math.abs(side)>.1;const speed=sprint?5.4:2.65;if(sprint)player.stamina=Math.max(0,player.stamina-29*dt);else player.stamina=Math.min(100,player.stamina+17*dt);staminaBar.style.width=player.stamina+'%';
const fx=-Math.sin(player.yaw),fz=-Math.cos(player.yaw),rx=Math.cos(player.yaw),rz=-Math.sin(player.yaw);const nx=player.x+(fx*forward+rx*side)*speed*dt,nz=player.z+(fz*forward+rz*side)*speed*dt;if(!collide(nx,player.z))player.x=nx;if(!collide(player.x,nz))player.z=nz;
player.y+=player.vy*dt;player.vy-=15*dt;if(player.y<=0){player.y=0;player.vy=0;player.jumps=0}
camera.position.set(player.x,1.65+player.y,player.z);camera.rotation.set(0,player.yaw,0);
enemy.lookAt(camera.position.x,enemy.position.y,camera.position.z);const ex=player.x-enemy.position.x,ez=player.z-enemy.position.z,ed=Math.hypot(ex,ez);if(ed<11){const sp=ed<3?1.8:1.25;enemy.position.x+=ex/(ed||1)*sp*dt;enemy.position.z+=ez/(ed||1)*sp*dt;enemy.position.y=1.05+Math.sin(elapsed*5)*.08}else{enemy.position.x=2+Math.sin(elapsed*.4)*1.2;enemy.position.z=-16+Math.cos(elapsed*.35)*1.5}
if(ed<.85){finish(false)}
for(const f of fuses)if(!f.got){f.sprite.material.rotation=0;f.sprite.position.y=.8+Math.sin(elapsed*2+f.sprite.position.z)*.12}
hint.textContent='';let close=fuses.some(f=>!f.got&&Math.hypot(player.x-f.sprite.position.x,player.z-f.sprite.position.z)<2.1);if(close)hint.textContent='НАЖМИ «ВЗЯТЬ» / E';else if(player.items===3&&Math.hypot(player.x,player.z+32)<3)hint.textContent='НАЖМИ «ВЗЯТЬ» / E — ЛИФТ';
message.textContent=ed<8?'НЕ ОБОРАЧИВАЙСЯ. ОНО РЯДОМ.':(player.items===3?'Лифт находится в конце коридора.':'Найди 3 предохранителя. Избегай существа.');
// PS1 post-process look: reduced internal resolution, nearest upscaling and slight noise overlay
renderer.render(scene,camera);
}
document.querySelector('#restart').textContent='ПОВТОРИТЬ';requestAnimationFrame(tick);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(Math.max(1,Math.floor(innerWidth*.72)),Math.max(1,Math.floor(innerHeight*.72)),false)});
setTimeout(()=>loading.remove(),900);
