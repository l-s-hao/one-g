import { chromium } from '/home/lsh/.cache/hairline-look/node_modules/playwright-core/index.mjs';
const browser = await chromium.launch({executablePath:'/home/lsh/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
await page.goto('http://127.0.0.1:5570/one-g/products/',{waitUntil:'networkidle'});
await page.screenshot({path:'/home/lsh/ONE/.oil-ui/search-flow-20261106/ux-review/01-entry.png',fullPage:true});
console.log(await page.locator('body').innerText());
await browser.close();
