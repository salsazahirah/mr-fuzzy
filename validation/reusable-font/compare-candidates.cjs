const fs = require('node:fs');
const path = require('node:path');
const [source, toolDir, outputDir] = process.argv.slice(2);
const subsetFont = require(path.join(toolDir, 'node_modules/subset-font'));
const fontverter = require(path.join(toolDir, 'node_modules/fontverter'));
const fontkit = require(path.join(toolDir, 'node_modules/fontkit'));

(async () => {
  const input = fs.readFileSync(source);
  const before = fontkit.create(await fontverter.convert(input, 'sfnt'));
  const characters = Array.from({length: 95}, (_, i) => String.fromCodePoint(i + 32)).join('') + '\u00a0\u2013\u2014\u2018\u2019\u201c\u201d\u2022\u2026\u20ac';
  const candidates = [
    ['all-axes', {}],
    ['upright', {slnt: 0}],
    ['square', {ROND: 0}],
    ['upright-square', {slnt: 0, ROND: 0}],
  ];
  for (const [name, variationAxes] of candidates) {
    const result = await subsetFont(input, characters, {
      targetFormat: 'woff2', glyphNames: true,
      preserveNameIds: [0, 7, 8, 9, 11, 13, 14], variationAxes,
    });
    const after = fontkit.create(await fontverter.convert(result, 'sfnt'));
    const outputPath = path.join(outputDir, `${name}.woff2`);
    fs.writeFileSync(outputPath, result);
    const report = {name, bytes: result.length, pinnedAxes: variationAxes, variableAxes: after.variationAxes,
      missingCharacters: [...characters].filter(c => !after.hasGlyphForCodePoint(c.codePointAt(0))), originalAxes: before.variationAxes};
    fs.writeFileSync(`${outputPath}.json`, JSON.stringify(report, null, 2));
    console.log(JSON.stringify({name, bytes: result.length, pinnedAxes: variationAxes, axes: Object.keys(after.variationAxes), missingCharacters: report.missingCharacters}));
  }
})().catch(error => {console.error(error); process.exitCode = 1;});
