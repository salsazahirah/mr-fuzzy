# The Reply Magnet

## Pembaruan layout flexbox

Seluruh 13 banner, termasuk 300x600, memakai flexbox untuk susunan utama. Logo, judul, prompt, dan gambar mengikuti alur layout dengan padding, gap, dan margin. Pada 970x250, logo dan judul dikelompokkan dalam kolom flex tersendiri.

`position: absolute` hanya digunakan untuk teks yang menumpuk di atas gambar prompt, lapisan klik, dan gambar hasil yang menggantikan prompt pada 300x250. Galeri pratinjau juga memakai flex untuk menempatkan iframe tanpa absolute positioning.

300x600 kini memakai `box-sizing: border-box`, sehingga dimensi luarnya tepat 300x600 termasuk padding dan border. Deklarasi flex duplikat dan offset negatif logo dihapus. Aset serta urutan animasi dipertahankan.

Pemeriksaan `node validation/the_reply_magnet/check-banners.cjs` berhasil untuk seluruh 13 ukuran: dimensi, batas konten, aset, layout flex, penggunaan absolute khusus overlay, cakupan link, animasi, dan klik Exit API. Galeri juga diperiksa pada viewport 390px dan 1280px. Laporan terbaru ada di `browser-report.json`, beserta tangkapan layar di `screenshots`.

Dukungan reduced motion pada 12 ukuran tambahan tetap lolos pemeriksaan. Banner asli 300x600 mempertahankan animasi loop lamanya, yang belum mendukung reduced motion. ZIP di `zips` merupakan hasil pengemasan sebelumnya; pembaruan ini berlaku pada sumber HTML.

## Catatan pembuatan sebelumnya (12 ukuran tambahan)

Layout HTML berasal dari ukuran yang sama pada `the_forgotten_birthday`. Gambar, logo, prompt box, font reusable 337.572 byte, library, dan copy diambil dari `the_reply_magnet/300x600`. Folder referensi 300×600 tidak diedit dalam pekerjaan ini.

Ukuran baru: 120×20, 160×600, 168×28, 216×36, 300×50, 300×250, 300×1050, 320×50, 728×90, 970×90, 970×250, dan 1080×1920.

Copy judul: **BIKIN WACANA / TERLAKSANA**. Ukuran vertikal sempit memakai tiga baris BIKIN / WACANA / TERLAKSANA. Kata TERLAKSANA tetap utuh; posisi dan ukuran judul disesuaikan pada 160×600 serta 300×1050. Prompt disalin dari referensi sebagai UTF-8, termasuk kutip melengkung: **Bikin meme kucing, tulisannya: “Datang buat bola. Stay buat gorengan. Gas?”**. Gambar hasil menggunakan meme kucing dengan bola dan gorengan dari kampanye Reply Magnet.

Ukuran pendek menampilkan logo dan judul sesuai template. Ukuran besar menyertakan prompt serta gambar hasil. Animasi baru berhenti setelah 24–27 detik, termasuk pengulangan; cursor berhenti pada frame akhir. Link menyediakan fallback URL dan memakai Exit API ketika tersedia.

Pratinjau semua ukuran berada di `the_reply_magnet/index.html`. Masing-masing banner menyertakan aset dan library lokal yang diperlukan. ZIP per ukuran tersedia di folder `zips` pada direktori laporan ini, dengan `index.html` di root tiap ZIP.

Seluruh 12 ukuran diperiksa menggunakan Chrome headless:

- Dimensi elemen banner cocok dengan ukuran yang diminta.
- Semua gambar, font, dan library lokal termuat; tidak ada aset lokal hilang atau exception JavaScript.
- Teks judul dan prompt tidak keluar dari banner pada frame prompt maupun frame akhir; teks prompt tetap di dalam kartu prompt.
- Total durasi timeline beserta pengulangannya kurang dari 30 detik.
- Handler klik memanggil Exit API ketika tersedia, menggunakan stub tanpa membuka tujuan iklan.
- Mode prefers-reduced-motion menampilkan judul tanpa timeline animasi.

Tangkapan layar frame akhir ada di `screenshots`, dan rincian browser berada di `browser-report.json`. Exit API eksternal diblokir selama pemeriksaan lokal. Pengujian ini tidak meliputi upload ke validator Google atau persetujuan kampanye.

`package-report.json` mencatat jumlah file, ukuran aset, ukuran ZIP, dan SHA-256. ZIP berukuran 372.666–493.051 byte; total aset tiap banner paling besar 548.772 byte. Semua ZIP dan total asetnya masing-masing di bawah 600.000 byte. `reference-hashes.json` mencatat hash sumber pada awal pekerjaan.

`build-banners.cjs` mencatat pembuatan dari template dan menolak menimpa folder ukuran yang sudah ada. `check-banners.cjs` memeriksa banner melalui server lokal sementara, lalu menutup browser dan server. `package-banners.ps1` mengemas seluruh ukuran.
