Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
public static class FontPreviewDiff {
    public static object Compare(string original, string optimized) {
        using (var a = new Bitmap(original))
        using (var b = new Bitmap(optimized)) {
            if (a.Size != b.Size) throw new Exception("Image sizes differ");
            int changed = 0, ink = 0, maxDelta = 0;
            for (int y = 0; y < a.Height; y++) {
                for (int x = 0; x < a.Width; x++) {
                    Color p = a.GetPixel(x,y), q = b.GetPixel(x,y);
                    if (p.R != 255 || p.G != 255 || p.B != 255) ink++;
                    if (p.ToArgb() != q.ToArgb()) {
                        changed++;
                        maxDelta = Math.Max(maxDelta, Math.Max(Math.Abs(p.R-q.R), Math.Max(Math.Abs(p.G-q.G), Math.Abs(p.B-q.B))));
                    }
                }
            }
            return new {width=a.Width, height=a.Height, changedPixels=changed, originalInkPixels=ink, maximumChannelDelta=maxDelta};
        }
    }
}
'@
$output = [FontPreviewDiff]::Compare((Join-Path $PSScriptRoot 'preview-original.png'),(Join-Path $PSScriptRoot 'preview-compact.png'))
$output | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $PSScriptRoot 'preview-comparison.json') -Encoding UTF8
$output | ConvertTo-Json
