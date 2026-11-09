const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');

const root = path.resolve(__dirname, '..');
const campaigns = ['the_broccoli_strike', 'the_forgotten_birthday', 'the_lunchbox_universe'];
const reference = path.join(root, 'the_reply_magnet');
const sizes = fs.readdirSync(reference).filter(size => /^\d+x\d+$/.test(size));
const hash = value => createHash('sha256').update(value).digest('hex');
const read = file => fs.readFileSync(file, 'utf8');
const stylePattern = /<style>[\s\S]*?<\/style>/;
const titlePattern = /<div class="main-title"[^>]*>[\s\S]*?<\/div>/;
const scripts = html => [...html.matchAll(/<script\b[^>]*>[\s\S]*?<\/script>/g)].map(match => match[0]);
const cssRule = (html, selector) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const rule = html.match(new RegExp(escaped + '\\s*\\{[^}]*\\}'));
  assert(rule, `Missing CSS rule: ${selector}`);
  return rule[0];
};
const replaceMatch = (html, pattern, original) => {
  const match = original.match(pattern);
  assert(match && pattern.test(html), `Missing matching content: ${pattern}`);
  return html.replace(pattern, () => match[0]);
};
const assets = directory => fs.readdirSync(directory, {withFileTypes: true}).flatMap(entry => {
  const file = path.join(directory, entry.name);
  return entry.isDirectory() ? assets(file) : entry.name === 'index.html' ? [] : [{
    path: path.relative(root, file).replaceAll('\\', '/'),
    sha256: hash(fs.readFileSync(file)),
  }];
});

// Read and validate every source before writing any banner.
const changes = [];
const manifest = [];
for (const campaign of campaigns) {
  for (const size of sizes) {
    const directory = path.join(root, campaign, size);
    const file = path.join(directory, 'index.html');
    const original = read(file);
    const base = read(path.join(reference, size, 'index.html'));
    let style = base.match(stylePattern)[0];
    // Campaign copy has different lengths; retain its existing typography.
    const titleRule = cssRule(original, '.main-title');
    const fontSize = campaign === 'the_lunchbox_universe' && size === '300x600'
      ? 'font-size: 40px;' : titleRule.match(/font-size:\s*[^;]+;/)[0];
    const gap = titleRule.match(/\bgap:\s*[^;]+;/)?.[0];
    const baseTitle = cssRule(style, '.main-title');
    let nextTitle = baseTitle.replace(/font-size:\s*[^;]+;/, fontSize);
    if (size === '300x600') nextTitle = nextTitle.replace(/\{/, '{\n            width: 266px;\n            white-space: nowrap;');
    if (gap) nextTitle = nextTitle.replace(/\bgap:\s*[^;]+;/, gap);
    style = style.replace(baseTitle, () => nextTitle);
    if (size === '970x90' || size === '728x90') {
      const container = cssRule(style, '.ads-container');
      style = style.replace(container, () => container.replace(/\{/, `{\n            gap: ${size === '970x90' ? 24 : 12}px;`));
    }
    if (original.includes('class="prompt-text-container"')) {
      style = style.replace(cssRule(style, '.prompt-text-container'), () => cssRule(original, '.prompt-text-container'));
      if (campaign === 'the_forgotten_birthday') {
        const cursor = cssRule(style, '.cursor');
        style = style.replace(cursor, () => cursor.replace(/animation:\s*blink[^;]+;/, 'animation: blink 0.8s infinite;'));
      }
    }

    let markup = base.match(/<body>([\s\S]*?)(?=<script>)/)[1];
    markup = replaceMatch(markup, titlePattern, original);
    markup = markup.replace(/^([ \t]*)(<div class="main-title"[^>]*>)([\s\S]*?)<\/div>/m,
      (_, indent, opening, content) => indent + opening + '\n' + content.trim().split(/\r?\n/)
        .map(line => indent + '    ' + line.trim()).join('\n') + '\n' + indent + '</div>');
    markup = replaceMatch(markup, /<div class="ads-container"[^>]*>/, original);
    for (const asset of ['gemini-logo', 'prompt-box', 'result-img']) {
      const image = new RegExp('<img\\b[^>]*src="assets/' + asset + '\\.png"[^>]*>');
      if (image.test(original)) markup = replaceMatch(markup, image, original);
    }
    for (const id of ['typedBlue', 'typedWhite']) {
      const span = new RegExp('<span\\b[^>]*id="' + id + '"[^>]*>[\\s\\S]*?<\\/span>');
      if (span.test(original)) markup = replaceMatch(markup, span, original);
    }
    markup = replaceMatch(markup, /<(?:a|div) class="link"[^>]*>[\s\S]*?<\/(?:a|div)>/, original);
    let next = original.replace(stylePattern, () => style)
      .replace(/<body>[\s\S]*?(?=<script>)/, () => '<body>' + markup);
    if (!next.includes('name="ad.size"')) {
      const [width, height] = size.split('x');
      next = next.replace(/(<meta name="ad.orientation"[^>]*>)/, `$1\n    <meta name="ad.size" content="width=${width},height=${height}">`);
    }
    assert.deepEqual(scripts(next), scripts(original), `${campaign}/${size}: scripts changed`);
    const copy = html => html.match(titlePattern)[0].replace(/\s+/g, ' ');
    assert.equal(copy(next), copy(original), `${campaign}/${size}: title changed`);
    changes.push({file, next});
    manifest.push({campaign, size, reference: `the_reply_magnet/${size}/index.html`,
      originalHtmlSha256: hash(original), scriptsSha256: hash(scripts(original).join('\n')), assets: assets(directory)});
  }
  const gallery = path.join(root, campaign, 'index.html');
  const baseGallery = read(path.join(reference, 'index.html'));
  const gallerySource = fs.existsSync(gallery) ? read(gallery) : baseGallery
    .replaceAll('The Reply Magnet', 'The Forgotten Birthday')
    .replaceAll('BIKIN WACANA · TERLAKSANA', 'MESKI DADAKAN · TETAP BERKESAN');
  changes.push({file: gallery, next: gallerySource.replace(stylePattern, () => baseGallery.match(stylePattern)[0])});
}
for (const {file, next} of changes) fs.writeFileSync(file, next);
const manifestPath = path.join(__dirname, 'campaign-flexbox-source-manifest.json');
if (!fs.existsSync(manifestPath)) fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`Updated ${manifest.length} banners and ${campaigns.length} preview galleries using the matching Reply Magnet sizes.`);
