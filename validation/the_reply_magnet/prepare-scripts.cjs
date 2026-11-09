const fs = require('node:fs');
const path = require('node:path');
const source = path.resolve(__dirname, '../the_broccoli_strike');
const reference = fs.readFileSync(path.resolve(__dirname, '../../the_reply_magnet/300x600/index.html'), 'utf8');
const promptBlue = reference.match(/\.to\("#typedBlue", \{ text: "([^"]*)"/)[1];
const promptWhite = reference.match(/\.to\("#typedWhite", \{ text: "([^"]*)"/)[1];
let build = fs.readFileSync(path.join(source, 'build-banners.cjs'), 'utf8');
build = build.replace("['>BERKESAN<', '>ISTIMEWA<']", "['<span class=\"line-white\">BERKESAN</span>', '']");
for (const [from,to] of [
  ['the_broccoli_strike','the_reply_magnet'],
  ['The Broccoli Strike','The Reply Magnet'],
  ['Menu biasa, jadi istimewa','Bikin wacana terlaksana'],
  ['MENU BIASA','BIKIN WACANA'], ['JADI ISTIMEWA','TERLAKSANA'],
  ['>MENU<','>BIKIN<'], ['>BIASA<','>WACANA<'], ['>JADI<','>TERLAKSANA<'],
  ['Kasih ide menu mengolah brokoli ',promptBlue], ['yang disukai anak',promptWhite],
  ['Ide menu brokoli untuk anak dalam kotak bekal','Meme kucing berkacamata dengan ajakan bermain bola dan makan gorengan'],
]) build = build.replaceAll(from,to);
// "kucing" is valid Reply Magnet copy, unlike the birthday-specific words.
build = build.replace('|kucing|spreadsheet','|spreadsheet');
build = build.replace('  // Stop the cursor', `  // Keep TERLAKSANA whole in the three-line portrait headline.
  if (size === '160x600') html = html.replace('top: 110px;', 'top: 139px;').replace('font-size: 40px;', 'font-size: 34px;');
  if (size === '300x1050') html = html.replace('top: 190px;', 'top: 238px;').replace('font-size: 72px;', 'font-size: 64px;');
  // Stop the cursor`);
build = build.replace('</main></body></html>`;', `</main><script>
function fitPreviews(){document.querySelectorAll('.preview').forEach(box=>{const frame=box.querySelector('iframe');const w=Number(frame.width),h=Number(frame.height);const card=box.parentElement;const style=getComputedStyle(card);const available=card.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight);const scale=Math.min(1,available/w,580/h);box.style.width=(w*scale)+'px';box.style.height=(h*scale)+'px';frame.style.transform='scale('+scale+')';});}
new ResizeObserver(fitPreviews).observe(document.querySelector('.grid'));fitPreviews();
</script></body></html>\x60;`);
fs.writeFileSync(path.join(__dirname,'build-banners.cjs'),build);
// Keep selective rechecks available when one layout needs adjustment.
const check = fs.readFileSync(path.resolve(__dirname,'../the_lunchbox_universe/check-banners.cjs'),'utf8')
  .replaceAll('the_lunchbox_universe','the_reply_magnet')
  .replaceAll('lunchbox-qa-chrome-','reply-qa-chrome-');
fs.writeFileSync(path.join(__dirname,'check-banners.cjs'),check);
const pack = fs.readFileSync(path.join(source,'package-banners.ps1'),'utf8').replaceAll('the_broccoli_strike','the_reply_magnet');
fs.writeFileSync(path.join(__dirname,'package-banners.ps1'),pack);
console.log('Prepared Reply Magnet generation, browser checks, and packaging scripts.');
