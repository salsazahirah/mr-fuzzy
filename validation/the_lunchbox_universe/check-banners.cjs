const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const assert = require('node:assert/strict');
const {spawn} = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const sizes = JSON.parse(fs.readFileSync(path.join(__dirname,'sizes.json'),'utf8'));
const requestedSize = process.argv.find(arg=>arg.startsWith('--size='))?.slice(7);
if(requestedSize)assert(sizes.includes(requestedSize),'Unknown size');

(async () => {
  const missing = [];
  const server = http.createServer((request,response) => {
    const file = path.resolve(root, '.' + decodeURIComponent(new URL(request.url,'http://localhost').pathname));
    if (!file.startsWith(root + path.sep)) {response.writeHead(403).end();return;}
    const target = fs.existsSync(file) && fs.statSync(file).isDirectory() ? path.join(file,'index.html') : file;
    if (!fs.existsSync(target)) {missing.push(request.url);response.writeHead(404).end();return;}
    const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript','.png':'image/png','.woff2':'font/woff2'};
    response.setHeader('Content-Type',mime[path.extname(target)] || 'application/octet-stream');
    response.end(fs.readFileSync(target));
  });
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  const base = `http://127.0.0.1:${server.address().port}/the_lunchbox_universe/`;
  const profile = fs.mkdtempSync(path.join(os.tmpdir(),'lunchbox-qa-chrome-'));
  const browser = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
    '--headless=new','--remote-debugging-port=0',`--user-data-dir=${profile}`,
    '--no-first-run','--no-default-browser-check','--disable-background-networking','about:blank',
  ], {windowsHide:true,stdio:['ignore','ignore','pipe']});
  let socket;
  const pending = new Map();
  try {
    const debuggerUrl = await new Promise((resolve,reject) => {
      let stderr = '';
      const timeout = setTimeout(() => reject(new Error('Chrome startup timed out')),30000);
      browser.on('error',reject);
      browser.on('exit',code => {clearTimeout(timeout);reject(new Error(`Chrome exited ${code}: ${stderr.slice(-1000)}`));});
      browser.stderr.on('data',data => {stderr += data; const match = stderr.match(/DevTools listening on (ws:\/\/\S+)/); if(match){clearTimeout(timeout);resolve(match[1]);}});
    });
    socket = new WebSocket(debuggerUrl);
    await new Promise((resolve,reject) => {socket.onopen=resolve;socket.onerror=reject;});
    let nextId=0;
    const exceptions=[];
    const navigation=[];
    socket.onmessage=event => {
      const message=JSON.parse(event.data), request=pending.get(message.id);
      if(request){pending.delete(message.id);clearTimeout(request.timer);message.error?request.reject(message.error):request.resolve(message.result);}
      if(message.method==='Runtime.exceptionThrown')exceptions.push(message.params.exceptionDetails);
      if(message.method==='Page.loadEventFired')for(const resolve of navigation.splice(0))resolve();
    };
    socket.onclose=() => {for(const request of pending.values()){clearTimeout(request.timer);request.reject(new Error('Browser connection closed'));}pending.clear();};
    const send=(method,params={},sessionId) => new Promise((resolve,reject) => {
      const id=++nextId;
      const timer=setTimeout(() => {pending.delete(id);reject(new Error(`Timed out: ${method}`));},15000);
      pending.set(id,{resolve,reject,timer});
      socket.send(JSON.stringify({id,method,params,...(sessionId?{sessionId}:{})}));
    });
    const {targetId}=await send('Target.createTarget',{url:'about:blank'});
    const {sessionId}=await send('Target.attachToTarget',{targetId,flatten:true});
    const call=(method,params={}) => send(method,params,sessionId);
    await call('Page.enable');await call('Runtime.enable');await call('Network.enable');
    await call('Network.setBlockedURLs',{urls:['https://tpc.googlesyndication.com/*']});
    const evaluate=async expression => {
      const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
      if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));
      return r.result.value;
    };
    const navigate=async url => {
      const loaded=new Promise((resolve,reject) => {
        const timer=setTimeout(() => reject(new Error(`Load timed out: ${url}`)),15000);
        navigation.push(() => {clearTimeout(timer);resolve();});
      });
      await call('Page.navigate',{url});await loaded;
      await evaluate('(async()=>{await document.fonts.ready; await Promise.all([...document.images].map(i=>i.decode())); return true;})()');
    };
    fs.mkdirSync(path.join(__dirname,'screenshots'),{recursive:true});
    const report=[];
    for(const size of requestedSize ? [requestedSize] : sizes){
      const [width,height]=size.split('x').map(Number);
      await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
      await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
      await navigate(base+size+'/index.html');
      const timeline=await evaluate(`(()=>{
        const tl=gsap.globalTimeline.getChildren(false,false,true)[0];
        if(!tl)throw new Error('Animation timeline missing');
        tl.pause();window.qaTimeline=tl;
        return {duration:tl.duration(),totalDuration:tl.totalDuration(),repeat:tl.repeat()};
      })()`);
      assert(timeline.totalDuration<30,`${size}: animation exceeds 30 seconds`);
      const phases=[];
      for(const time of [2.25,timeline.totalDuration]){
        const phase=await evaluate(`(()=>{
          qaTimeline.totalTime(${time},false);
          const ad=document.querySelector('.ads-container').getBoundingClientRect();
          const rect=r=>({x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom});
          const overflow=[];
          for(const el of document.querySelectorAll('#mainTitle span,.prompt-text-container')){
            if(getComputedStyle(el).visibility==='hidden'||getComputedStyle(el).opacity==='0')continue;
            const range=document.createRange();range.selectNodeContents(el);const r=range.getBoundingClientRect();
            if(r.left<ad.left-1||r.right>ad.right+1||r.top<ad.top-1||r.bottom>ad.bottom+1)overflow.push({element:el.className,rect:rect(r)});
            if(el.classList.contains('prompt-text-container')){
              const box=document.querySelector('.prompt-box').getBoundingClientRect();
              if(r.bottom>box.bottom+1)overflow.push({element:'prompt exceeds box',rect:rect(r),box:rect(box)});
            }
          }
          return {time:${time},ad:rect(ad),overflow,title:document.querySelector('#mainTitle').innerText,images:[...document.images].map(i=>({src:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0})),prompt:document.querySelector('.prompt-text-container')?.innerText||null};
        })()`);
        assert.equal(phase.ad.width,width);assert.equal(phase.ad.height,height);
        assert.deepEqual(phase.overflow,[],`${size}: content overflow`);
        assert(phase.images.every(i=>i.loaded),`${size}: broken image`);
        phases.push(phase);
      }
      const screenshot=await call('Page.captureScreenshot',{format:'png',clip:{x:0,y:0,width,height,scale:1}});
      fs.writeFileSync(path.join(__dirname,'screenshots',size+'.png'),Buffer.from(screenshot.data,'base64'));
      const click=await evaluate(`(()=>{let count=0;window.ExitApi={exit(){count++;}};document.querySelector('.link').click();return count;})()`);
      assert.equal(click,1,`${size}: Exit API click failed`);
      await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
      await navigate(base+size+'/index.html');
      const reduced=await evaluate(`(()=>({timelines:gsap.globalTimeline.getChildren(false,false,true).length,titleOpacity:getComputedStyle(document.querySelector('#mainTitle')).opacity,bodyWidth:document.body.scrollWidth,bodyHeight:document.body.scrollHeight}))()`);
      assert.equal(reduced.timelines,0);assert.equal(reduced.titleOpacity,'1');
      report.push({size,timeline,phases,exitClick:true,reducedMotion:reduced});
      console.log(`${size}: assets, dimensions, text bounds, animation ${timeline.totalDuration}s, click, reduced motion PASS`);
    }
    assert.deepEqual(exceptions,[],'Browser JavaScript exceptions');
    assert.deepEqual(missing.filter(p=>p!=='/favicon.ico'),[],'Missing local assets');
    const reportPath=path.join(__dirname,'browser-report.json');
    const banners=requestedSize&&fs.existsSync(reportPath)
      ? JSON.parse(fs.readFileSync(reportPath,'utf8')).banners.map(b=>b.size===requestedSize?report[0]:b)
      : report;
    fs.writeFileSync(reportPath,JSON.stringify({banners,exceptions,missingLocalAssets:missing.filter(p=>p!=='/favicon.ico')},null,2));
    await send('Browser.close').catch(()=>{});
  }finally{
    if(socket)socket.close();for(const request of pending.values())clearTimeout(request.timer);
    if(browser.exitCode===null)browser.kill();
    await new Promise(resolve=>server.close(resolve));
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
