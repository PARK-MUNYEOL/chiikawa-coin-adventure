// Four chapters of the journey. Gameplay time stops while paused.
const chapters=[
 {name:'아침의 버섯 마을',line:'별빛 축제에 가자! 코인을 모으면 길이 반짝일 거야.',sky:'#bde5ef',low:'#fff2dc',hill:'#c9e4c6',ground:'#edcfb7',edge:'#b8d59d'},
 {name:'오후의 과자 언덕',line:'달콤한 냄새가 나! 과자 언덕을 넘어 보자.',sky:'#f1cdd9',low:'#fff0ce',hill:'#e3bf9c',ground:'#dcb293',edge:'#fff1d4'},
 {name:'노을빛 구름 다리',line:'구름 위까지 올라왔어! 축제가 가까워졌어.',sky:'#b9acd9',low:'#fbc6b6',hill:'#e3c4e6',ground:'#d8cee8',edge:'#fff3f5'},
 {name:'밤의 별빛 축제',line:'드디어 별빛 축제! 반짝이는 여행은 계속돼.',sky:'#373b72',low:'#9d83b7',hill:'#7776a1',ground:'#8a7b9f',edge:'#d2bedf'}
];
function chapterIndex(){return Math.min(3,Math.floor(time/30))}
function mix(a,b,t){const c=i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-t)+parseInt(b.slice(i,i+2),16)*t);return `rgb(${c(1)},${c(3)},${c(5)})`}
function wrap(x,n){return ((x%n)+n)%n}
background=function(){
 const stage=chapterIndex(),c=chapters[stage],prev=chapters[Math.max(0,stage-1)],fade=stage===0?1:Math.min(1,(time-stage*30)/2.5);
 const gradient=ctx.createLinearGradient(0,0,0,H);gradient.addColorStop(0,mix(prev.sky,c.sky,fade));gradient.addColorStop(1,mix(prev.low,c.low,fade));ctx.fillStyle=gradient;ctx.fillRect(0,0,W,H);
 if(stage===3){ctx.save();ctx.globalAlpha=fade;for(let i=0;i<40;i++)star(wrap(i*137-scroll*.035,W),40+i*47%240,2+Math.sin(time*2+i),'#fff3c6');ellipse(908,87,36,36,'#ffedbb');ellipse(920,76,31,31,c.sky);for(let i=0;i<3;i++){const phase=(time*.35+i*.33)%1,r=phase*53;ctx.globalAlpha=(1-phase)*fade;for(let j=0;j<10;j++)star(620+i*170+Math.cos(j*Math.PI/5)*r,95+i%2*45+Math.sin(j*Math.PI/5)*r,3,['#ffd4ad','#d1e7ff','#ffc4db'][i])}ctx.restore()}else ellipse(900,96,43,43,stage===2?'#ffd0a0':'#ffdfa0');
 for(let i=0;i<7;i++){const x=wrap(i*205-scroll*.10,W+220)-90,y=77+i%3*43;ellipse(x,y,44,18,'#ffffff70');ellipse(x+25,y-8,30,23,'#ffffff70')}
 for(let i=-1;i<7;i++){const x=i*240-scroll*.21%240;ellipse(x,415,205,stage===2?90:150,mix(prev.hill,c.hill,fade));
 if(stage===0){round(x+50,300,83,89,17,'#fff4db');ctx.fillStyle='#d7a7be';ctx.beginPath();ctx.moveTo(x+38,309);ctx.quadraticCurveTo(x+90,220,x+146,309);ctx.fill();round(x+80,345,23,44,12,'#bd9fab');ellipse(x+67,327,8,8,'#e9c584')}
 if(stage===1){round(x+40,294,90,94,15,'#e3b27f');round(x+34,284,102,29,15,'#fff0db');for(let k=0;k<3;k++)ellipse(x+59+k*24,334,5,5,'#b38469');ellipse(x+84,277,13,14,'#d985a2')}
 if(stage===2){ellipse(x+65,315,85,23,'#fff1f3');ellipse(x+95,299,40,30,'#fff1f3');ctx.strokeStyle='#f9e2e9';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+40,270);ctx.lineTo(x+36,225);ctx.stroke();ellipse(x+36,209,17,23,'#e5a1ba')}
 if(stage===3){round(x+52,310,79,79,6,'#9a86b6');ctx.fillStyle='#e7b3d2';ctx.beginPath();ctx.moveTo(x+42,310);ctx.lineTo(x+91,267);ctx.lineTo(x+141,310);ctx.fill();round(x+77,342,28,47,13,'#ffe3a3');ctx.strokeStyle='#ecd4e8';ctx.beginPath();ctx.moveTo(x,248);ctx.quadraticCurveTo(x+120,280,x+240,248);ctx.stroke();for(let j=0;j<5;j++)ellipse(x+j*52,252+Math.sin(j/4*Math.PI)*12,5,7,'#ffe4a7')}
 }
 round(0,G,W,115,0,mix(prev.ground,c.ground,fade));round(0,G,W,15,0,mix(prev.edge,c.edge,fade));round(0,G+15,W,6,0,'#8b6e8a25');
 for(let i=-1;i<24;i++){const x=i*57-scroll%57;round(x,G+38+(i%3)*20,24,3,2,'#ffffff45')}
 // Foreground moves faster than the ground: strong parallax without hiding hazards.
 for(let i=-1;i<15;i++){const x=i*95-wrap(scroll*1.38,95),y=H-9-i%2*13;if(stage===0){round(x,y-15,4,24,2,'#8cba8c');ellipse(x+2,y-18,8,5,'#f3b4cb')}else if(stage===1){round(x,y-20,14,25,4,'#e8bc89');round(x-1,y-23,16,8,4,'#fff0d1')}else if(stage===2){ellipse(x,y,35,14,'#fff3f5aa')}else star(x,y-12,7,'#ffe4ab')}
 if(boost>0){ctx.save();ctx.strokeStyle='#ffffff95';ctx.lineWidth=2.5;for(let i=0;i<30;i++){const x=wrap(i*113-scroll*1.9,1400)-150,y=90+i*13;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+70+(i%3)*28,y);ctx.stroke()}ctx.restore()}
 drawStory(stage);
};
function drawStory(stage){ctx.save();ctx.textAlign='center';round(420,20,260,32,16,'#fff8f0d9');ctx.fillStyle='#78617d';ctx.font='600 14px "Noto Sans KR", sans-serif';ctx.fillText(`${String(stage+1).padStart(2,'0')} / 04   ${chapters[stage].name}`,550,42);
 const elapsed=time-stage*30;if(elapsed<5){ctx.globalAlpha=Math.min(1,elapsed+.3,5-elapsed);round(285,77,530,42,21,'#fffaf0e8');ctx.font='14px "Noto Sans KR",sans-serif';ctx.fillText(chapters[stage].line,550,104)}else if(stage<3&&elapsed>26){ctx.globalAlpha=Math.min(1,elapsed-26);round(385,77,330,38,19,'#fffaf0dd');ctx.fillText(`다음 여행지 · ${chapters[stage+1].name}`,550,102)}
 if(boost>0){ctx.globalAlpha=1;ctx.font='900 23px "Noto Sans KR",sans-serif';ctx.fillStyle='#fff7ce';ctx.shadowColor='#ac72cd';ctx.shadowBlur=8;ctx.fillText('RAINBOW FEVER!',550,152);ctx.shadowBlur=0;round(450,163,200,6,3,'#ffffff60');round(450,163,200*boost/5,6,3,'#ffdf95')}ctx.restore()}
drawHero=function(){ctx.save();ctx.translate(hero.x+29,hero.y);const flying=boost>0,airborne=hero.y<G-1,step=Math.sin(time*25),spin=hero.jumps===2&&hero.spinAt!==undefined?(time-hero.spinAt)/.42:2;
 if(flying){ctx.save();for(let i=5;i>=0;i--){ctx.globalAlpha=.7;round(-95-i*22,-61+i*6,102,7,4,['#ffacc9','#ffd899','#fff3a4','#b5e7b7','#9dd9f1','#c6b0f4'][i])}for(let i=0;i<3;i++){ctx.globalAlpha=.16-i*.04;ellipse(-40-i*30,-43,23,27,'white')}ctx.restore();star(-51,-76+Math.sin(time*8)*5,8,'#fff2ab')}
 ctx.translate(0,-38);if(spin>=0&&spin<1)ctx.rotate(spin*Math.PI*2);else if(flying)ctx.rotate(.23);else ctx.rotate(.10);ctx.translate(0,38);ctx.translate(0,airborne?0:step*2);
 // Back ear, far leg, and swinging travel bag.
 ellipse(-12,-72,10,12,'#f8eee8',true);ellipse(-12,-73,5,6,'#f0c6d3');ellipse(airborne?-10:-8-step*10,airborne?-8:-5+Math.max(0,step)*-5,10,7,'#f7eee8',true);
 ctx.save();ctx.translate(-19,-27);ctx.rotate(Math.sin(time*19-.8)*.12);round(-13,-17,24,29,8,'#c9b5df');ctx.strokeStyle='#8e759f';ctx.lineWidth=2;ctx.strokeRect(-9,-13,16,22);star(0,-1,6,'#ffe5a0');ctx.restore();
 ellipse(0,-27,22,25,'#fffaf3',true);ellipse(airborne?14:12+step*10,airborne?-4:-5-Math.max(0,-step)*5,11,7,'#fffaf3',true);
 ellipse(8,-54,29,28,'#fffaf3',true);ellipse(3+Math.sin(time*17-.6)*2,-79,11,12,'#fffaf3',true);ellipse(4,-80,5,6,'#f4cbd5');ellipse(30,-49,10,12,'#fffaf3');
 if(flying){star(12,-57,6,'#b78ace');star(29,-57,5,'#b78ace');ellipse(27,-39,7,8,'#a76c84');ellipse(28,-35,5,3,'#f5b2c7')}else if(state==='over'){ellipse(13,-56,5,6,'#493e43');ellipse(29,-56,4,5,'#493e43');ellipse(30,-40,4,5,'#be8797')}else{ellipse(14,-57,3.4,4.6,'#493e43');ellipse(30,-56,2.8,4,'#493e43');ellipse(15,-59,1.2,1.3,'white');ctx.strokeStyle='#66515b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(25,-43);ctx.quadraticCurveTo(29,-38,33,-43);ctx.stroke()}
 ellipse(13,-43,7,4,'#f2b8c9');ctx.save();ctx.translate(7,-26);ctx.rotate(flying?-1.0:airborne?-.7:step*.6);ellipse(13,0,12,7,'#fffaf3',true);ctx.restore();ctx.restore()};
