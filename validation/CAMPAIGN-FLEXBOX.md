# Pembaruan layout tiga kampanye

39 banner pada `the_broccoli_strike`, `the_forgotten_birthday`, dan `the_lunchbox_universe` menggunakan HTML dan CSS banner berukuran sama dari `the_reply_magnet` sebagai dasar.

Masing-masing kampanye memiliki 13 ukuran: 120x20, 160x600, 168x28, 216x36, 300x50, 300x250, 300x600, 300x1050, 320x50, 728x90, 970x90, 970x250, dan 1080x1920.

- Susunan utama menggunakan flexbox; 970x250 memiliki kolom logo dan judul.
- Absolute positioning terbatas pada teks di atas gambar prompt, lapisan klik, dan pergantian prompt/gambar pada 300x250.
- Seluruh 300x600 memakai border-box sehingga padding dan border termasuk dalam dimensi banner.
- Tipografi mengikuti panjang copy masing-masing kampanye. Lunchbox Universe 300x600 memakai 40px agar judul tetap dua baris. Banner 728x90 dan 970x90 mendapat gap tambahan antara logo dan judul.
- Galeri menggunakan iframe dalam flex container; Forgotten Birthday mendapat halaman pratinjau dengan struktur yang sama.
- Teks, aset lokal, clickTag, dan skrip animasi setiap kampanye dipertahankan. Hash aset dan skrip diverifikasi terhadap `campaign-flexbox-source-manifest.json`.

## Pemeriksaan

Jalankan dari root workspace:

```powershell
node validation/the_reply_magnet/check-banners.cjs --campaign=the_broccoli_strike
node validation/the_reply_magnet/check-banners.cjs --campaign=the_forgotten_birthday
node validation/the_reply_magnet/check-banners.cjs --campaign=the_lunchbox_universe
```

Seluruh 39 ukuran lolos pemeriksaan Chrome headless untuk dimensi, batas konten, aset, flexbox, penggunaan absolute khusus overlay, cakupan link, animasi, dan klik Exit API. Ketiga galeri diperiksa pada viewport 390px dan 1280px. Laporan serta tangkapan layar terbaru disimpan di direktori `validation/<kampanye>/`.

Perilaku animasi lama dipertahankan: 300x600 masih menggunakan loop asli tanpa dukungan reduced motion; Forgotten Birthday memakai pengulangan tanpa batas. Pemeriksaan reduced motion lulus pada 12 ukuran lain di setiap kampanye. Exit API eksternal diblokir dan diuji menggunakan stub lokal.

ZIP pada direktori validasi kampanye adalah arsip dari pekerjaan sebelumnya. Perubahan ini berlaku pada sumber HTML; ZIP belum dikemas ulang.
