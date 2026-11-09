# Font reusable A–Z, a–z, dan 0–9

Tanggal: 9 November 2026. File keluaran berada di `shared/fonts` dan petunjuk pemakaiannya berada di `shared/fonts/README.md`.

Sumber: `assets/google-sans-flex.woff2` dari `validation/the_forgotten_birthday-300x250/the_forgotten_birthday-300x250-original.zip`. SHA-256 sumber: `87218291DC2464E35C34D2A21F7127BDBA4D7BEEE22975D3552245D2293A6D38`.

Font dibangun menggunakan subset-font 2.9.0, fontkit 2.0.4, dan dependensi fontverter/HarfBuzz. Skrip `compare-candidates.cjs` menyimpan metadata lisensi, hinting, dan fitur layout secara default; secara eksplisit mempertahankan name IDs 0, 7, 8, 9, 11, 13, 14.

| Kandidat (105 karakter) | Ukuran byte | Pengaturan |
| --- | ---: | --- |
| Semua sumbu | 966.556 | opsz, wdth, wght, GRAD, ROND, slnt tetap variable |
| Upright | 540.832 | slnt=0; lima sumbu lain tetap variable |
| Square | 583.152 | ROND=0; lima sumbu lain tetap variable |
| Compact / upright-square | 337.572 | slnt=0, ROND=0; empat sumbu lain tetap variable |

Dua keluaran disimpan untuk digunakan: compact dan upright. Semua 105 karakter ditemukan di kedua keluaran; metadata rentang sumbu yang masih variable cocok dengan sumber. Lihat `compact-font-info.json` dan `upright-font-info.json`.

`preview-fonts.cjs` memuat ketiga font (asli, compact, upright) di Chrome headless menggunakan FontFace dan memotret sembilan contoh: alfabet besar/kecil, angka, tanda baca, tanda baca tipografis, judul banner, prompt, gaya sempit-tebal, dan gaya lebar-tipis. Lebar dan tinggi teks yang direkam dalam `browser-measurements.json` sama untuk ketiganya pada seluruh contoh. Semua contoh memakai slnt=0 dan ROND=0. Pengaturan ROND selain 0 pada versi upright tidak dibandingkan dalam screenshot ini.

Screenshot tersedia dalam `preview-original.png`, `preview-compact.png`, dan `preview-upright.png`. Compact dan upright menghasilkan screenshot yang sama pada pengaturan yang diuji. Dibanding sumber asli, terdapat 1.323 piksel berbeda dari 680.000 piksel gambar; lebar teks tetap sama. Ini mencatat efek rasterisasi setelah instancing dan re-encoding, bukan jaminan kesamaan piksel. Lihat `preview-comparison.json` dan `compare-preview.ps1`.

Font compact dipasang pada contoh banner 300×250 menggantikan subset khusus teks sebelumnya. Banner lain tidak diubah. ZIP contoh terbaru tersimpan di folder ini dengan nama `the_forgotten_birthday-300x250-reusable-font.zip`. Arsip asli dan arsip subset khusus teks dari pemeriksaan sebelumnya tetap tersedia di folder audit awal.

ZIP contoh berukuran **476.721 byte**, dengan total aset sebelum ZIP **532.334 byte**. SHA-256 ZIP: `80F408FF3EBA289C23A429A007FA5526EB3B1B24CD1AD3EECC3602B4DBCFB022`.

Pengujian ulang ke validator Google menghasilkan **19 PASS, 0 WARN, 0 FAIL**. Respons tersimpan di `validator-result.json` dan dapat dilihat di https://h5validator.appspot.com/adwords/asset?result=6621222639632384 .

Masalah pengulangan animasi dari audit awal tetap terpisah dari pekerjaan font ini.
