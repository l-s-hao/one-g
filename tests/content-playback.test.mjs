import test from 'node:test';
import assert from 'node:assert/strict';
import {readMediaSession,writeMediaSession,registerContentPlayer,claimContentPlayer,releaseContentPlayer,pauseContentWithin,coordinateContentPlayers} from '../src/lib/content-playback.ts';

test('started, user stop and completion remain distinct; storage failure preserves memory',()=>{
 const storage=new Map();globalThis.sessionStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)};
 assert.deepEqual(readMediaSession('unit-media'),{started:false,stopped:false,ended:false});
 writeMediaSession('unit-media',{started:true});assert.equal(readMediaSession('unit-media').ended,false);
 writeMediaSession('unit-media',{stopped:true});assert.deepEqual(JSON.parse(storage.values().next().value)['unit-media'],{started:true,stopped:true,ended:false});
 globalThis.sessionStorage={getItem:()=>{throw Error('blocked');},setItem:()=>{throw Error('blocked');}};
 writeMediaSession('unit-media',{ended:true});assert.equal(readMediaSession('unit-media').ended,true);
 assert.deepEqual(readMediaSession('memory-only'),{started:false,stopped:false,ended:false});
});
test('registered players coordinate manual priority and scoped chapter pause',async()=>{
 globalThis.document={hidden:false};let pauses=0,auto=0;
 const root={closest:()=>null};
 const a={root,visible:.9,requested:false,manual:false,pause:()=>{pauses++;releaseContentPlayer(a);},auto:()=>{auto++;a.requested=true;claimContentPlayer(a,false);}};
 const b={...a,root:{closest:()=>null},visible:.8,auto:()=>{throw Error('secondary should not steal auto priority');},pause:()=>releaseContentPlayer(b)};
 const cleanA=registerContentPlayer(a),cleanB=registerContentPlayer(b);
 coordinateContentPlayers();await Promise.resolve();assert.equal(auto,1);
 assert.equal(claimContentPlayer(b,false),false);assert.equal(claimContentPlayer(b,true),true);assert.equal(pauses,1);
 pauseContentWithin({contains:r=>r===b.root});b.requested=true;cleanA();cleanB();await Promise.resolve();
});
