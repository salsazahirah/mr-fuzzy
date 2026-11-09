const fs = require('node:fs');
const path = require('node:path');
const source = path.resolve(__dirname, '../the_broccoli_strike');
let build = fs.readFileSync(path.join(source, 'build-banners.cjs'), 'utf8');
for (const [from, to] of [
  ['the_broccoli_strike', 'the_lunchbox_universe'],
  ['The Broccoli Strike', 'The Lunchbox Universe'],
  ['Menu biasa, jadi istimewa', 'Eksplor kreasi, langsung eksekusi'],
  ['MENU BIASA', 'EKSPLOR KREASI'],
  ['JADI ISTIMEWA', 'LANGSUNG EKSEKUSI'],
  ['>MENU<', '>EKSPLOR<'], ['>BIASA<', '>KREASI<'],
  ['>JADI<', '>LANGSUNG<'], ['>ISTIMEWA<', '>EKSEKUSI<'],
  ['Kasih ide menu mengolah brokoli ', 'Visualisasikan 3 ide bekal '],
  ['yang disukai anak', 'nugget brokoli bertema dinosaurus'],
  ['Ide menu brokoli untuk anak dalam kotak bekal', 'Tiga ide bekal nugget brokoli bertema dinosaurus'],
]) build = build.replaceAll(from, to);
build = build.replace(
  'for (const size of sizes) if (fs.existsSync(path.join(campaign, size))) throw new Error(`Already exists: ${size}`);',
  'for (const size of sizes) if (size !== "970x90" && fs.existsSync(path.join(campaign, size))) throw new Error(`Already exists: ${size}`);\n' +
  'const previous970 = path.join(campaign, "970x90");\n' +
  'const backup970 = path.join(__dirname, "original-970x90");\n' +
  'if (fs.existsSync(backup970)) throw new Error("Previous 970x90 backup already exists");\n' +
  'if (fs.existsSync(previous970)) fs.cpSync(previous970, backup970, { recursive: true });'
);
// Improve the preview's fit on narrow screens while retaining exact iframe dimensions.
build = build.replace('</main></body></html>`;', `</main><script>
function fitPreviews(){document.querySelectorAll('.preview').forEach(box=>{const frame=box.querySelector('iframe');const w=Number(frame.width),h=Number(frame.height);const card=box.parentElement;const style=getComputedStyle(card);const available=card.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight);const scale=Math.min(1,available/w,580/h);box.style.width=(w*scale)+'px';box.style.height=(h*scale)+'px';frame.style.transform='scale('+scale+')';});}
new ResizeObserver(fitPreviews).observe(document.querySelector('.grid'));fitPreviews();
</script></body></html>\x60;`);
fs.writeFileSync(path.join(__dirname, 'build-banners.cjs'), build);
const check = fs.readFileSync(path.join(source, 'check-banners.cjs'), 'utf8')
  .replaceAll('the_broccoli_strike', 'the_lunchbox_universe')
  .replaceAll('broccoli-qa-chrome-', 'lunchbox-qa-chrome-');
fs.writeFileSync(path.join(__dirname, 'check-banners.cjs'), check);
const pack = fs.readFileSync(path.join(source, 'package-banners.ps1'), 'utf8').replaceAll('the_broccoli_strike', 'the_lunchbox_universe');
fs.writeFileSync(path.join(__dirname, 'package-banners.ps1'), pack);
console.log('Prepared Lunchbox Universe build, browser checks, and packaging scripts.');
