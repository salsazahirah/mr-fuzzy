Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$workspaceDir = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$sizes = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'sizes.json') -Raw | ConvertFrom-Json
$zipDir = Join-Path $PSScriptRoot 'zips'
New-Item -ItemType Directory -Path $zipDir -Force | Out-Null
$results = foreach ($size in $sizes) {
    $bannerDir = Join-Path $workspaceDir ('the_reply_magnet/' + $size)
    $zipPath = Join-Path $zipDir ('the_reply_magnet-' + $size + '.zip')
    $buffer = New-Object System.IO.MemoryStream
    $archive = New-Object System.IO.Compression.ZipArchive($buffer,[System.IO.Compression.ZipArchiveMode]::Create,$true)
    $files = @(Get-ChildItem -LiteralPath $bannerDir -Recurse -File)
    foreach ($file in $files) {
        $entryName = $file.FullName.Substring($bannerDir.Length+1).Replace('\','/')
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive,$file.FullName,$entryName,[System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
    $archive.Dispose()
    [System.IO.File]::WriteAllBytes($zipPath,$buffer.ToArray())
    $buffer.Dispose()
    $zipBytes = (Get-Item -LiteralPath $zipPath).Length
    $assetBytes = ($files | Measure-Object -Property Length -Sum).Sum
    if ($zipBytes -ge 600000 -or $assetBytes -ge 600000) { throw ($size + ': package exceeds 600 KB') }
    [pscustomobject]@{size=$size;fileCount=$files.Count;assetBytes=$assetBytes;zipBytes=$zipBytes;sha256=(Get-FileHash -LiteralPath $zipPath -Algorithm SHA256).Hash}
}
$results | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $PSScriptRoot 'package-report.json') -Encoding UTF8
$results | Format-Table size,fileCount,assetBytes,zipBytes
