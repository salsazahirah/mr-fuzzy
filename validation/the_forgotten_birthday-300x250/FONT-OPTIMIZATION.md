# Optimasi font banner 300×250

Tanggal: 9 November 2026.

Catatan versi: optimasi di bawah adalah subset khusus teks pertama. Font pada contoh banner kemudian diganti dengan versi reusable A–Z, a–z, angka, dan tanda baca. Versi terbaru berukuran 337.572 byte; lihat [laporan font reusable](../reusable-font/README.md).

Font `the_forgotten_birthday/300x250/assets/google-sans-flex.woff2` sudah diganti dengan subset untuk teks banner tersebut. HTML, CSS, animasi, gambar, dan banner ukuran lain tidak diubah.

| Ukuran | Sebelum | Sesudah |
| --- | ---: | ---: |
| Font WOFF2 | 1.401.788 byte | 263.336 byte |
| ZIP banner | 1.541.241 byte | 402.460 byte |
| Total aset sebelum ZIP | 1.596.550 byte | 458.098 byte |

Ukuran font berkurang **81,21%**. Font dan keseluruhan banner kini masing-masing di bawah 600.000 byte.

Metode: subset 31 karakter unik dari judul dan teks prompt banner. Keenam sumbu variable font (`opsz`, `wdth`, `wght`, `GRAD`, `ROND`, `slnt`) beserta rentangnya tetap dipertahankan. Fitur layout, hinting, dan metadata lisensi dipertahankan melalui HarfBuzz/subset-font. Pengaturan font dalam CSS tetap sama.

Verifikasi mencakup ketersediaan semua karakter, kesamaan sumbu variable font, bentuk outline dan lebar setiap karakter, serta posisi teks lengkap pada pengaturan default, judul (`opsz=144, wdth=37, wght=700, GRAD=37, ROND=0, slnt=0`), dan prompt (`opsz=13, wght=400`). Angka dibandingkan pada presisi satu per sejuta unit font untuk mengabaikan noise floating point. Pengujian ini membandingkan data font dan layout; tidak mencakup screenshot browser.

ZIP hasil optimasi diunggah ke validator Google. **19 pemeriksaan PASS, 0 WARN, 0 FAIL**:

https://h5validator.appspot.com/adwords/asset?result=5190822058917888

Artefak:

- `the_forgotten_birthday-300x250-font-optimized.zip`: paket banner dengan font hasil optimasi; SHA-256 `2413B540CB49CB41660CAEDA2DC485023002E77338F5EE4A443FD295EE9B804A`.
- `google-sans-flex-banner-subset.woff2`: salinan font hasil optimasi.
- `google-sans-flex-banner-subset.woff2.json`: rincian karakter, sumbu, versi alat, dan hasil verifikasi.
- `validator-result-font-optimized.json`: hasil validator Google.
- `the_forgotten_birthday-300x250-original.zip`: arsip sumber asli, termasuk font lengkap, untuk pemulihan atau pembuatan ulang subset.
- `optimize-font.cjs`: skrip pembuatan dan verifikasi subset; dependensi `subset-font` dan `fontkit` dipasang terpisah di folder sementara.

Subset ini khusus untuk teks banner yang sekarang. Bila teks diganti atau karakter baru ditambahkan, buat ulang subset dari font lengkap pada ZIP asli, lalu periksa ukuran kembali. Jangan memakai subset ini untuk ukuran/desain lain tanpa mengecek seluruh karakternya.

Optimasi font menyelesaikan masalah ukuran paket. Animasi `repeat: -1` dari audit awal tetap perlu disesuaikan terpisah agar memenuhi batas durasi Display 30 detik.
