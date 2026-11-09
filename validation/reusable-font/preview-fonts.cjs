const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const {spawn} = require('node:child_process');
const [original, compact, upright, outputDir] = process.argv.slice(2);

(async () => {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'font-preview-chrome-'));
  const browser = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
    '--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`,
    '--no-first-run', '--no-default-browser-check', '--disable-background-networking', 'about:blank',
  ], {windowsHide: true, stdio: ['ignore', 'ignore', 'pipe']});
  let socket;
  try {
    const url = await new Promise((resolve, reject) => {
      let stderr = '';
      const timeout = setTimeout(() => reject(new Error('Chrome startup timed out')), 30000);
      browser.on('error', reject);
      browser.on('exit', code => {clearTimeout(timeout); reject(new Error(`Chrome exited: ${code}; ${stderr.slice(-1000)}`));});
      browser.stderr.on('data', data => {
        stderr += data;
        const match = stderr.match(/DevTools listening on (ws:\/\/\S+)/);
        if (match) {clearTimeout(timeout); resolve(match[1]);}
      });
    });
    socket = new WebSocket(url);
    await new Promise((resolve, reject) => {socket.onopen = resolve; socket.onerror = reject;});
    let nextId = 0;
    const pending = new Map();
    socket.onmessage = event => {
      const message = JSON.parse(event.data);
      const request = pending.get(message.id);
      if (request) {pending.delete(message.id); message.error ? request.reject(message.error) : request.resolve(message.result);}
    };
    const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
      const id = ++nextId; pending.set(id, {resolve, reject});
      socket.send(JSON.stringify({id, method, params, ...(sessionId ? {sessionId} : {})}));
    });
    const {targetId} = await send('Target.createTarget', {url: 'about:blank'});
    const {sessionId} = await send('Target.attachToTarget', {targetId, flatten: true});
    const call = (method, params) => send(method, params, sessionId);
    await call('Page.enable');
    await call('Emulation.setDeviceMetricsOverride', {width: 1000, height: 680, deviceScaleFactor: 1, mobile: false});
    const fonts = [original, compact, upright].map((file, i) => ({name: `Test${i}`, base64: fs.readFileSync(file).toString('base64')}));
    const samples = [
      ['', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'], ['', 'abcdefghijklmnopqrstuvwxyz'], ['', '0123456789'],
      ['', Array.from({length: 95}, (_, i) => String.fromCodePoint(i + 32)).filter(c => !/[A-Za-z0-9]/.test(c)).join('')],
      ['', '\u2013 \u2014 \u2018 \u2019 \u201c \u201d \u2022 \u2026 \u20ac'],
      ['heading', 'MESKI DADAKAN TETAP BERKESAN'],
      ['small', 'Bikin kartu ulang tahun lucu buat bos, pakai kucing kacamata lagi cek sheet'],
      ['narrow', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789'],
      ['wide', 'Hamburgefonts 0123456789'],
    ];
    const setup = await call('Runtime.evaluate', {awaitPromise: true, returnByValue: true, expression: `(async () => {
      for (const data of ${JSON.stringify(fonts)}) {
        const bytes = Uint8Array.from(atob(data.base64), c => c.charCodeAt(0));
        const face = await new FontFace(data.name, bytes, {weight: '1 1000'}).load();
        document.fonts.add(face);
      }
      document.head.insertAdjacentHTML('beforeend', '<style>body{margin:0;padding:20px;background:white;color:black;font-family:Test0;font-size:26px}p{margin:0 0 8px;white-space:pre;line-height:1.5} .heading{font-size:36px;font-variation-settings:"opsz" 144,"wdth" 37,"wght" 700,"GRAD" 37,"ROND" 0,"slnt" 0}.small{font-size:13px;font-optical-sizing:auto}.narrow{font-variation-settings:"opsz" 72,"wdth" 25,"wght" 900,"GRAD" 100,"ROND" 0,"slnt" 0}.wide{font-variation-settings:"opsz" 24,"wdth" 151,"wght" 100,"GRAD" 0,"ROND" 0,"slnt" 0}</style>');
      for (const [className, text] of ${JSON.stringify(samples)}) {const p = document.createElement('p'); p.className = className; p.textContent = text; document.body.append(p);}
      await document.fonts.ready;
      return document.fonts.size;
    })()`});
    if (setup.exceptionDetails) throw new Error(JSON.stringify(setup.exceptionDetails));
    const measurements = [];
    for (let i = 0; i < fonts.length; i++) {
      const measured = await call('Runtime.evaluate', {awaitPromise: true, returnByValue: true, expression: `(async () => {
        document.body.style.fontFamily = 'Test${i}'; await document.fonts.ready;
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        return [...document.querySelectorAll('p')].map(p => {const r = document.createRange(); r.selectNodeContents(p); const rect = r.getBoundingClientRect(); return {text:p.textContent, width:rect.width, height:rect.height};});
      })()`});
      if (measured.exceptionDetails) throw new Error(JSON.stringify(measured.exceptionDetails));
      measurements.push({font: fonts[i].name, samples: measured.result.value});
      const screenshot = await call('Page.captureScreenshot', {format: 'png', clip: {x:0, y:0, width:1000, height:680, scale:1}});
      fs.writeFileSync(path.join(outputDir, `preview-${['original', 'compact', 'upright'][i]}.png`), Buffer.from(screenshot.data, 'base64'));
    }
    fs.writeFileSync(path.join(outputDir, 'browser-measurements.json'), JSON.stringify(measurements, null, 2));
    console.log(JSON.stringify(measurements.map(m => ({font:m.font, widths:m.samples.map(s => s.width)}))));
    await send('Browser.close');
  } finally {
    if (socket) socket.close();
    if (browser.exitCode === null) browser.kill();
  }
})().catch(error => {console.error(error); process.exitCode = 1;});
