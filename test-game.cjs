const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const elements={},calls=[];
const draw=new Proxy({createLinearGradient(){return {addColorStop(){}}},drawImage(...a){calls.push(a)}},{get(o,k){return k in o?o[k]:()=>{}}});
const env={Image:class{complete=true;naturalWidth=1536;naturalHeight=1024},document:{getElementById:id=>elements[id]??={classList:{add(){},remove(){}},addEventListener(){},getContext(){return draw}},addEventListener(){}},window:{addEventListener(){}},localStorage:{getItem(){return null},setItem(){}},requestAnimationFrame(){},Math,console,assert};
vm.createContext(env);for(const name of ['game','visuals','adventure','sprites'])vm.runInContext(fs.readFileSync(`dist/${name}.js`,'utf8'),env);
vm.runInContext(`
begin();assert.equal(hearts,3);assert.equal(speed,430);
jump();update(.05);jump();const vy=hero.vy;jump();assert.equal(hero.vy,vy);assert.equal(hero.jumps,2);
for(let i=0;i<60;i++){obstacles=[];update(1/60);assert(hero.y>=95)}
begin();coins=[{x:hero.x+30,y:G-40,type:'special'}];obstacles=[{x:hero.x+10,w:50,h:70}];update(0);assert.equal(boost,5);assert.equal(hearts,3);assert.equal(state,'playing');
for(let i=0;i<310;i++)update(1/60);assert.equal(boost,0);assert(score>300);
begin();collect({x:0,y:0,type:'shield'});hurt({});assert.equal(hearts,3);assert.equal(shield,0);assert(invulnerable>0);
invulnerable=0;obstacles=[{x:hero.x,w:50,h:70},{x:hero.x,w:50,h:70}];update(0);assert.equal(hearts,2);
collect({x:0,y:0,type:'heart'});assert.equal(hearts,3);collect({x:0,y:0,type:'heart'});assert.equal(hearts,3);
collect({x:0,y:0,type:'magnet'});coins=[{x:hero.x+280,y:G-170,type:'star'}];const before=coins[0].x;update(.016);assert(coins[0].x<before-speed*.016);
begin();for(let i=0;i<20;i++)collect({x:0,y:0,type:'normal'});assert.equal(score,210);update(2.1);assert.equal(combo,0);
begin();time=29.99;obstacles=[{x:hero.x,w:50,h:80}];update(.02);assert.equal(chapterIndex(),1);assert.equal(speed,490);assert.equal(hearts,3);assert.equal(score,500);
for(const [t,i] of [[0,0],[30,1],[60,2],[90,3]]){time=t;assert.equal(chapterIndex(),i);background();drawHero();spawnPattern(i);assert(obstacles.every(o=>o.h<=115))}
begin();collect({x:0,y:0,type:'special'});const b=boost;toggle();update(1);assert.equal(boost,b);assert.equal(time,0);toggle();
begin();time=119.99;update(.02);assert.equal(state,'over');assert.equal(score,2000);assert.equal(time,120);
begin();hearts=1;hurt({});assert.equal(state,'over');begin();assert.equal(hearts,3);assert.equal(score,0);assert.equal(magnet,0);assert.equal(shield,0);assert.equal(boost,0);
console.log('PASS: double jump, ceiling, immediate fever immunity, boost exit, shield, damage cooldown, healing cap, magnet, combos, stage transition, chapter rendering, pause timers, clear, death, restart');
`,env);
