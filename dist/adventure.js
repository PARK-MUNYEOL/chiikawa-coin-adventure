// A four-stage, two-minute adventure. All clocks advance only during play.
let hearts=3,shield=0,magnet=0,invulnerable=0,itemTimer=4,combo=0,comboClock=0,stageNotice=0;
const stageSpeeds=[430,490,550,610];
const originalBegin=begin,originalCoin=drawCoin,originalObstacle=drawObstacle,originalHero=drawHero;
begin=function(){originalBegin();hearts=3;shield=0;magnet=0;invulnerable=0;itemTimer=4;combo=0;comboClock=0;stageNotice=0;hero.spinAt=-10;speed=stageSpeeds[0];hud()};
hud=function(){const stage=Math.min(3,Math.floor(time/30));$('score').textContent=score.toLocaleString();$('power').textContent=`${'♥'.repeat(hearts)}${'♡'.repeat(3-hearts)}  · ${boost>0?'🌈 '+boost.toFixed(1)+'초':shield?'🛡 보호막':magnet>0?'🧲 '+Math.ceil(magnet)+'초':hero.jumps+'/2 점프'}${combo>=5?' · '+combo+' 콤보':''}`;$('progress').textContent=`STAGE ${stage+1}/4 · ${Math.min(30,Math.floor(time%30))}/30초`;};
function result(clear){state='over';if(score>best){best=score;$('best').textContent=best.toLocaleString();try{localStorage.setItem('chiikawa-run-score-v2',best)}catch{}}panel(clear?'별빛 축제 도착! ✨':'잠깐 쉬고 다시 모험해요',`${clear?'네 개의 스테이지를 모두 돌파했어요!':'도달한 스테이지 '+(Math.min(3,Math.floor(time/30))+1)+'/4'}<br>이번 점수 <b>${score.toLocaleString()}점</b> · 최고 ${best.toLocaleString()}점`,'처음부터 다시 →')}
end=function(){result(false)};
collect=function(c){if(c.taken)return;c.taken=true;burst(c.x,c.y,'#ffdd83');
 if(c.type==='shield'){shield=1;return}if(c.type==='magnet'){magnet=7;return}if(c.type==='heart'){hearts=Math.min(3,hearts+1);return}
 combo++;comboClock=2;score+=(c.type==='special'?300:c.type==='star'?100:10)*Math.min(3,1+Math.floor(combo/20));
 if(c.type==='special'){boost=5;boostCoins=0;hero.vy=0;hero.jumps=0;obstacles=[];for(const other of coins)if(other!==c&&other.x<hero.x+50)other.taken=true}hud()};
function spawnPattern(stage){const x=W+70;const type=['mushroom','cake','cloud','lantern'][stage];const tall=stage>=2&&Math.random()<.35;obstacles.push({x,w:tall?55:48,h:tall?115:60+stage*5,type});
 // Pairs are close enough to clear in one jump, with a guaranteed recovery gap.
 if(stage>=1&&Math.random()<.45)obstacles.push({x:x+90,w:46,h:56,type});
 const height=tall?G-185:G-115;for(let i=0;i<7;i++)coins.push({x:x-75+i*50,y:height-Math.sin(i/6*Math.PI)*38,type:i===3?'star':'normal'});
 spawn=stage===0?1.7:stage===1?1.65:1.55;
}
function hurt(o){o.passed=true;if(shield){shield=0;invulnerable=1.2;burst(hero.x+25,hero.y-40,'#a3dfff',18);return}hearts--;combo=0;comboClock=0;invulnerable=1.8;burst(hero.x+25,hero.y-40,'#ef9cb6',18);if(hearts<=0)end()}
update=function(dt){if(state!=='playing')return;const oldStage=Math.min(3,Math.floor(time/30));time=Math.min(120,time+dt);const stage=Math.min(3,Math.floor(time/30));magnet=Math.max(0,magnet-dt);invulnerable=Math.max(0,invulnerable-dt);comboClock-=dt;if(comboClock<=0)combo=0;
 if(stage!==oldStage){obstacles=[];spawn=1.8;score+=500;stageNotice=3;coins.push({x:W-50,y:G-65,type:'heart'})}stageNotice=Math.max(0,stageNotice-dt);
 if(time>=120){score+=2000;result(true);hud();return}
 const flying=boost>0;boost=Math.max(0,boost-dt);speed=flying?1000:stageSpeeds[stage];scroll+=speed*dt;
 if(flying){hero.y+=(177+Math.sin(time*9)*8-hero.y)*Math.min(1,dt*12);hero.vy=0;hero.jumps=0;boostCoins-=dt;if(boostCoins<=0){boostCoins=.075;coins.push({x:W+30,y:145+Math.sin(time*8)*27,type:Math.random()<.22?'star':'normal'})}if(boost===0){obstacles=[];spawn=1.8;coinTimer=.2;specialTimer=9;invulnerable=Math.max(invulnerable,1.2)}}else{hero.vy+=2050*dt;hero.y+=hero.vy*dt;if(hero.y<95){hero.y=95;hero.vy=Math.max(0,hero.vy)}if(hero.y>=G){hero.y=G;hero.vy=0;hero.jumps=0}spawn-=dt;if(spawn<=0)spawnPattern(stage);coinTimer-=dt;if(coinTimer<=0){for(let i=0;i<5;i++)coins.push({x:W+50+i*48,y:G-40,type:'normal'});coinTimer=2.6}specialTimer-=dt;if(specialTimer<=0){coins.push({x:W+60,y:G-110,type:'special'});specialTimer=15}itemTimer-=dt;if(itemTimer<=0){const types=hearts<3?['heart','shield','magnet']:['shield','magnet'];coins.push({x:W+40,y:G-65,type:types[Math.floor(Math.random()*types.length)]});itemTimer=7}}
 // Use current boost status: a rainbow picked up this frame protects immediately.
 for(const c of coins){c.x-=speed*dt;const dx=c.x-(hero.x+28),dy=c.y-(hero.y-40);if((boost>0||magnet>0)&&dx>-70&&dx<340&&Math.abs(dy)<(boost>0?400:260)){const pull=Math.min(1,dt*13);c.x-=dx*pull;c.y-=dy*pull}if(!c.taken&&c.x>hero.x-12&&c.x<hero.x+72&&Math.abs(c.y-(hero.y-40))<43)collect(c)}coins=coins.filter(c=>!c.taken&&c.x>-50);
 for(const o of obstacles){o.x-=speed*dt;if(!o.passed&&boost<=0&&invulnerable<=0&&hero.x+53>o.x+5&&hero.x+4<o.x+o.w-5&&hero.y-8>G-o.h+7){hurt(o);if(state==='over')break}}obstacles=obstacles.filter(o=>o.x>-130);for(const s of sparks){s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt}sparks=sparks.filter(s=>s.life>0);hud()};
drawCoin=function(c){const icons={shield:'🛡',magnet:'🧲',heart:'♥'};if(!icons[c.type]){originalCoin(c);return}ctx.save();ctx.shadowBlur=13;ctx.shadowColor='#fff3d5';ellipse(c.x,c.y,22,22,c.type==='heart'?'#f7c7d5':'#e6e6ff');ctx.shadowBlur=0;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#bf6e92';ctx.font='23px sans-serif';ctx.fillText(icons[c.type],c.x,c.y+1);ctx.restore()};
drawObstacle=function(o){if(['mushroom','cake'].includes(o.type)){originalObstacle(o);return}if(o.type==='cloud'){round(o.x,G-o.h,o.w,o.h,15,'#b49acb');ellipse(o.x+12,G-o.h,17,15,'#ddc8ed');ellipse(o.x+36,G-o.h+3,18,17,'#ddc8ed');star(o.x+24,G-24,8,'#fae0ad')}else{round(o.x+7,G-o.h,o.w-14,o.h,9,'#bd81a6');round(o.x,G-o.h-4,o.w,10,4,'#ead0e7');round(o.x+15,G-o.h+12,o.w-30,o.h-22,4,'#ffe0a1');star(o.x+o.w/2,G-o.h/2,7,'#d7969f')}};
// Status halo is drawn behind the image sprite by the wrapper in sprites.js.
function drawStatus(){if(shield||invulnerable>0){ctx.save();ctx.globalAlpha=shield?.65:.2+Math.abs(Math.sin(time*18))*.3;ellipse(hero.x+29,hero.y-42,48,53,shield?'#b6e3ff66':'#fff5d988');ctx.strokeStyle=shield?'#94cde9':'#ffddad';ctx.lineWidth=3;ctx.stroke();ctx.restore()}}
