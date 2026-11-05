import test from 'node:test';import assert from 'node:assert/strict';
import {attachVideoProgress,progressFraction} from '../src/lib/video-progress.ts';
import {applyUserVolume} from '../src/lib/media-volume.ts';
test('media progress rejects unknown duration and clamps real fractional times',()=>{
 for(const d of [0,-1,NaN,Infinity])assert.equal(progressFraction(2,d),0);
 assert.equal(progressFraction(-2,10),0);assert.equal(progressFraction(12,10),1);
 assert.ok(Math.abs(progressFraction(1.2345,10)-.12345)<1e-12);assert.equal(progressFraction(NaN,10),0);
});
test('one frame chain owns fill and native thumb; pause/wait/hidden/drag/destroy cleanly stop it',()=>{
 const old={document:globalThis.document,requestAnimationFrame:globalThis.requestAnimationFrame,cancelAnimationFrame:globalThis.cancelAnimationFrame};
 const queue=new Map();let serial=0;globalThis.requestAnimationFrame=cb=>{queue.set(++serial,cb);return serial;};globalThis.cancelAnimationFrame=id=>queue.delete(id);globalThis.document=Object.assign(new EventTarget(),{hidden:false});
 const video=Object.assign(new EventTarget(),{currentTime:0,duration:100,paused:false,ended:false,seeking:false,readyState:4,seekable:{length:1,start:()=>0,end:()=>100}});
 const attrs=new Map(),styles=new Map(),capture=new Set();const input=Object.assign(new EventTarget(),{value:'0',max:'1',disabled:true,style:{setProperty:(k,v)=>styles.set(k,v)},getAttribute:k=>attrs.get(k),setAttribute:(k,v)=>attrs.set(k,v),setPointerCapture:id=>capture.add(id),hasPointerCapture:id=>capture.has(id),releasePointerCapture:id=>capture.delete(id)});
 const label={textContent:''};let end=0;const controller=attachVideoProgress(video,input,label,()=>end++);
 const tick=()=>{const entry=queue.entries().next().value;if(!entry)return;queue.delete(entry[0]);entry[1](0);};
 try{
 video.seekable.end=()=>0;controller.sync();assert.equal(input.disabled,true);video.seekable.end=()=>100;controller.sync();assert.equal(input.disabled,false);
 assert.equal(queue.size,1);controller.sync();controller.sync();assert.equal(queue.size,1);
 for(const t of [.0167,.0334,.0501]){video.currentTime=t;tick();assert.equal(Number(input.value),t);assert.ok(Math.abs(parseFloat(styles.get('--progress'))-t)<1e-12);assert.equal(queue.size,1);}
 video.paused=true;video.dispatchEvent(new Event('pause'));assert.equal(queue.size,0);
 video.paused=false;video.dispatchEvent(new Event('playing'));assert.equal(queue.size,1);video.dispatchEvent(new Event('waiting'));assert.equal(queue.size,0);
 video.dispatchEvent(new Event('playing'));controller.setVisible(false);assert.equal(queue.size,0);video.currentTime=12.345;controller.setVisible(true);assert.equal(Number(input.value),12.345);assert.equal(queue.size,1);
 assert.equal(controller.begin(7),true);assert.equal(queue.size,0);controller.seek(30.125);assert.equal(Number(input.value),30.125);video.currentTime=4;video.dispatchEvent(new Event('timeupdate'));assert.equal(Number(input.value),30.125);video.currentTime=30.125;video.dispatchEvent(new Event('seeked'));assert.equal(Number(input.value),30.125);controller.finish(7);assert.equal(end,1);assert.equal(capture.size,0);
 input.value="45.5";input.dispatchEvent(new Event("input"));assert.equal(video.currentTime,45.5);video.dispatchEvent(new Event("seeked"));
 controller.seek(video.currentTime);assert.equal(queue.size,1,'same-target seeking does not permanently stop sampling');
 document.hidden=true;document.dispatchEvent(new Event('visibilitychange'));assert.equal(queue.size,0);document.hidden=false;document.dispatchEvent(new Event('visibilitychange'));assert.equal(queue.size,1);
 controller.destroy();assert.equal(queue.size,0);video.dispatchEvent(new Event('playing'));assert.equal(queue.size,0);
 }finally{controller.destroy();for(const [k,v]of Object.entries(old)){if(v===undefined)delete globalThis[k];else globalThis[k]=v;}}
});
test('volume writes are finite, clamped and user initiated; readonly platform never falsely unmutes',()=>{
 const media={volume:.4,muted:true};assert.equal(applyUserVolume(media,25),true);assert.deepEqual(media,{volume:.25,muted:false});assert.equal(applyUserVolume(media,200),true);assert.equal(media.volume,1);applyUserVolume(media,-4);assert.deepEqual(media,{volume:0,muted:true});const previous={...media};assert.equal(applyUserVolume(media,NaN),false);assert.deepEqual(media,previous);
 const readonly={get volume(){return 1;},set volume(v){void v;},muted:true};assert.equal(applyUserVolume(readonly,30),false);assert.equal(readonly.muted,true);
});
