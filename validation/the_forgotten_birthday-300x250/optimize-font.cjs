// Usage: node optimize-font.cjs <input.woff2> <output.woff2> <tool-directory>
// Dependencies installed separately: subset-font and fontkit.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const [input, output, toolDirectory] = process.argv.slice(2);
if (!input || !output || !toolDirectory) throw new Error('Expected input, output, and tool directory');
const subsetFont = require(path.join(toolDirectory, 'node_modules/subset-font'));
const fontkit = require(path.join(toolDirectory, 'node_modules/fontkit'));
const fontverter = require(path.join(toolDirectory, 'node_modules/fontverter'));
// Ignore floating point evaluation noise below one millionth of a font unit.
const normalized = value => JSON.stringify(value, (_, v) => typeof v === 'number' ? Math.round(v * 1e6) / 1e6 : v);

async function main() {
  const original = fs.readFileSync(input);
  const before = fontkit.create(await fontverter.convert(original, 'sfnt'));
  const copy = [
    'MESKI DADAKAN', 'TETAP BERKESAN',
    'Bikin kartu ulang tahun lucu buat bos, ',
    'pakai kucing kacamata lagi cek sheet',
  ];
  // This subset is specific to the visible copy in the 300x250 banner.
  const codePoints = [...new Set([...copy.join('')].map(c => c.codePointAt(0)))].sort((a, b) => a - b);
  const text = String.fromCodePoint(...codePoints);
  const result = await subsetFont(original, text, {
    targetFormat: 'woff2',
    preserveNameIds: [0, 7, 8, 9, 11, 13, 14],
    glyphNames: true,
  });
  assert(result.length < 450000, `Font exceeds the budget for a 600 KB banner: ${result.length} bytes`);
  const after = fontkit.create(await fontverter.convert(result, 'sfnt'));
  assert.deepEqual(after.variationAxes, before.variationAxes, 'Variable axes changed');
  for (const cp of codePoints) assert(after.hasGlyphForCodePoint(cp), `Missing U+${cp.toString(16)}`);

  const settings = [
    {},
    {opsz: 144, wdth: 37, wght: 700, GRAD: 37, ROND: 0, slnt: 0},
    {opsz: 13, wght: 400},
  ];
  // Verify retained outlines and advance widths at default, headline, and prompt settings.
  for (const axes of settings) {
    const a = before.getVariation(axes);
    const b = after.getVariation(axes);
    for (const cp of codePoints) {
      const ga = a.glyphForCodePoint(cp), gb = b.glyphForCodePoint(cp);
      assert(Math.abs(gb.advanceWidth - ga.advanceWidth) < 1e-6, `Advance changed: ${cp}`);
      assert.equal(normalized(gb.path.commands), normalized(ga.path.commands), `Outline changed: ${cp}`);
    }
  }
  for (const axes of settings) {
    const a = before.getVariation(axes), b = after.getVariation(axes);
    for (const line of copy) {
      assert.equal(normalized(b.layout(line).positions), normalized(a.layout(line).positions), 'Text positioning changed');
    }
  }
  fs.writeFileSync(output, result);
  const summary = {
    method: 'Banner copy subset; all variation axes and layout features retained',
    copy,
    inputBytes: original.length,
    outputBytes: result.length,
    reductionPercent: Number((100 * (1 - result.length / original.length)).toFixed(2)),
    retainedCodePoints: codePoints.map(cp => `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`),
    variationAxes: after.variationAxes,
    verified: {glyphCoverage: true, outlinesAndAdvances: true, bannerTextPositioning: true, settings},
    sha256: crypto.createHash('sha256').update(result).digest('hex'),
    dependencies: {
      'subset-font': require(path.join(toolDirectory, 'node_modules/subset-font/package.json')).version,
      fontkit: require(path.join(toolDirectory, 'node_modules/fontkit/package.json')).version,
    },
  };
  fs.writeFileSync(`${output}.json`, JSON.stringify(summary, null, 2) + '\n');
  console.log(JSON.stringify({inputBytes: original.length, outputBytes: result.length, reductionPercent: summary.reductionPercent, retainedCharacters: codePoints.length, axes: Object.keys(after.variationAxes), verified: summary.verified}, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
