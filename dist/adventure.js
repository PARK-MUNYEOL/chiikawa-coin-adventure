// A four-stage, two-minute adventure. All clocks advance only during play.
let hearts=3,shield=0,magnet=0,invulnerable=0,itemTimer=4,combo=0,comboClock=0,stageNotice=0,cleared=false;
// Presentation-only state: cleared on restart, advanced only inside update(), so pause freezes it.
let effects=[],shake=0,flash=0;
const stageSpeeds=[430,490,550,610];
// Shared hero bounds. Collision and pickups use these numbers; sprites.js anchors the feet at hero.y
// and the body centre (rotation pivot) at hero.y-mid, horizontally at hero.x+cx.
const HERO_BOX={left:4,right:53,foot:8,cx:29,mid:40,reachL:-12,reachR:72,reachY:43};
const originalBegin=begin,baseJump=jump;
function resetHeroMotion(){Object.assign(hero,{spinAt:-10,jumpAt:-10,landAt:-10,hitAt:-10,feverAt:-10,landImpact:0})}
begin=function(){originalBegin();hearts=3;shield=0;magnet=0;invulnerable=0;itemTimer=4;combo=0;comboClock=0;stageNotice=0;cleared=false;effects=[];shake=0;flash=0;resetHeroMotion();speed=stageSpeeds[0];hud()};
jump=function(){const before=hero.jumps,grounded=hero.y>=G-1;baseJump();if(hero.jumps>before){hero.jumpAt=time;if(grounded)dust(hero.x+HERO_BOX.cx,G,4)}};
hud=function(){const stage=chapterIndex(),into=Math.max(0,Math.min(30,Math.floor(time-stage*30))),status=[];
 if(boost>0)status.push('🌈 '+boost.toFixed(1)+'초');if(shield)status.push('🛡 보호막');if(magnet>0)status.push('🧲 '+Math.ceil(magnet)+'초');if(!status.length)status.push(hero.jumps+'/2 점프');
 $('score').textContent=score.toLocaleString();$('power').textContent=`${'♥'.repeat(hearts)}${'♡'.repeat(3-hearts)}  · ${status.join(' · ')}${combo>=5?' · '+combo+' 콤보':''}`;$('progress').textContent=`STAGE ${stage+1}/4 · ${into}/30초`;};
function result(clear){state='over';cleared=clear;overAt=Date.now();if(score>best){best=score;$('best').textContent=best.toLocaleString();try{localStorage.setItem('chiikawa-run-score-v2',best)}catch{}}panel(clear?'별빛 축제 도착! ✨':'잠깐 쉬고 다시 모험해요',`${clear?'네 개의 스테이지를 모두 돌파했어요!':'도달한 스테이지 '+(chapterIndex()+1)+'/4'}<br>이번 점수 <b>${score.toLocaleString()}점</b> · 최고 ${best.toLocaleString()}점`,'처음부터 다시 →')}
end=function(){result(false)};

// ---- Feedback effects (floating text, rings, dust) ----
function addEffect(e){effects.push(e);if(effects.length>140)effects.splice(0,effects.length-140)}
function popup(x,y,text,color,size=17){addEffect({kind:'text',x,y,text,color,size,life:.85,max:.85})}
function ring(x,y,color,r=34){addEffect({kind:'ring',x,y,color,r,life:.32,max:.32})}
function dust(x,y,n=4){for(let i=0;i<n;i++)addEffect({kind:'dust',x:x+(Math.random()-.5)*30,y:y-2,vx:-60-Math.random()*90,vy:-20-Math.random()*40,r:4+Math.random()*3,life:.4,max:.4})}
function updateEffects(dt){shake=Math.max(0,shake-dt);flash=Math.max(0,flash-dt);for(const e of effects){e.life-=dt;if(e.kind==='text')e.y-=46*dt;else if(e.kind==='dust'){e.x+=e.vx*dt;e.y+=e.vy*dt;e.vy+=120*dt}}effects=effects.filter(e=>e.life>0)}
function cameraShake(){if(shake<=0||state!=='playing')return;const m=Math.min(1,shake/.35);ctx.translate(W/2+Math.sin(time*97)*5*m,H/2+Math.cos(time*83)*2.5*m);ctx.scale(1.012,1.012);ctx.translate(-W/2,-H/2)}
function drawEffects(){ctx.save();for(const e of effects){const t=e.life/e.max;ctx.globalAlpha=Math.min(1,t*1.6);
  if(e.kind==='ring'){ctx.strokeStyle=e.color;ctx.lineWidth=4*t+1;ctx.beginPath();ctx.arc(e.x,e.y,e.r*(1.15-t*.75),0,Math.PI*2);ctx.stroke()}
  else if(e.kind==='dust'){const g=1.4-t*.4;ellipse(e.x,e.y,e.r*g,e.r*.75*g,'#fff6ecc0')}
  else{ctx.textAlign='center';ctx.font=`900 ${e.size}px "Noto Sans KR",sans-serif`;ctx.lineWidth=4;ctx.strokeStyle='#ffffffd0';ctx.strokeText(e.text,e.x,e.y);ctx.fillStyle=e.color;ctx.fillText(e.text,e.x,e.y)}}
 ctx.restore();if(flash>0&&state==='playing'){ctx.save();ctx.globalAlpha=flash*1.1;ctx.fillStyle='#ff9fb8';ctx.fillRect(0,0,W,H);ctx.restore()}}

collect=function(c){if(c.taken)return;c.taken=true;const x=c.x,y=c.y;
 if(c.type==='shield'){shield=1;burst(x,y,'#a3dfff',14);ring(x,y,'#8fd0f5',44);popup(x,y-30,'보호막!','#4d88b3');return}
 if(c.type==='magnet'){magnet=7;burst(x,y,'#ffb3c8',14);ring(x,y,'#f39ab8',44);popup(x,y-30,'자석 7초!','#c25d84');return}
 if(c.type==='heart'){const healed=hearts<3;hearts=Math.min(3,hearts+1);burst(x,y,'#ff9fbf',14);ring(x,y,'#ff9fbf',44);popup(x,y-30,healed?'체력 +1':'체력 가득!','#d0577f');return}
 combo++;comboClock=2;const mult=Math.min(3,1+Math.floor(combo/20)),points=(c.type==='special'?300:c.type==='star'?100:10)*mult;score+=points;
 const color=c.type==='special'?'#b99cff':c.type==='star'?'#ffc04d':'#ffdd83';burst(x,y,color,c.type==='normal'?6:14);ring(x,y,color,c.type==='normal'?22:c.type==='star'?34:52);
 // During fever, plain coins only flash a ring so the screen stays readable.
 if(boost<=0||c.type!=='normal')popup(x,y-22,'+'+points,c.type==='normal'?'#c58b1c':c.type==='star'?'#d77d12':'#8d63d6',c.type==='normal'?15:c.type==='star'?19:22);
 if(combo%20===0&&combo<=40)popup(hero.x+HERO_BOX.cx,hero.y-118,`${combo} 콤보! ×${mult}`,'#e0679a',21);
 if(c.type==='special'){boost=5;boostCoins=0;hero.vy=0;hero.jumps=0;hero.feverAt=time;obstacles=[];for(const other of coins)if(other!==c&&other.x<hero.x+50)other.taken=true;popup(hero.x+HERO_BOX.cx,hero.y-120,'무지개 피버!','#8d63d6',24)}hud()};

// ---- Collision helpers (same numbers as before, now shared) ----
function obstacleHits(o){return hero.x+HERO_BOX.right>o.x+5&&hero.x+HERO_BOX.left<o.x+o.w-5&&hero.y-HERO_BOX.foot>G-o.h+7}
function pickupHits(c){return c.x>hero.x+HERO_BOX.reachL&&c.x<hero.x+HERO_BOX.reachR&&Math.abs(c.y-(hero.y-HERO_BOX.mid))<HERO_BOX.reachY}
// Pickups must never sit inside a hazard: lift them just above any obstacle they overlap.
function liftPickup(c){for(const o of obstacles)if(c.x>o.x-26&&c.x<o.x+o.w+26&&c.y>G-o.h-30)c.y=G-o.h-36;return c}

const obstacleKinds=['mushroom','cake','cloud','lantern'];
function makeObstacle(x,w,h,type,tall){return {x,w,h,type,tall,variant:Math.floor(Math.random()*3),phase:Math.random()*Math.PI*2}}
function spawnPattern(stage){const x=W+70,type=obstacleKinds[stage],tall=stage>=2&&Math.random()<.35;obstacles.push(makeObstacle(x,tall?55:48,tall?115:60+stage*5,type,tall));
 // Pairs are close enough to clear in one jump, with a guaranteed recovery gap.
 if(stage>=1&&Math.random()<.45)obstacles.push(makeObstacle(x+90,46,56,type,false));
 const height=tall?G-185:G-115;for(let i=0;i<7;i++)coins.push({x:x-75+i*50,y:height-Math.sin(i/6*Math.PI)*38,type:i===3?'star':'normal'});
 for(const c of coins)liftPickup(c);
 spawn=stage===0?1.7:stage===1?1.65:1.55;
}
function hurt(o){o.passed=true;
 if(shield){shield=0;invulnerable=1.2;burst(hero.x+25,hero.y-40,'#a3dfff',18);ring(hero.x+HERO_BOX.cx,hero.y-HERO_BOX.mid,'#a3dfff',60);popup(hero.x+HERO_BOX.cx,hero.y-110,'보호막 방어!','#4d88b3');shake=.15;return}
 hearts--;combo=0;comboClock=0;invulnerable=1.8;hero.hitAt=time;burst(hero.x+25,hero.y-40,'#ef9cb6',18);shake=.35;flash=.25;popup(hero.x+HERO_BOX.cx,hero.y-110,'아야!','#d0577f',20);if(hearts<=0)end()}
function land(v){hero.landAt=time;hero.landImpact=Math.min(1,Math.max(0,v)/1400);dust(hero.x+HERO_BOX.cx,G,2+Math.round(hero.landImpact*4))}
update=function(dt){if(state!=='playing')return;const oldStage=chapterIndex();time=Math.min(120,time+dt);const stage=chapterIndex();magnet=Math.max(0,magnet-dt);invulnerable=Math.max(0,invulnerable-dt);comboClock-=dt;if(comboClock<=0)combo=0;updateEffects(dt);
 if(stage!==oldStage){obstacles=[];spawn=1.8;score+=500;stageNotice=3;coins.push({x:W-50,y:G-65,type:'heart'});popup(W/2,200,`STAGE ${stage+1} 도착! +500`,'#8d63d6',22)}stageNotice=Math.max(0,stageNotice-dt);
 if(time>=120){score+=2000;result(true);hud();return}
 const flying=boost>0;boost=Math.max(0,boost-dt);speed=flying?1000:stageSpeeds[stage];scroll+=speed*dt;
 if(flying){hero.y+=(177+Math.sin(time*9)*8-hero.y)*Math.min(1,dt*12);hero.vy=0;hero.jumps=0;boostCoins-=dt;if(boostCoins<=0){boostCoins=.075;coins.push({x:W+30,y:145+Math.sin(time*8)*27,type:Math.random()<.22?'star':'normal'})}if(boost===0){obstacles=[];spawn=1.8;coinTimer=.2;specialTimer=9;invulnerable=Math.max(invulnerable,1.2)}}
 else{const wasAir=hero.y<G;hero.vy+=2050*dt;hero.y+=hero.vy*dt;if(hero.y<95){hero.y=95;hero.vy=Math.max(0,hero.vy)}if(hero.y>=G){if(wasAir)land(hero.vy);hero.y=G;hero.vy=0;hero.jumps=0}
  spawn-=dt;if(spawn<=0)spawnPattern(stage);
  coinTimer-=dt;if(coinTimer<=0){for(let i=0;i<5;i++)coins.push(liftPickup({x:W+50+i*48,y:G-40,type:'normal'}));coinTimer=2.6}
  specialTimer-=dt;if(specialTimer<=0){coins.push(liftPickup({x:W+60,y:G-110,type:'special'}));specialTimer=15}
  itemTimer-=dt;if(itemTimer<=0){const types=hearts<3?['heart','shield','magnet']:['shield','magnet'];coins.push(liftPickup({x:W+40,y:G-65,type:types[Math.floor(Math.random()*types.length)]}));itemTimer=7}}
 // Use current boost status: a rainbow picked up this frame protects immediately.
 for(const c of coins){c.x-=speed*dt;const dx=c.x-(hero.x+28),dy=c.y-(hero.y-40);if((boost>0||magnet>0)&&dx>-70&&dx<340&&Math.abs(dy)<(boost>0?400:260)){const pull=Math.min(1,dt*13);c.x-=dx*pull;c.y-=dy*pull}if(!c.taken&&pickupHits(c))collect(c)}coins=coins.filter(c=>!c.taken&&c.x>-50);
 for(const o of obstacles){o.x-=speed*dt;if(!o.passed&&boost<=0&&invulnerable<=0&&obstacleHits(o)){hurt(o);if(state==='over')break}}obstacles=obstacles.filter(o=>o.x>-130);for(const s of sparks){s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt}sparks=sparks.filter(s=>s.life>0);hud()};

// ---- Coins and items: spin, bob and pulse are draw-only; pickup bounds stay at c.x/c.y ----
function coinSeed(c){if(c.seed===undefined)c.seed=Math.random()*Math.PI*2;return c.seed}
const RAINBOW=['#ffacc9','#ffd899','#fff3a4','#b5e7b7','#9dd9f1','#c6b0f4'];
drawCoin=function(c){const s=coinSeed(c);ctx.save();ctx.translate(c.x,c.y+Math.sin(time*4.2+s)*3);
 if(c.type==='normal'){const spin=Math.cos(time*5.5+s),wid=Math.max(.14,Math.abs(spin));ctx.scale(wid,1);ellipse(0,0,13,15,'#d99b2f');ellipse(spin>0?1:-1,-1,10.5,12.5,'#ffe28a');if(wid>.35)round(-2,-8,4,14,2,'#dfab41');ctx.globalAlpha=.6;ellipse(-4,-6,2.5,4,'#fffbe6')}
 else if(c.type==='star'){const p=1+Math.sin(time*7+s)*.07;ctx.scale(p,p);ctx.shadowColor='#ffd36a';ctx.shadowBlur=10;ellipse(0,0,19,19,'#f3a847');ctx.shadowBlur=0;ctx.save();ctx.rotate(Math.sin(time*2.5+s)*.35);star(0,0,15,'#fff2a5');ctx.restore();const tw=(time*1.3+s)%1;if(tw<.3){ctx.globalAlpha=1-tw/.3;star(11,-13,5*(tw/.3+.4),'#ffffff')}}
 else if(c.type==='special'){const glow=.5+Math.sin(time*6)*.5;ctx.shadowColor='#b091ed';ctx.shadowBlur=16+glow*12;ellipse(0,0,24,24,'#c6acf5');ctx.shadowBlur=0;ctx.lineWidth=5;for(let i=0;i<6;i++){const a=time*2.4+i*Math.PI/3;ctx.strokeStyle=RAINBOW[i];ctx.beginPath();ctx.arc(0,0,21,a,a+Math.PI/3+.02);ctx.stroke()}ellipse(0,0,16,16,'#f7eaff');ctx.save();ctx.rotate(Math.sin(time*3)*.3);star(0,0,12,'#b08ce4');ctx.restore();for(let i=0;i<3;i++)star(Math.cos(time*3+i*2.1)*32,Math.sin(time*3+i*2.1)*32,4,['#ffb2d2','#ffdd72','#a4dce7'][i])}
 else{const icon={shield:'🛡',magnet:'🧲',heart:'♥'}[c.type]||'?';let sc=1,rot=0;
  if(c.type==='heart'){const b=(time*1.6+s/6.28)%1;sc=1+(b<.12?Math.sin(b/.12*Math.PI)*.14:b>.2&&b<.32?Math.sin((b-.2)/.12*Math.PI)*.09:0)}
  if(c.type==='magnet')rot=Math.sin(time*5+s)*.22;
  ctx.shadowBlur=14;ctx.shadowColor='#fff3d5';ellipse(0,0,22,22,c.type==='heart'?'#f7c7d5':c.type==='shield'?'#d8ecff':'#ffe0ea');ctx.shadowBlur=0;ctx.strokeStyle='#ffffffcc';ctx.lineWidth=2.5;ctx.stroke();
  if(c.type==='shield'){ctx.save();ctx.beginPath();ctx.arc(0,0,22,0,Math.PI*2);ctx.clip();const sx=((time*.8+s)%1.6-.3)*70-24;ctx.globalAlpha=.5;ctx.fillStyle='#ffffff';ctx.beginPath();ctx.moveTo(sx,-24);ctx.lineTo(sx+10,-24);ctx.lineTo(sx-4,24);ctx.lineTo(sx-14,24);ctx.fill();ctx.restore()}
  if(c.type==='magnet'){ctx.save();ctx.globalAlpha=.5+Math.sin(time*8)*.3;ctx.strokeStyle='#e486a8';ctx.lineWidth=2;for(let i=0;i<2;i++){ctx.beginPath();ctx.arc(0,0,27+i*5,-.6,.6);ctx.stroke()}ctx.restore()}
  ctx.rotate(rot);ctx.scale(sc,sc);ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#bf6e92';ctx.font='23px sans-serif';ctx.fillText(icon,0,1)}
 ctx.restore()};

// ---- Obstacles: stage-specific looks, anticipation squash and an entry warning.
// The squash is drawn about the base and stays within the box; hit testing never changes.
function obstacleAntic(o){const d=o.x-(hero.x+HERO_BOX.right);return d>420||d<-10?0:Math.min(1,(420-d)/300)}
function outlined(){ctx.strokeStyle='#6d5468';ctx.lineWidth=2.5;ctx.stroke()}
function eyes(cx,y,a,color='#5b4652'){const look=-2*a,open=2.4+a*1.2;ellipse(cx-6+look,y,2.2,open,color);ellipse(cx+6+look,y,2.2,open,color)}
const OBSTACLE_ART={
 mushroom(o,v,a){const top=G-o.h,cx=o.x+o.w/2;round(cx-11,top+o.h*.38,22,o.h*.62,8,'#fff1d7');outlined();ellipse(cx,top+o.h*.33,o.w*.55,o.h*.36,['#d993a8','#f0a96b','#b9a0e0'][v],true);ellipse(cx-10,top+o.h*.2,5,4,'#fff4e4');ellipse(cx+11,top+o.h*.3,6,4.5,'#fff4e4');ellipse(cx+1,top+o.h*.1,3.5,3,'#fff4e4');eyes(cx,top+o.h*.66,a)},
 cake(o,v,a){const top=G-o.h,cx=o.x+o.w/2;
  if(v===1){const cols=['#f6b5c8','#bfe3c8','#d4c2f0'];for(let i=2;i>=0;i--){const y=top+o.h*(i*2+1)/6;ellipse(cx,y,o.w/2,o.h/6,cols[i],true);round(o.x+4,y+o.h/6-3,o.w-8,4,2,'#fff4e6')}eyes(cx,top+o.h*.5,a)}
  else if(v===2){ctx.fillStyle='#f6d58a';ctx.beginPath();ctx.moveTo(o.x+6,top+12);ctx.lineTo(o.x+o.w-6,top+12);ctx.lineTo(o.x+o.w,G);ctx.lineTo(o.x,G);ctx.closePath();ctx.fill();outlined();round(o.x+4,top+6,o.w-8,14,7,'#a8643f');outlined();ellipse(cx,top+1,6,6,'#e5687f',true);eyes(cx,top+o.h*.6,a)}
  else{round(o.x,top+8,o.w,o.h-8,8,'#e8b98c');outlined();round(o.x-2,top+4,o.w+4,15,7,'#fff0dc');outlined();ellipse(cx,top,8,9,'#e58f9f',true);for(let j=0;j<3;j++)round(o.x+6+j*15,G-25,5,12,3,'#b88870');eyes(cx,top+o.h*.45,a)}},
 cloud(o,v,a){const top=G-o.h,cx=o.x+o.w/2,[body,puff]=[['#b49acb','#ddc8ed'],['#9fb3d9','#d5e2f5'],['#c99ab8','#efd0e2']][v];round(o.x,top+12,o.w,o.h-12,14,body);outlined();ellipse(o.x+12,top+15,15,13,puff,true);ellipse(cx+5,top+11,18,15,puff,true);ellipse(o.x+o.w-9,top+17,12,11,puff,true);if(o.tall)for(let k=1;k<3;k++)round(o.x+6,top+o.h*k/3+8,o.w-12,4,2,'#ffffff40');eyes(cx,top+34,a,'#4e3e5c');star(cx,G-20,7,'#fae0ad')},
 lantern(o,v,a){const top=G-o.h,cx=o.x+o.w/2,body=['#bd81a6','#8794cf','#d98a6c'][v],glow=.75+Math.sin(time*9+o.phase)*.2;ctx.save();ctx.shadowColor='#ffd98a';ctx.shadowBlur=10*glow;round(o.x+7,top,o.w-14,o.h,9,body);ctx.restore();outlined();round(o.x,top-4,o.w,10,4,'#ead0e7');outlined();round(o.x+3,G-8,o.w-6,8,3,'#ead0e7');ctx.save();ctx.globalAlpha=glow;round(o.x+15,top+12,o.w-30,o.h-24,4,'#ffe0a1');ctx.restore();star(cx,top+o.h/2,7,'#d7969f');eyes(cx,top+18,a,'#5a3d55')}
};
function drawWarning(o){const x=Math.min(o.x+o.w/2,W-24),y=G-o.h-30-Math.abs(Math.sin(time*9))*5,text=o.tall?'!!':'!';ctx.save();round(x-16,y-16,32,26,12,'#fff6e0');ctx.strokeStyle='#e0679a';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#e0679a';ctx.textAlign='center';ctx.font='900 16px "Noto Sans KR",sans-serif';ctx.fillText(text,x,y+3);ctx.restore()}
drawObstacle=function(o){const a=obstacleAntic(o),cx=o.x+o.w/2,art=OBSTACLE_ART[o.type]||OBSTACLE_ART.mushroom;ellipse(cx,G+2,o.w*.62,5,'#5a3f5a30');
 ctx.save();const wob=Math.abs(Math.sin(time*7.5+(o.phase||0)))*.045*a;ctx.translate(cx,G);ctx.scale(1+wob*.6,1-wob);ctx.translate(-cx,-G);art(o,o.variant||0,a);ctx.restore();
 // Tall hazards announce themselves on entry (double-jump hint); every hazard shows an edge marker before it is visible.
 if((o.tall&&o.x>W-260)||o.x>W-12)drawWarning(o)};
// Status halo is drawn behind the image sprite by the wrapper in sprites.js.
function drawStatus(){if(shield||invulnerable>0){ctx.save();ctx.globalAlpha=shield?.65:.2+Math.abs(Math.sin(time*18))*.3;ellipse(hero.x+29,hero.y-42,48,53,shield?'#b6e3ff66':'#fff5d988');ctx.strokeStyle=shield?'#94cde9':'#ffddad';ctx.lineWidth=3;ctx.stroke();ctx.restore()}}
