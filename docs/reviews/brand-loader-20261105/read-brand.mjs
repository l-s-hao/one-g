import fs from 'node:fs';
import {scan,snapshot,card} from '/home/lsh/.agents/skills/hairline-create/read.mjs';
import {chromium} from '/home/lsh/.cache/hairline-look/node_modules/playwright-core/index.mjs';
const xml=fs.readFileSync('public/brand/one-g-symbol.svg','utf8');const info=scan(xml,'one-g-symbol.svg');
const b=await chromium.launch({headless:true,executablePath:'/home/lsh/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome'});
try{const r=await snapshot(b,xml,info.viewBox);fs.writeFileSync('docs/reviews/brand-loader-20261105/hairline-source.png',Buffer.from(r.png,'base64'));fs.writeFileSync('docs/reviews/brand-loader-20261105/hairline-source.txt',card(info,r.shapes,r.dark));}finally{await b.close();}
