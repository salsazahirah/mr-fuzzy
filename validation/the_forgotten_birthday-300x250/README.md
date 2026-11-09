# Hasil pemeriksaan banner The Forgotten Birthday 300×250

Tanggal pemeriksaan: 9 November 2026 (Asia/Jakarta).

Pembaruan terbaru: contoh banner kini menggunakan font reusable 337.572 byte untuk A–Z, a–z, angka, dan tanda baca. ZIP terbaru berukuran 476.721 byte dan memperoleh 19 PASS dari validator. Lihat [laporan font reusable](../reusable-font/README.md) dan [file font beserta petunjuk](../../shared/fonts/README.md). Hasil di bawah merupakan catatan versi sebelumnya.

Pembaruan setelah audit: font pada banner 300×250 sudah diperkecil menjadi 263.336 byte dan ZIP baru menjadi 402.460 byte. Hasil audit di bawah mencatat versi asli; lihat [hasil optimasi font](FONT-OPTIMIZATION.md) untuk versi terkini. Catatan durasi animasi dari audit masih berlaku.

Banner: `the_forgotten_birthday/300x250/index.html`.

**Kesimpulan: seluruh 19 pemeriksaan asset validator Google berstatus PASS. Namun banner belum memenuhi persyaratan Google Ads Display terkait ukuran paket dan durasi animasi.**

## Pemeriksaan langsung ke validator Google

Ketujuh file dalam folder banner dikemas ke `the_forgotten_birthday-300x250-original.zip`, dengan `index.html` di root ZIP dan separator direktori `/`. Isi file tidak diubah; SHA-256 setiap file ZIP cocok dengan sumber lokal, sebagaimana tercatat di `asset-manifest.json`.

ZIP diunggah melalui endpoint yang dipakai halaman https://h5validator.appspot.com/adwords/asset, yaitu `POST /api/policy/adwords`, dengan field multipart `creative_bundle`.

| Percobaan | Parameter tambahan | Hasil | Tautan hasil |
| --- | --- | --- | --- |
| 1 | `allow_large_file_size=false` (teks multipart) | 19 PASS, 0 WARN, 0 FAIL | https://h5validator.appspot.com/adwords/asset?result=6119517602840576 |
| 2 | Field `allow_large_file_size` tidak dikirim | 19 PASS, 0 WARN, 0 FAIL | https://h5validator.appspot.com/adwords/asset?result=5440463677554688 |

Kedua respons asli dari server disimpan dalam file `validator-result-*.json`; hanya awalan proteksi JSON `)]}',` yang dilepas dan formatnya dirapikan agar dapat dibaca sebagai JSON standar. Halaman validator memiliki opsi “Select for App Campaigns”; hasil PASS ukuran dari endpoint ini tidak cukup untuk menyimpulkan kepatuhan pada batas ukuran Display. Penyebab internal perbedaan batas ukuran tidak dapat dipastikan dari respons server.

| Pemeriksaan validator | Hasil |
| --- | --- |
| 4th party calls check | PASS |
| Ad Dimensions | PASS |
| Asset preloading | PASS |
| Custom Exit Not Allowed check | PASS |
| DoubleClick Studio check | PASS |
| Exit API Script | PASS |
| File Bundle Size | PASS |
| File Paths/Structure | PASS |
| File Type/Count | PASS |
| Filename length | PASS |
| GWD environment check | PASS |
| HTML5 Not Allowed Features check | PASS |
| Main Index HTML File | PASS |
| Missing asset check | PASS |
| Multiple Click Exits | PASS |
| Primary Creative Asset | PASS |
| Secure URL check | PASS |
| Swiffy-Built Not Allowed | PASS |
| Zip File Format | PASS |

## Temuan tambahan dari kode dan spesifikasi resmi

1. **Ukuran paket melebihi batas Display.** ZIP berukuran **1.541.241 byte** (sekitar 1,54 MB); total file sebelum kompresi **1.596.550 byte**. [Spesifikasi Google Ads Display](https://support.google.com/google-ads/answer/1722096?hl=en) menetapkan maksimum 600 KB. Aset terbesar adalah `assets/google-sans-flex.woff2`, **1.401.788 byte**, sekitar 91% ukuran ZIP setelah dikompresi. Prioritaskan penggantian cara penyediaan font, misalnya Google Fonts yang diizinkan spesifikasi, lalu validasi ulang. File WOFF2 sendiri memperoleh PASS pada pemeriksaan File Type/Count saat pengujian ini; daftar tipe file dalam dokumentasi Display tidak mencantumkan WOFF2, sehingga hasil validator ini tidak menjamin penerimaan font lokal saat upload ke Google Ads.

2. **Animasi berulang tanpa batas.** `index.html:173` memakai GSAP `repeat: -1` dan baris 174 mengatur `repeatDelay: 2.5`, tanpa penghentian terjadwal. Baris 110 juga memiliki animasi cursor CSS `infinite` yang tampak selama frame prompt. [Kebijakan animasi Google](https://support.google.com/adspolicy/answer/176108?hl=en) berlaku juga untuk HTML5 dan membatasi keseluruhan animasi beserta pengulangannya hingga 30 detik. Hentikan timeline dan animasi cursor sebelum/melewati batas tersebut, serta pertahankan frame akhir statis.

3. **Struktur, referensi aset, dan dimensi sesuai pemeriksaan.** Terdapat satu HTML utama, `<!DOCTYPE html>`, UTF-8, serta `ad.size` 300×250 yang cocok dengan `.ads-container`. Terdapat tujuh file; semua referensi gambar, font, dan library lokal tersedia di ZIP. Exit API eksternal HTTPS dan pemanggilan `ExitApi.exit()` diterima validator. Tidak ada aset hilang menurut pemeriksaan server.

## Batas pemeriksaan

Pengujian mencakup validasi paket pada server Google dan inspeksi kode/aset lokal. Klik Exit API tidak diuji secara interaktif dalam preview browser; PASS Exit API menyatakan pemeriksaan keberadaan pemanggilan. `clickTag` didefinisikan tetapi handler klik menggunakan `ExitApi.exit()` tanpa membaca variabel tersebut; pastikan Final URL pada konfigurasi iklan sesuai tujuan kampanye. Pemeriksaan ini tidak meliputi persetujuan kebijakan konten, kelayakan akun, atau hasil upload kampanye sebenarnya.

Kode dan aset sumber tidak diedit. Artefak pemeriksaan disimpan terpisah di folder ini.
