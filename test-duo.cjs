const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const elements={},images=[];const g=new Proxy({createLinearGradient(){return{addColorStop(){}}},measureText(t){return{width:t.length*8}},drawImage(...a){images.push(a[0])}},{get(o,k){return k in o?o[k]:()=>{}}});
const env={Image:class{complete=true;naturalWidth=1536;naturalHeight=1024},document:{getElementById:id=>elements[id]??={classList:{add(){},remove(){}},addEventListener(){},getContext(){return g}},addEventListener(){}},window:{addEventListener(){}},localStorage:{getItem(){return null},setItem(){}},requestAnimationFrame(){},setInterval(){},performance:{now(){return 1000}},Math,console,assert,images};
vm.createContext(env);for(const name of ['game','visuals','adventure','sprites','multiplayer','duo'])vm.runInContext(fs.readFileSync(`dist/${name}.js`,'utf8'),env);
vm.runInContext(`
soloBegin();match={id:'a',status:'running',players:[{id:'a',name:'A',y:G,hearts:3,score:0},{id:'b',name:'B',y:G,hearts:3,score:0}]};matchStarted=true;friendReady=true;
updateRoomView(match);assert.equal(hero.x,170);images.length=0;drawHero();assert(images.includes(heroSheet)&&images.includes(friendSheet));
match.id='b';updateRoomView(match);assert.equal(hero.x,275);assert.equal(ownSeat(),1);images.length=0;drawHero();assert(images.includes(heroSheet)&&images.includes(friendSheet));
const remoteY=match.players[0].y;jump();assert.equal(hero.jumps,1);assert.equal(match.players[0].y,remoteY);assert(hero.vy<0);
updateRoomView({...match,players:[{...match.players[0],y:220,pose:{frame:3,sx:1,sy:1,rot:2} },match.players[1]]});assert.equal(remoteView.y,220);images.length=0;drawHero();assert(images.includes(heroSheet)&&images.includes(friendSheet));
result(false);assert.equal(state,'over');assert.equal(matchEnded,false);images.length=0;drawHero();assert(images.includes(heroSheet)&&images.includes(friendSheet));
console.log('PASS: stable two-player slots, different image skins on both screens, independent jump, remote jump pose, spectator after elimination');
`,env);
