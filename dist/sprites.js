// Image hero with state-driven motion. Uses the original six-pose sheet; falls back to the
// vector hero from visuals.js whenever the sheet is missing, broken or not yet decoded.
const heroSheet=new Image();let heroSheetFailed=false;heroSheet.onerror=()=>{heroSheetFailed=true};heroSheet.onload=()=>{heroSheetFailed=false};heroSheet.src='hero-sprites-v1.png';
// Measured alpha bounds inside each 512px cell: foot baseline and body centre per pose
// (0,1 run · 2 jump · 3 double-jump tuck · 4 fever flight · 5 hurt/fall).
const HERO_FRAMES=[{foot:446,cx:254},{foot:454,cx:261},{foot:426,cx:261},{foot:421,cx:259},{foot:426,cx:266},{foot:466,cx:254}];
const HERO_SIZE=122,vectorHero=drawHero;
let heroPose={frame:0,sx:1,sy:1,rot:0,ox:0,oy:0,alpha:1};
function heroSheetReady(){return !heroSheetFailed&&heroSheet.complete&&heroSheet.naturalWidth>0&&heroSheet.naturalHeight>0}
function easeOut(t){t=Math.max(0,Math.min(1,t));return 1-Math.pow(1-t,3)}
// Pure function of game state and the game clock, so pause freezes it and restart resets it.
function heroMotion(){
 const flying=boost>0,air=hero.y<G-.5||hero.vy<0,since=k=>time-(hero[k]??-10);
 const hit=since('hitAt'),land=since('landAt'),take=since('jumpAt'),fever=since('feverAt'),spinT=hero.jumps===2?(time-(hero.spinAt??-10))/.42:2;
 let frame=0,sx=1,sy=1,rot=0,ox=0,oy=0,alpha=1;
 if(state==='over'){frame=cleared?2:5;if(!cleared)rot=-.12}
 else if(hit<.45&&!flying){const k=1-hit/.45;frame=5;rot=-.35*k;ox=-8*k;sx=1+.12*k;sy=1-.1*k}
 else if(flying){frame=4;const pop=fever<.3?Math.sin(fever/.3*Math.PI)*.18:0;sx=1.06+pop;sy=.95+pop;rot=-.1+Math.sin(time*7)*.06}
 else if(air){
  if(spinT>=0&&spinT<1){frame=3;rot=easeOut(spinT)*Math.PI*2;const tuck=Math.sin(spinT*Math.PI)*.08;sx-=tuck;sy-=tuck}
  else{frame=hero.jumps===2&&hero.vy<0?3:2;rot=Math.max(-.2,Math.min(.25,hero.vy*.00022))}
  if(take<.18){const k=1-take/.18;sx-=.14*k;sy+=.18*k}
  else if(hero.vy>250){const k=Math.min(1,(hero.vy-250)/900);sx-=.05*k;sy+=.07*k}
 }else{
  // Stride rate follows run speed; each footfall gets a small contact squash and lift.
  const phase=time*(8+speed*.008),f=phase%1;frame=Math.floor(phase)%2;oy=-Math.sin(f*Math.PI)*3;rot=.04+Math.sin(phase*Math.PI)*.025;
  const contact=Math.max(0,1-f/.25)*.04;sx+=contact;sy-=contact;
  if(land<.2){const k=(1-land/.2)*(.1+.16*(hero.landImpact||0));sx+=k;sy-=k;oy=0}
 }
 if(state==='playing'&&invulnerable>0&&!flying)alpha=Math.floor(time*14)%2?.45:1;
 return {frame,sx:Math.max(.6,sx),sy:Math.max(.6,sy),rot,ox,oy,alpha};
}
function drawSheetFrame(f,dx){const cell=HERO_FRAMES[f],cw=heroSheet.naturalWidth/3,ch=heroSheet.naturalHeight/2,u=cw/512,k=HERO_SIZE/cw;
 // Feet land exactly on the anchor (y=0) and the body is centred on x=0 for every pose.
 ctx.drawImage(heroSheet,(f%3)*cw,Math.floor(f/3)*ch,cw,ch,dx-cell.cx*u*k,-cell.foot*u*k,cw*k,ch*k)}
function drawFeverTrail(m){ctx.save();ctx.translate(hero.x+HERO_BOX.cx,hero.y-HERO_BOX.mid);for(let i=5;i>=0;i--){ctx.globalAlpha=.85;round(-140-i*15,-24+i*6+Math.sin(time*12-i*.7)*3,115,7,4,RAINBOW[i])}ctx.globalAlpha=1;star(-84,-35+Math.sin(time*10)*7,7,'#fff2ab');ctx.restore()}
drawHero=function(){if(typeof drawStatus==='function')drawStatus();const m=heroMotion(),ready=heroSheetReady();heroPose={...m,image:ready};
 if(ready&&boost>0)drawFeverTrail(m);
 ctx.save();ctx.globalAlpha=m.alpha;ctx.translate(hero.x+HERO_BOX.cx+m.ox,hero.y+m.oy);ctx.scale(m.sx,m.sy);
 if(ready){ctx.translate(0,-HERO_BOX.mid);ctx.rotate(m.rot);ctx.translate(0,HERO_BOX.mid);
  if(boost>0)for(const [dx,a] of [[-52,.1],[-26,.22]]){ctx.globalAlpha=m.alpha*a;drawSheetFrame(m.frame,dx)}
  ctx.globalAlpha=m.alpha;drawSheetFrame(m.frame,0)}
 // Vector fallback applies its own spin and fever trail; we only add squash/offset around the same anchor.
 else{ctx.translate(-(hero.x+HERO_BOX.cx),-hero.y);vectorHero()}
 ctx.restore()};
