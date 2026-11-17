const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const elements={},calls=[],listeners={},stored={};
const draw=new Proxy({createLinearGradient(){return {addColorStop(){}}},drawImage(...a){calls.push(a)}},{get(o,k){return k in o?o[k]:()=>{}}});
const env={Image:class{complete=true;naturalWidth=1536;naturalHeight=1024},document:{getElementById:id=>elements[id]??={classList:{add(){},remove(){}},addEventListener(){},getContext(){return draw}},addEventListener(){}},window:{addEventListener(type,fn){listeners[type]=fn}},localStorage:{getItem(k){return stored[k]??null},setItem(k,v){stored[k]=String(v)}},requestAnimationFrame(){},Math,console,assert,calls,listeners,stored,elements};
vm.createContext(env);for(const name of ['game','visuals','adventure','sprites'])vm.runInContext(fs.readFileSync(`dist/${name}.js`,'utf8'),env);
vm.runInContext(`
// --- Original mechanics ---
begin();assert.equal(hearts,3);assert.equal(speed,430);
jump();update(.05);jump();const vy=hero.vy;jump();assert.equal(hero.vy,vy);assert.equal(hero.jumps,2);
for(let i=0;i<60;i++){obstacles=[];update(1/60);assert(hero.y>=95)}
begin();coins=[{x:hero.x+30,y:G-40,type:'special'}];obstacles=[{x:hero.x+10,w:50,h:70}];update(0);assert.equal(boost,5);assert.equal(hearts,3);assert.equal(state,'playing');
for(let i=0;i<310;i++)update(1/60);assert.equal(boost,0);assert(score>300);
begin();collect({x:0,y:0,type:'shield'});hurt({});assert.equal(hearts,3);assert.equal(shield,0);assert(invulnerable>0);
invulnerable=0;obstacles=[{x:hero.x,w:50,h:70},{x:hero.x,w:50,h:70}];update(0);assert.equal(hearts,2);
collect({x:0,y:0,type:'heart'});assert.equal(hearts,3);collect({x:0,y:0,type:'heart'});assert.equal(hearts,3);
collect({x:0,y:0,type:'magnet'});assert.equal(magnet,7);coins=[{x:hero.x+280,y:G-170,type:'star'}];const before=coins[0].x;update(.016);assert(coins[0].x<before-speed*.016);
begin();for(let i=0;i<20;i++)collect({x:0,y:0,type:'normal'});assert.equal(score,210);update(2.1);assert.equal(combo,0);
begin();collect({x:0,y:0,type:'star'});collect({x:0,y:0,type:'special'});assert.equal(score,400);assert.equal(boost,5);
begin();time=29.99;obstacles=[{x:hero.x,w:50,h:80}];update(.02);assert.equal(chapterIndex(),1);assert.equal(speed,490);assert.equal(hearts,3);assert.equal(score,500);
for(const [t,i] of [[0,0],[30,1],[60,2],[90,3]]){time=t;assert.equal(chapterIndex(),i);background();drawHero();spawnPattern(i);assert(obstacles.every(o=>o.h<=115));obstacles.forEach(drawObstacle);coins.forEach(drawCoin)}
begin();collect({x:0,y:0,type:'special'});const b=boost;effects.push({kind:'text',x:0,y:0,text:'t',color:'#000',size:10,life:.5,max:.5});toggle();update(1);assert.equal(boost,b);assert.equal(time,0);assert.equal(effects.at(-1).life,.5);toggle();
begin();time=119.99;update(.02);assert.equal(state,'over');assert.equal(score,2000);assert.equal(time,120);assert.equal(cleared,true);
assert.match($('progress').textContent,/STAGE 4\\/4 · 30\\/30초/,'final progress shows a full stage');
assert.equal(stored['chiikawa-run-score-v2'],'2000','best score persisted');
begin();hearts=1;hurt({});assert.equal(state,'over');assert.equal(cleared,false);
// Keyboard restart is locked briefly after game over so jump-mashing cannot skip the result panel.
const key={code:'Space',repeat:false,preventDefault(){}};listeners.keydown(key);assert.equal(state,'over');overAt=Date.now()-1000;listeners.keydown(key);assert.equal(state,'playing');
// Restart clears every temporary effect.
hurt({});shake=.3;flash=.2;magnet=3;shield=1;popup(0,0,'x','#000');begin();
assert.equal(hearts,3);assert.equal(score,0);assert.equal(magnet,0);assert.equal(shield,0);assert.equal(boost,0);assert.equal(invulnerable,0);
assert.equal(effects.length,0);assert.equal(shake,0);assert.equal(flash,0);assert.equal(hero.hitAt,-10);assert.equal(hero.jumpAt,-10);assert.equal(combo,0);

// --- Fair placement: pickups are never spawned inside a hazard ---
for(let stage=0;stage<4;stage++)for(let n=0;n<150;n++){begin();time=stage*30+1;coins=[];for(let i=0;i<5;i++)coins.push({x:W+50+i*48,y:G-40,type:'normal'});coins.push({x:W+40,y:G-65,type:'shield'},{x:W+60,y:G-110,type:'special'});spawnPattern(stage);
 assert(obstacles.length<=2&&obstacles.every(o=>o.h<=115));
 for(const o of obstacles)for(const c of coins)assert(!(c.x>o.x-26&&c.x<o.x+o.w+26&&c.y>G-o.h-30),'pickup inside obstacle');}
begin();obstacles=[{x:W+50,w:48,h:60}];itemTimer=0;update(1/60);const item=coins.find(c=>['heart','shield','magnet'].includes(c.type));assert(item&&item.y<=G-96,'item lifted above hazard');

// --- Worst-case patterns are clearable with a single well-timed jump, and leave a recovery gap ---
const SPACING=[1.7,1.65,1.55,1.55];
for(let stage=0;stage<4;stage++){let ok=false;
 for(let delay=-1;delay<70&&!ok;delay++){begin();time=stage*30+1;spawn=99;coinTimer=99;specialTimer=99;itemTimer=99;coins=[];
  const x0=hero.x+420,tall=stage>=2;obstacles=[makeObstacle(x0,tall?55:48,tall?115:60+stage*5,obstacleKinds[stage],tall)];if(stage>=1)obstacles.push(makeObstacle(x0+90,46,56,obstacleKinds[stage],false));
  for(let f=0;f<130;f++){if(f===delay)jump();update(1/60)}ok=hearts===3;if(delay<0)assert(!ok,'control: standing still must collide')}
 assert(ok,'stage '+(stage+1)+' worst pattern must be jumpable');
 assert(SPACING[stage]*stageSpeeds[stage]-136>0.75*stageSpeeds[stage],'recovery gap after pattern')}

// --- Hero motion: pose selection, takeoff/landing, foot alignment, fallback ---
const sw=1536/3,sh=1024/2;
function lastDraw(){const a=calls.at(-1);return {frame:a[1]/sw+(a[2]/sh)*3,dx:a[5],dy:a[6],dw:a[7],dh:a[8]}}
function footOffset(d){return d.dy+HERO_FRAMES[d.frame].foot*(d.dh/sh)}
function centreOffset(d){return d.dx+HERO_FRAMES[d.frame].cx*(d.dw/sw)}
begin();for(let i=0;i<4;i++)update(1/60);
const seen=new Set();for(let i=0;i<30;i++){update(1/60);drawHero();const d=lastDraw();seen.add(d.frame);assert(Math.abs(footOffset(d))<1e-9,'feet on ground');assert(Math.abs(centreOffset(d))<1e-9,'centred')}
assert.deepEqual([...seen].sort(),[0,1],'run alternates two frames');
jump();assert.equal(hero.jumpAt,time);drawHero();assert.equal(heroPose.frame,2);assert(heroPose.sy>1&&heroPose.sx<1,'takeoff stretch');
update(.2);jump();update(.1);drawHero();assert.equal(heroPose.frame,3);assert(heroPose.rot>0&&heroPose.rot<Math.PI*2,'double jump spins');
for(let i=0;i<120&&hero.y<G;i++)update(1/60);assert.equal(hero.y,G);assert(time-hero.landAt<.05,'landing recorded');assert(hero.landImpact>0);
drawHero();assert(heroPose.sx>1&&heroPose.sy<1,'landing squash');assert(effects.some(e=>e.kind==='dust'),'landing dust');
invulnerable=0;obstacles=[{x:hero.x,w:50,h:70}];update(1/60);assert.equal(hearts,2);drawHero();assert.equal(heroPose.frame,5);assert(heroPose.rot<0);assert(shake>0&&flash>0);
const d5=lastDraw();assert(Math.abs(footOffset(d5))<1e-9,'hurt pose feet aligned');
begin();collect({x:0,y:0,type:'special'});update(1/60);drawHero();assert.equal(heroPose.frame,4);
const n=calls.length;drawHero();assert.equal(calls.length-n,3,'fever draws two afterimages and the hero');
// Pause freezes motion: same pose before and after paused updates.
begin();for(let i=0;i<5;i++)update(1/60);drawHero();const p1=JSON.stringify(heroPose);toggle();update(.5);drawHero();assert.equal(JSON.stringify(heroPose),p1);toggle();
// Fallback: a missing or broken sheet uses the vector hero instead of drawImage.
heroSheet.naturalWidth=0;const m=calls.length;drawHero();assert.equal(calls.length,m);assert.equal(heroPose.image,false);heroSheet.naturalWidth=1536;
heroSheetFailed=true;drawHero();assert.equal(calls.length,m);heroSheetFailed=false;drawHero();assert.equal(calls.length,m+1);
// Effects render without errors and expire.
drawEffects();cameraShake();updateEffects(2);assert.equal(effects.length,0);
console.log('PASS: double jump, ceiling, immediate fever immunity, boost exit, shield, damage cooldown, healing cap, magnet, scoring, combos, stage transition, chapter rendering, pause timers, clear progress, best score, restart lock, restart reset, pickup placement, jumpable patterns, run cycle, takeoff/landing, spin, hurt pose, fever afterimages, foot alignment, image fallback');
`,env);
