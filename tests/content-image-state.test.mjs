import test from 'node:test';import assert from 'node:assert/strict';
import {contentImageState} from '../src/lib/content-image-state.ts';
test('image completion requires drawable pixels and distinguishes cached failure',()=>{
 assert.equal(contentImageState(true,640,true,false),'loaded');
 assert.equal(contentImageState(true,0,true,true),'failed');
 assert.equal(contentImageState(false,0,true,true,true),'failed');
});
test('invisible and unrequested images do not animate; an actual visible wait does',()=>{
 assert.equal(contentImageState(false,0,false,false),'waiting');
 assert.equal(contentImageState(false,0,true,false),'waiting');
 assert.equal(contentImageState(false,0,true,true),'loading');
 assert.equal(contentImageState(false,640,true,true),'loading');
});
