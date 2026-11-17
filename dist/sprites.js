const heroSheet=new Image();heroSheet.src='hero-sprites-v1.png';
const vectorHero=drawHero;
drawHero=function(){if(!heroSheet.complete||!heroSheet.naturalWidth){vectorHero();return}
 if(typeof drawStatus==='function')drawStatus();
 const flying=boost>0,air=hero.y<G-1,spin=hero.jumps===2?(time-hero.spinAt)/.42:2;
 const frame=state==='over'?5:flying?4:hero.jumps===2?3:air?2:Math.floor(time*12)%2;
 // Each 512px cell is a separate pose; shared baseline keeps foot placement steady.
 const cellW=heroSheet.naturalWidth/3,cellH=heroSheet.naturalHeight/2;
 ctx.save();ctx.translate(hero.x+29,hero.y-40);
 if(flying){for(let i=5;i>=0;i--)round(-140-i*15,-24+i*6,115,7,4,['#ffacc9','#ffd899','#fff3a4','#b5e7b7','#9dd9f1','#c6b0f4'][i]);star(-84,-35+Math.sin(time*10)*7,7,'#fff2ab')}
 if(spin>=0&&spin<1&&!flying)ctx.rotate(spin*Math.PI*2);
 const size=122,bob=air?0:Math.sin(time*25)*1.4;
 ctx.drawImage(heroSheet,(frame%3)*cellW,Math.floor(frame/3)*cellH,cellW,cellH,-size/2,-size*.85+40+bob,size,size);
 ctx.restore();
};
