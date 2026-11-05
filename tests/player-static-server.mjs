// 本地生产验收服务器，支持真实媒体 Range；不进入网站业务运行时。
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('out');
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.mp4':'video/mp4','.webm':'video/webm','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2'};
http.createServer((req,res)=>{
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
 if(!pathname.startsWith('/one-g/')){res.writeHead(404).end();return;}
 let file=path.resolve(root,'.'+pathname.slice(6));
 if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return;}
 try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');const size=fs.statSync(file).size;const headers={'Content-Type':mime[path.extname(file)]||'application/octet-stream','Accept-Ranges':'bytes'};let start=0,end=size-1,status=200;
 if(req.headers.range){const match=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range);if(!match){res.writeHead(416,{'Content-Range':`bytes */${size}`}).end();return;}start=Number(match[1]);end=match[2]?Math.min(size-1,Number(match[2])):size-1;if(start>end||start>=size){res.writeHead(416,{'Content-Range':`bytes */${size}`}).end();return;}status=206;headers['Content-Range']=`bytes ${start}-${end}/${size}`;}
 headers['Content-Length']=end-start+1;res.writeHead(status,headers);if(req.method==='HEAD')res.end();else fs.createReadStream(file,{start,end}).pipe(res);
 }catch{res.writeHead(404).end();}
}).listen(5570,'127.0.0.1',()=>console.log('Player production checks: http://127.0.0.1:5570/one-g/'));
