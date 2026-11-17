// Stable player slots and full-opacity, separately skinned characters on both screens.
const friendSheet=new Image();let friendReady=false,friendFrames=HERO_FRAMES.map(f=>({...f}));
friendSheet.onload=()=>{try{const surface=document.createElement('canvas');surface.width=friendSheet.naturalWidth;surface.height=friendSheet.naturalHeight;const g=surface.getContext('2d',{willReadFrequently:true});g.drawImage(friendSheet,0,0);const cw=surface.width/3,ch=surface.height/2,pixels=g.getImageData(0,0,surface.width,surface.height).data;friendFrames=Array.from({length:6},(_,i)=>{let left=cw,right=0,foot=0;for(let y=0;y<ch;y++)for(let x=0;x<cw;x++){if(pixels[((Math.floor(i/3)*ch+y)*surface.width+(i%3)*cw+x)*4+3]>100){left=Math.min(left,x);right=Math.max(right,x);foot=Math.max(foot,y)}}return {cx:(left+right)/2*512/cw,foot:foot*512/cw}});friendReady=true}catch{friendReady=false}};friendSheet.src='friend-sprites-v1.png';
function seatX(seat){return seat===0?170:275}
function ownSeat(){return match?Math.max(0,match.players.findIndex(p=>p.id===match.id)):0}
const baseSheetFrame=drawSheetFrame;
function paintSkin(f,dx,seat){if(seat===1&&friendReady){const cell=friendFrames[f],cw=friendSheet.naturalWidth/3,ch=friendSheet.naturalHeight/2,k=HERO_SIZE/512;ctx.drawImage(friendSheet,f%3*cw,Math.floor(f/3)*ch,cw,ch,dx-cell.cx*k,-cell.foot*k,HERO_SIZE,HERO_SIZE*ch/cw)}else baseSheetFrame(f,dx)}
drawSheetFrame=function(f,dx){paintSkin(f,dx,ownSeat())};
const dualBegin=begin,dualLeave=leaveRoom,dualResult=result,dualRoomView=updateRoomView,dualSoloBegin=soloBegin;
// Local movement uses the same slot shown to the opponent, including collision bounds.
updateRoomView=function(d){dualRoomView(d);if(match)hero.x=seatX(ownSeat());};
leaveRoom=async function(){await dualLeave();hero.x=170};$('room-leave').onclick=leaveRoom;
begin=function(){if(!match)hero.x=170;dualBegin()};
result=function(clear){if(!match){dualResult(clear);return}state='over';cleared=clear;overAt=Date.now();$('overlay').classList.add('hidden');matchText(`${clear?'완주':'탈락'} · 내 점수 ${score.toLocaleString()}점. 상대 플레이를 지켜보세요!`)};
let remoteView={id:null,y:G,at:0,previousY:G};
const updateDualRoom=updateRoomView;
updateRoomView=function(d){const other=d.players?.find(p=>p.id!==match?.id);if(other){remoteView={id:other.id,previousY:remoteView.id===other.id?remoteView.y:other.y,y:other.y,at:performance.now()}}updateDualRoom(d)};
function playerLabel(p,seat,y,isMe){const color=seat===0?'#c77999':'#548ab5',x=seatX(seat)+HERO_BOX.cx;ctx.save();ctx.textAlign='center';ctx.font='700 13px "Noto Sans KR",sans-serif';const name=`${seat+1}P ${p.name}${isMe?' (나)':''}`;const width=Math.min(220,ctx.measureText(name).width+20);round(x-width/2,y-116,width,23,11,'#fffaf0ee');ctx.fillStyle=color;ctx.fillText(name,x,y-100);ctx.font='11px sans-serif';ctx.fillText(p.done?(p.clear?'완주!':'탈락'):'♥'.repeat(p.hearts),x,y-82);ctx.restore()}
drawHero=function(){if(!match||!matchStarted){soloDraw();return}const seat=ownSeat(),remoteSeat=1-seat,other=match.players[remoteSeat],me=match.players[seat];
 if(other){const elapsed=Math.max(0,Math.min(1,(performance.now()-remoteView.at)/100)),y=remoteView.previousY+(other.y-remoteView.previousY)*elapsed;const pose=other.pose||{frame:other.done?5:other.boost>0?4:other.y<G-1?2:Math.floor((Date.now()+matchOffset-match.startAt)/1000*12)%2,sx:1,sy:1,rot:0,ox:0,oy:0};ctx.save();ctx.globalAlpha=1;ctx.translate(seatX(remoteSeat)+HERO_BOX.cx+(pose.ox||0),y+(pose.oy||0));ctx.scale(pose.sx||1,pose.sy||1);ctx.translate(0,-HERO_BOX.mid);ctx.rotate(pose.rot||0);ctx.translate(0,HERO_BOX.mid);if(heroSheetReady())paintSkin(pose.frame||0,0,remoteSeat);else ellipse(0,-40,27,35,remoteSeat?'#90bce4':'#fff4ed',true);ctx.restore();playerLabel(other,remoteSeat,y,false)}
 soloDraw();if(me)playerLabel({...me,hearts,done:state==='over',clear:cleared},seat,hero.y,true);
};
