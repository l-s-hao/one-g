# Existing Firefox + geckodriver; Python standard library only.
import urllib.request,urllib.error,json,time,base64,os
BASE=os.environ.get('ONE_G_TEST_URL','http://localhost:3000/one-g').rstrip('/')
OUT=os.environ.get('ONE_G_NAV_OUTPUT','/tmp/one-navigation-audit/firefox-dev');os.makedirs(OUT,exist_ok=True)
DRIVER=os.environ.get('ONE_G_WEBDRIVER','http://127.0.0.1:4444').rstrip('/')
report={'base':BASE,'checks':[],'entries':[],'failures':[]}
def req(path,data=None,method=None):
 r=urllib.request.Request(DRIVER+path,data=json.dumps(data).encode() if data is not None else None,headers={'Content-Type':'application/json'},method=method)
 try:v=json.load(urllib.request.urlopen(r,timeout=90))['value']
 except urllib.error.HTTPError as e:raise RuntimeError(e.read().decode())
 if isinstance(v,dict) and 'error' in v:raise RuntimeError(v)
 return v
session=req('/session',{'capabilities':{'alwaysMatch':{'browserName':'firefox','moz:firefoxOptions':{'args':['-headless'],'prefs':{'ui.primaryPointerCapabilities':6,'ui.allPointerCapabilities':6}}}}})
sid=session['sessionId'];root='/session/'+sid;report['browser']=session['capabilities']['browserVersion']
def call(p,data=None,method=None):return req(root+p,data,method)
def js(script,*args):return call('/execute/sync',{'script':script,'args':list(args)})
def wait(script,seconds=15):
 end=time.monotonic()+seconds
 while time.monotonic()<end:
  if js('return '+script):return
  time.sleep(.05)
 raise RuntimeError('Timed out: '+script)
def go(path='/'):
 call('/url',{'url':BASE+path});wait('!!document.querySelector("[data-theme-toggle]")');time.sleep(.15)
def find(css):return call('/element',{'using':'css selector','value':css})
def click(css):call('/element/'+find(css)['element-6066-11e4-a52e-4f735466cecf']+'/click',{})
def move(x,y):call('/actions',{'actions':[{'type':'pointer','id':'mouse','parameters':{'pointerType':'mouse'},'actions':[{'type':'pointerMove','duration':0,'x':int(x),'y':int(y),'origin':'viewport'}]}]})
def key(value):
 call('/actions',{'actions':[{'type':'key','id':'keyboard','actions':[{'type':'keyDown','value':value},{'type':'keyUp','value':value}]}]});call('/actions',method='DELETE')
def top(href):return '[data-navigation-item="'+href+'"] > a'
def hover(css):
 box=js('const r=document.querySelector(arguments[0]).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}',css);move(box['x'],box['y'])
def openmenu(i):
 move(20,80);time.sleep(.2);hover(top('/products' if i==0 else '/solutions'));wait('!document.querySelector("#desktop-nav-'+str(i)+'").hidden');time.sleep(.75)
def shot(name):
 b=call('/screenshot');open(OUT+'/'+name+'.png','wb').write(base64.b64decode(b))
def click_link(label,css):
 data=js('const e=document.querySelector(arguments[0]);return {tag:e.tagName,href:e.getAttribute("href")}',css);assert data['tag']=='A'
 click(css);wait('location.href===new URL('+json.dumps(data['href'])+',location.origin).href')
 report['entries'].append({'label':label,**data,'url':call('/url')})
def audit(label):
 v=js('return {width:innerWidth,height:innerHeight,nested:document.querySelectorAll("a button,button a").length,effects:document.querySelectorAll("header .specular-edge,header canvas").length,overflow:document.documentElement.scrollWidth>innerWidth,busy:document.documentElement.dataset.magicuiThemeVt||null,theme:document.documentElement.classList.contains("dark")?"dark":"light",locale:document.documentElement.lang}')
 assert v['nested']==0 and v['effects']==0 and not v['overflow'],v
 report['checks'].append({'label':label,**v})
try:
 call('/window/rect',{'width':1440,'height':1000});go('/');click_link('cold products',top('/products'))
 go('/');hover(top('/solutions'));click_link('opening solutions',top('/solutions'))
 openmenu(0);click_link('open products',top('/products'));openmenu(0);click(top('/products'));wait('document.querySelector("#desktop-nav-0").hidden')
 click_link('about',top('/about'));click_link('logo','header.site-header a')
 for i in [0,1]:
  openmenu(i);items=js('return [...document.querySelectorAll("#desktop-nav-'+str(i)+' [data-header-image-card]")].map(e=>({id:e.dataset.flipId,href:e.getAttribute("href")}))')
  assert len(items)==(9 if i==0 else 4)
  click_link('view all '+str(i),'#desktop-nav-'+str(i)+' a')
  for item in items:
   openmenu(i);click_link(item['id'],'#desktop-nav-'+str(i)+' [data-flip-id="'+item['id']+'"]')
 openmenu(0);click('[data-language-toggle]');click('#desktop-nav-0 button[aria-pressed]:nth-child(3)');time.sleep(.4)
 assert js('return document.querySelectorAll("#desktop-nav-0 [data-header-image-card]").length')==2
 click_link('English filtered image','#desktop-nav-0 [data-header-image-card]')
 # Physical pointer actions while theme transition is still active.
 go('/products/');click('[data-theme-toggle]');hover(top('/solutions'));click_link('theme in flight to solutions',top('/solutions'));time.sleep(.4)
 assert js('return document.documentElement.dataset.magicuiThemeVt||null') is None
 assert js('return localStorage.getItem("one-g-appearance-v1")')==js('return document.documentElement.classList.contains("dark")?"dark":"light"')
 # Native ctrl/new-tab and middle-click via W3C pointer/key actions.
 for middle in [False,True]:
  handles=call('/window/handles');hover(top('/products'))
  actions=[{'type':'pointerDown','button':1 if middle else 0},{'type':'pointerUp','button':1 if middle else 0}]
  if not middle:call('/actions',{'actions':[{'type':'key','id':'keyboard','actions':[{'type':'keyDown','value':'\ue009'}]}]})
  call('/actions',{'actions':[{'type':'pointer','id':'mouse','parameters':{'pointerType':'mouse'},'actions':actions}]});call('/actions',method='DELETE')
  end=time.monotonic()+8
  while time.monotonic()<end:
   after=call('/window/handles')
   if len(after)>len(handles):break
   time.sleep(.1)
  assert len(after)>len(handles),'native new tab'
  new=next(h for h in after if h not in handles);call('/window',{'handle':new});wait('location.pathname.endsWith("/products/")');call('/window',method='DELETE');call('/window',{'handle':handles[0]})
 # Keyboard preview and Escape without focus-triggered reopen.
 key('\ue004');js('document.querySelector(arguments[0]).focus()',top('/products'));wait('!document.querySelector("#desktop-nav-0").hidden');key('\ue00c');time.sleep(.35);assert js('return document.querySelector("#desktop-nav-0").hidden')
 key('\ue007');wait('location.pathname.endsWith("/products/")')
 js('document.querySelector(arguments[0]).focus()',top('/solutions'));wait('!document.querySelector("#desktop-nav-1").hidden');key('\ue004');assert js('return document.querySelector("#desktop-nav-1").contains(document.activeElement)');key('\ue007');wait('location.pathname.endsWith("/solutions/")')
 for width in [390,768,1440,1920]:
  call('/window/rect',{'width':width,'height':1000});go('/products/')
  for locale in ['zh-CN','en']:
   if js('return document.documentElement.lang')!=locale:click('[data-language-toggle]')
   for theme in ['light','dark']:
    if js('return document.documentElement.classList.contains("dark")?"dark":"light"')!=theme:click('[data-theme-toggle]');time.sleep(.5)
    if js('return innerWidth')>=1024:openmenu(0)
    else:
     click('button[aria-controls="mobile-navigation"]');click('#mobile-navigation button[aria-controls="mobile-nav-0"]');wait('!document.querySelector("#mobile-nav-0").hidden');time.sleep(.6)
    audit(str(width)+' '+locale+' '+theme);shot(str(width)+'-'+locale+'-'+theme);key('\ue00c');time.sleep(.3)
 # Mobile one click on text, preview independent.
 call('/window/rect',{'width':390,'height':900});go('/');click('button[aria-controls="mobile-navigation"]');click_link('mobile text products','#mobile-navigation a[href$="/products/"]')
 click('button[aria-controls="mobile-navigation"]');click('#mobile-navigation button[aria-controls="mobile-nav-1"]');time.sleep(.7);click_link('mobile SONIC solution','#mobile-nav-1 a[href*="teleoperation"]')
 call('/back',{});call('/forward',{});call('/refresh',{});wait('!!document.querySelector("[data-theme-toggle]")');audit('history refresh')
 report['status']='PASS';print(json.dumps(report),flush=True)
except Exception as e:
 report['failures'].append(str(e));report['status']='FAIL';shot('failure');raise
finally:
 open(OUT+'/results.json','w').write(json.dumps(report,indent=2));call('',method='DELETE')
