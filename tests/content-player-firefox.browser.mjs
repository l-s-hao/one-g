import assert from 'node:assert/strict';import fs from 'node:fs';
const dir=`docs/reviews/content-player-20261105/firefox-${Date.now()}`;fs.mkdirSync(dir,{recursive:true});let session;
async function call(method,path,body){const r=await fetch('http://127.0.0.1:4455'+path,{method,headers:{'content-type':'application/json'},body:body?JSON.stringify(body):undefined});const value=(await r.json()).value;if(value?.error)throw Error(JSON.stringify(value));return value;}
const script=(s,args=[])=>call('POST',`/session/${session}/execute/sync`,{script:`const root=document.querySelector('[data-content-player]');const video=root?.querySelector('video');`+s,args});
async function until(s){const end=Date.now()+30000;while(Date.now()<end){if(await script(s))return;await new Promise(r=>setTimeout(r,100));}throw Error('Condition timed out: '+s);}
try{
 session=(await call('POST','/session',{capabilities:{alwaysMatch:{browserName:'firefox','moz:firefoxOptions':{args:['-headless']}}}})).sessionId;
 await call('POST',`/session/${session}/window/rect`,{width:1440,height:1000});await call('POST',`/session/${session}/url`,{url:(process.env.ONE_G_TEST_URL||'http://localhost:3000/one-g')+'/solutions/teleoperation/'});
 await until('return !!root?.querySelector("button")');
 await script('root.scrollIntoView({block:"center"})');
 await until('return root?.dataset.phase==="playing" && video.currentTime>0');
 assert.equal(await script('return video.muted'),true);
 await script('root.querySelectorAll("button")[0].click()');
 await until('return getComputedStyle(video).filter==="blur(6px)"');
 const shot=await call('GET',`/session/${session}/screenshot`);fs.writeFileSync(dir+'/paused.png',Buffer.from(shot,'base64'));
 await script('root.querySelector("button").click()');await until('return root.dataset.phase==="playing"');
 await script('video.currentTime=video.duration-.3');await until('return root.dataset.phase==="ended"');
 assert.equal(await script('return video.paused'),true);
 fs.writeFileSync(dir+'/results.json',JSON.stringify({browser:'Firefox',checks:['real muted autoplay','pause blur','resume','real ended stop']}));console.log(dir+' PASS');
}catch(e){fs.writeFileSync(dir+'/failure.txt',e.stack);throw e;}finally{if(session)await call('DELETE',`/session/${session}`);}
