const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const sizes = ['120x20', '160x600', '168x28', '216x36', '300x50', '300x250', '300x1050', '320x50', '728x90', '970x90', '970x250', '1080x1920'];
const campaign = path.join(root, 'the_lunchbox_universe');
const reference = path.join(campaign, '300x600');
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const referenceFiles = fs.readdirSync(reference, {recursive:true}).filter(f => fs.statSync(path.join(reference,f)).isFile());
const baseline = Object.fromEntries(referenceFiles.map(f => [f, hash(path.join(reference,f))]));
// Refuse to overwrite an existing creative.
for (const size of sizes) if (size !== "970x90" && fs.existsSync(path.join(campaign, size))) throw new Error(`Already exists: ${size}`);
const previous970 = path.join(campaign, "970x90");
const backup970 = path.join(__dirname, "original-970x90");
if (fs.existsSync(backup970)) throw new Error("Previous 970x90 backup already exists");
if (fs.existsSync(previous970)) fs.cpSync(previous970, backup970, { recursive: true });

for (const size of sizes) {
  const source = path.join(root, 'the_forgotten_birthday', size);
  const target = path.join(campaign, size);
  fs.cpSync(source, target, {recursive:true});
  for (const dir of ['assets', 'js']) {
    for (const file of fs.readdirSync(path.join(target, dir))) {
      const replacement = path.join(reference, dir, file);
      if (!fs.existsSync(replacement)) throw new Error(`Missing campaign asset: ${replacement}`);
      fs.copyFileSync(replacement, path.join(target, dir, file));
    }
  }
  const file = path.join(target, 'index.html');
  let html = fs.readFileSync(file, 'utf8');
  const replacements = [
    ['The Forgotten Birthday', 'The Lunchbox Universe'],
    ['Meski dadakan, tetap berkesan', 'Eksplor kreasi, langsung eksekusi'],
    ['MESKI DADAKAN', 'EKSPLOR KREASI'], ['TETAP BERKESAN', 'LANGSUNG EKSEKUSI'],
    ['>MESKI<', '>EKSPLOR<'], ['>DADAKAN<', '>KREASI<'],
    ['>TETAP<', '>LANGSUNG<'], ['>BERKESAN<', '>EKSEKUSI<'],
    ['Bikin kartu ulang tahun lucu buat bos, ', 'Visualisasikan 3 ide bekal '],
    ['pakai kucing kacamata lagi cek sheet', 'nugget brokoli bertema dinosaurus'],
    ['Kartu ulang tahun untuk bos dengan kucing berkacamata sedang mengecek spreadsheet', 'Tiga ide bekal nugget brokoli bertema dinosaurus'],
    ['animation: blink 0.8s infinite;', 'animation: blink 0.8s 36;'],
    ['repeat: -1,', `repeat: ${html.includes('TextPlugin.min.js') ? 4 : 7},`],
  ];
  for (const [from,to] of replacements) html = html.replaceAll(from,to);
  // Leave separation between the longer Lunchbox headline and the prompt card.
  if (size === '970x250') html = html.replace('font-size: 56px;', 'font-size: 52px;');
  // Stop the cursor when the finite timeline reaches its final frame.
  if (html.includes('TextPlugin.min.js')) {
    html = html.replace('repeatDelay: 2.5', 'repeatDelay: 2.5,\n                onComplete: () => gsap.set(".cursor", { animation: "none", opacity: 0 })');
  }
  if (size === '300x250') {
    html = html.replace('<div class="link"></div>', '<a class="link" href="https://gemini.google/id/students/?hl=id" target="_blank" rel="noopener noreferrer" aria-label="Coba Google Gemini"></a>');
    html = html.replace('document.querySelector(".link").addEventListener("click", () => {\n            ExitApi.exit();\n        });', 'document.querySelector(".link").addEventListener("click", (event) => {\n            if (window.ExitApi && typeof window.ExitApi.exit === "function") {\n                event.preventDefault();\n                window.ExitApi.exit();\n            }\n        });');
  }
  if (/forgotten|birthday|dadakan|berkesan|ulang tahun|kucing|spreadsheet/i.test(html)) throw new Error(`Old campaign copy in ${size}`);
  for (const script of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) new vm.Script(script[1], {filename:file});
  fs.writeFileSync(file, html);
}

const cards = sizes.map(size => {
  const [w,h] = size.split('x').map(Number);
  const scale = Math.min(1, 320/w, 580/h);
  return `<article><h2>${size}</h2><div class="preview" style="width:${w*scale}px;height:${h*scale}px"><iframe title="The Lunchbox Universe ${size}" src="${size}/index.html" width="${w}" height="${h}" style="transform:scale(${scale})" loading="lazy"></iframe></div><a href="${size}/index.html" target="_blank" rel="noopener">Buka ukuran asli ↗</a></article>`;
}).join('\n');
const gallery = `<!doctype html>
<html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>The Lunchbox Universe — Preview Banner</title><style>
*{box-sizing:border-box}body{margin:0;background:#111216;color:#f5f6fa;font:15px/1.5 system-ui,sans-serif}main{max-width:1160px;margin:auto;padding:40px 24px 64px}h1{font-size:32px;line-height:1.15;margin:0 0 8px}header p{margin:0 0 30px;color:#aeb6c7}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;align-items:start}article{min-width:0;padding:18px;background:#1c1f26;border:1px solid #343945;border-radius:14px}h2{font-size:16px;margin:0 0 16px}.preview{max-width:100%;position:relative;margin:0 auto 20px}iframe{display:block;border:0;transform-origin:top left;position:absolute;left:0;top:0}a{color:#8ab4f8;text-decoration:none}a:hover{text-decoration:underline}footer{margin-top:30px;color:#aeb6c7}@media(max-width:400px){main{padding:24px 12px}.grid{grid-template-columns:1fr}article{padding:10px}}
</style></head><body><main><header><h1>The Lunchbox Universe</h1><p>EKSPLOR KREASI · LANGSUNG EKSEKUSI — 12 ukuran banner</p></header><section class="grid">${cards}</section><footer><a href="300x600/index.html" target="_blank" rel="noopener">Lihat banner referensi 300×600 ↗</a></footer></main><script>
function fitPreviews(){document.querySelectorAll('.preview').forEach(box=>{const frame=box.querySelector('iframe');const w=Number(frame.width),h=Number(frame.height);const card=box.parentElement;const style=getComputedStyle(card);const available=card.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight);const scale=Math.min(1,available/w,580/h);box.style.width=(w*scale)+'px';box.style.height=(h*scale)+'px';frame.style.transform='scale('+scale+')';});}
new ResizeObserver(fitPreviews).observe(document.querySelector('.grid'));fitPreviews();
</script></body></html>`;
fs.writeFileSync(path.join(campaign, 'index.html'),gallery);
for (const [file, expected] of Object.entries(baseline)) if (hash(path.join(reference,file)) !== expected) throw new Error('Reference changed');
fs.writeFileSync(path.join(__dirname,'reference-hashes.json'), JSON.stringify(baseline,null,2));
fs.writeFileSync(path.join(__dirname,'sizes.json'), JSON.stringify(sizes,null,2));
console.log(`Created ${sizes.length} banners and preview gallery; reference preserved.`);
