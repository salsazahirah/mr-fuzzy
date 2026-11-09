const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const {spawn} = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const campaign = process.argv.find(arg=>arg.startsWith('--campaign='))?.slice(11) || 'the_reply_magnet';
assert(['the_reply_magnet','the_broccoli_strike','the_forgotten_birthday','the_lunchbox_universe'].includes(campaign),'Unknown campaign');
const output = path.join(root, 'validation', campaign);
const manifestPath = path.join(root, 'validation', 'campaign-flexbox-source-manifest.json');
if (campaign !== 'the_reply_magnet') {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')).filter(entry => entry.campaign === campaign);
  assert.equal(manifest.length,13,'Source manifest must cover all banner sizes');
  const hash = value => createHash('sha256').update(value).digest('hex');
  for (const entry of manifest) {
    const html = fs.readFileSync(path.join(root,campaign,entry.size,'index.html'),'utf8');
    const scripts = [...html.matchAll(/<script\b[^>]*>[\s\S]*?<\/script>/g)].map(match=>match[0]);
    assert.equal(hash(scripts.join('\n')),entry.scriptsSha256,`${campaign}/${entry.size}: scripts changed`);
    for (const asset of entry.assets) assert.equal(hash(fs.readFileSync(path.join(root,asset.path))),asset.sha256,`Changed asset: ${asset.path}`);
  }
}
const sizes = fs.readdirSync(path.join(root, 'the_reply_magnet'))
  .filter(size => /^\d+x\d+$/.test(size))
  .sort((a, b) => a.localeCompare(b, undefined, {numeric: true}));
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
  const base = `http://127.0.0.1:${server.address().port}/${campaign}/`;
  const profile = fs.mkdtempSync(path.join(os.tmpdir(),'reply-qa-chrome-'));
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
    fs.mkdirSync(path.join(output,'screenshots'),{recursive:true});
    const report=[];
    for(const size of requestedSize ? [requestedSize] : sizes){
      // The original 300x600 retains its existing delayed, continuous loop.
      const legacyAnimation = size === '300x600';
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
      if (timeline.repeat >= 0) assert(timeline.totalDuration<30,`${size}: animation exceeds 30 seconds`);
      const phases=[];
      for(const time of [2.25,legacyAnimation ? 3.2 : timeline.repeat < 0 ? timeline.duration : timeline.totalDuration]){
        const phase=await evaluate(`(()=>{
          qaTimeline.totalTime(${time},false);
          const ad=document.querySelector('.ads-container').getBoundingClientRect();
          const rect=r=>({x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom});
          const overflow=[];
          const layout=[];
          for(const el of document.querySelectorAll('.logo,#mainTitle,.prompt-box,.image-card,.content-stage,.brand-block')){
            const style=getComputedStyle(el);
            const r=el.getBoundingClientRect();
            layout.push({element:el.className,position:style.position,rect:rect(r)});
            if(style.visibility!=='hidden'&&style.opacity!=='0'&&(r.left<ad.left-1||r.right>ad.right+1||r.top<ad.top-1||r.bottom>ad.bottom+1))overflow.push({element:el.className,rect:rect(r)});
          }
          const absolute=[...document.querySelectorAll('.ads-container *')]
            .filter(el=>getComputedStyle(el).position==='absolute')
            .map(el=>({element:el.className,allowed:el.matches('.link,.prompt-text-container')||el.matches('.content-stage > .image-card')}));
          const link=document.querySelector('.link').getBoundingClientRect();
          const flex=getComputedStyle(document.querySelector('.ads-container')).display;
          for(const el of document.querySelectorAll('#mainTitle span,.prompt-text-container')){
            if(getComputedStyle(el).visibility==='hidden'||getComputedStyle(el).opacity==='0')continue;
            const range=document.createRange();range.selectNodeContents(el);const r=range.getBoundingClientRect();
            if(r.left<ad.left-1||r.right>ad.right+1||r.top<ad.top-1||r.bottom>ad.bottom+1)overflow.push({element:el.className,rect:rect(r)});
            if(el.classList.contains('prompt-text-container')){
              const box=document.querySelector('.prompt-box').getBoundingClientRect();
              if(r.bottom>box.bottom+1)overflow.push({element:'prompt exceeds box',rect:rect(r),box:rect(box)});
            }
          }
          return {time:${time},ad:rect(ad),flex,layout,absolute,link:rect(link),overflow,title:document.querySelector('#mainTitle').innerText,images:[...document.images].map(i=>({src:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0})),prompt:document.querySelector('.prompt-text-container')?.innerText||null};
        })()`);
        assert.equal(phase.ad.width,width);assert.equal(phase.ad.height,height);
        assert.equal(phase.flex,'flex',`${size}: main layout must use flexbox`);
        assert(phase.absolute.every(el=>el.allowed),`${size}: absolute positioning outside an overlay`);
        // Absolute inset starts inside the banner's 1px border.
        for (const edge of ['x','y','right','bottom']) {
          assert(Math.abs(phase.link[edge]-phase.ad[edge])<=1,`${size}: click overlay must cover the banner`);
        }
        assert.deepEqual(phase.overflow,[],`${size}: content overflow`);
        assert(phase.images.every(i=>i.loaded),`${size}: broken image`);
        phases.push(phase);
      }
      const screenshot=await call('Page.captureScreenshot',{format:'png',clip:{x:0,y:0,width,height,scale:1}});
      fs.writeFileSync(path.join(output,'screenshots',size+'.png'),Buffer.from(screenshot.data,'base64'));
      const click=await evaluate(`(()=>{let count=0;window.ExitApi={exit(){count++;}};document.querySelector('.link').click();return count;})()`);
      assert.equal(click,1,`${size}: Exit API click failed`);
      await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
      await navigate(base+size+'/index.html');
      const reduced=await evaluate(`(()=>({timelines:gsap.globalTimeline.getChildren(false,false,true).length,titleOpacity:getComputedStyle(document.querySelector('#mainTitle')).opacity,bodyWidth:document.body.scrollWidth,bodyHeight:document.body.scrollHeight}))()`);
      if (!legacyAnimation) {
        assert.equal(reduced.timelines,0);assert.equal(reduced.titleOpacity,'1');
      }
      assert.equal(reduced.bodyWidth,width);assert.equal(reduced.bodyHeight,height);
      report.push({size,timeline,phases,exitClick:true,reducedMotion:{...reduced,supported:!legacyAnimation}});
      console.log(`${size}: flexbox, overlays, assets, dimensions, content bounds, animation, click PASS${legacyAnimation ? ' (original loop retained)' : ', reduced motion PASS'}`);
    }
    const previews=[];
    for (const width of [390,1280]) {
      await call('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
      await navigate(base+'index.html');
      await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
      const preview=await evaluate(`(()=>({
        viewport:innerWidth,width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,
        frames:[...document.querySelectorAll('.preview')].map(box=>{
          const frame=box.querySelector('iframe');const r=frame.getBoundingClientRect();const b=box.getBoundingClientRect();
          return {title:frame.title,position:getComputedStyle(frame).position,fits:Math.abs(r.width-b.width)<1&&Math.abs(r.height-b.height)<1};
        })
      }))()`);
      assert.equal(preview.scrollWidth,preview.width,'Preview gallery must fit the viewport');
      assert(preview.frames.every(frame=>frame.position==='static'&&frame.fits),'Preview iframe must fit its flex container');
      previews.push(preview);
    }
    assert.deepEqual(exceptions,[],'Browser JavaScript exceptions');
    assert.deepEqual(missing.filter(p=>p!=='/favicon.ico'),[],'Missing local assets');
    const reportPath=path.join(output,'browser-report.json');
    const banners=requestedSize&&fs.existsSync(reportPath)
      ? JSON.parse(fs.readFileSync(reportPath,'utf8')).banners.map(b=>b.size===requestedSize?report[0]:b)
      : report;
    fs.writeFileSync(reportPath,JSON.stringify({banners,previews,exceptions,missingLocalAssets:missing.filter(p=>p!=='/favicon.ico')},null,2));
    await send('Browser.close').catch(()=>{});
  }finally{
    if(socket)socket.close();for(const request of pending.values())clearTimeout(request.timer);
    if(browser.exitCode===null)browser.kill();
    await new Promise(resolve=>server.close(resolve));
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
