# The Broccoli Strike — 12 ukuran banner

Layout HTML diadaptasi dari ukuran yang sama pada `the_forgotten_birthday`. Aset, font reusable 337.572 byte, dan copy diambil dari `the_broccoli_strike/300x600`. Folder referensi 300×600 dipertahankan tanpa perubahan oleh pekerjaan ini.

Ukuran baru: 120×20, 160×600, 168×28, 216×36, 300×50, 300×250, 300×1050, 320×50, 728×90, 970×90, 970×250, dan 1080×1920.

Copy judul: **MENU BIASA / JADI ISTIMEWA**. Untuk ukuran vertikal sempit, judul dipecah menjadi MENU / BIASA / JADI / ISTIMEWA mengikuti layout acuan. Prompt: **Kasih ide menu mengolah brokoli yang disukai anak**. Gambar hasil memakai foto kotak bekal dari referensi brokoli.

Pratinjau semua ukuran: `the_broccoli_strike/index.html`. Setiap banner memiliki HTML, font, gambar, dan library lokal yang diperlukan sehingga dapat dipakai terpisah. Ukuran pendek memakai logo dan judul mengikuti template, sedangkan ukuran besar menyertakan prompt dan gambar hasil. ZIP per ukuran berada di folder `zips` pada direktori laporan ini, dengan `index.html` di root masing-masing ZIP.

Banner baru memakai animasi terbatas: 25,5 detik untuk ukuran pendek, 24 detik untuk layout besar, dan 27 detik untuk 300×250. Cursor berhenti pada frame akhir. Link mempunyai fallback URL serta memakai Exit API ketika tersedia.

Pemeriksaan Chrome headless terhadap seluruh 12 ukuran mencakup:

- Dimensi elemen banner cocok dengan ukuran yang diminta.
- Semua font, gambar, dan library lokal termuat; tidak ada aset lokal hilang atau exception JavaScript.
- Batas teks judul dan prompt diperiksa pada frame prompt serta frame akhir.
- Durasi total timeline termasuk pengulangan kurang dari 30 detik.
- Handler klik memanggil Exit API ketika tersedia (menggunakan stub, tanpa membuka tujuan iklan).
- Mode prefers-reduced-motion menampilkan judul tanpa timeline animasi.

Tangkapan layar frame akhir tersimpan di `screenshots`, dan rincian hasil browser berada di `browser-report.json`. Tautan ke Exit API eksternal diblokir selama pemeriksaan lokal; pemeriksaan ini tidak meliputi upload ke validator Google atau persetujuan kampanye. `package-report.json` mencatat ukuran dan SHA-256 ZIP. Semua paket diperiksa agar ukuran ZIP dan total aset masing-masing di bawah 600.000 byte.

Skrip `build-banners.cjs` adalah catatan pembuatan dan menolak menimpa folder yang sudah ada. `check-banners.cjs` menjalankan pemeriksaan browser dengan server lokal sementara yang dihentikan setelah selesai. `package-banners.ps1` mengemas banner. `reference-hashes.json` mencatat hash referensi pada awal pekerjaan.
