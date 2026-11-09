# The Lunchbox Universe — 12 ukuran banner

Layout diadaptasi dari HTML ukuran yang sama pada `the_forgotten_birthday`. Gambar, font reusable 337.572 byte, library, dan copy memakai referensi `the_lunchbox_universe/300x600`. Folder referensi 300×600 tidak diedit dalam pekerjaan ini.

Ukuran: 120×20, 160×600, 168×28, 216×36, 300×50, 300×250, 300×1050, 320×50, 728×90, 970×90, 970×250, dan 1080×1920. Sebelas folder baru dibuat. Ukuran 970×90 yang sudah ada disesuaikan dengan template Birthday, dan salinan sebelumnya disimpan dalam `original-970x90`. Aset lama yang masih berada pada folder 970×90 dipertahankan dan diselaraskan dengan referensi kampanye.

Copy judul: **EKSPLOR KREASI / LANGSUNG EKSEKUSI**. Pada ukuran vertikal sempit, judul dipecah menjadi EKSPLOR / KREASI / LANGSUNG / EKSEKUSI. Prompt: **Visualisasikan 3 ide bekal nugget brokoli bertema dinosaurus**. Gambar hasil menggunakan foto tiga kotak bekal bertema dinosaurus dari referensi kampanye.

Judul pada 970×250 disesuaikan menjadi 52px untuk menyisakan jarak dengan kartu prompt. Ukuran pendek mengikuti template berupa logo dan judul, sedangkan ukuran besar menampilkan prompt serta gambar hasil. Animasi banner baru berhenti setelah 24–27 detik; cursor berhenti di akhir. Link menyediakan fallback URL dan menggunakan Exit API ketika tersedia.

Pratinjau semua ukuran berada di `the_lunchbox_universe/index.html`. Setiap banner menyertakan aset dan library lokalnya. ZIP per ukuran berada di folder `zips` pada direktori laporan ini; `index.html` berada di root masing-masing ZIP.

Pemeriksaan Chrome headless mencakup seluruh 12 ukuran:

- Dimensi elemen banner sesuai ukuran yang diminta.
- Gambar, font, dan library lokal termuat; tidak ada aset lokal hilang atau exception JavaScript.
- Judul dan prompt tidak melewati batas banner pada frame prompt maupun frame akhir; prompt tidak melewati kartu prompt.
- Total durasi timeline beserta pengulangannya kurang dari 30 detik.
- Handler klik memanggil Exit API dengan stub pengujian, tanpa membuka URL tujuan.
- Mode prefers-reduced-motion menampilkan judul tanpa timeline animasi.

Banner 970×250 diperiksa ulang setelah penyesuaian ukuran judul. Hasil gabungan berada di `browser-report.json`, dan tangkapan layar frame akhir ada di `screenshots`. Exit API eksternal diblokir selama pengujian lokal. Pemeriksaan ini tidak meliputi upload ke validator Google atau persetujuan kampanye.

`package-report.json` mencatat jumlah file, ukuran aset, ukuran ZIP, dan SHA-256. Semua paket diperiksa agar ukuran ZIP serta total asetnya masing-masing di bawah 600.000 byte. `reference-hashes.json` mencatat hash referensi pada awal pekerjaan.

`build-banners.cjs` mencatat pembuatan dari template dan menolak menimpa sebelas folder baru. `check-banners.cjs` memeriksa banner melalui server lokal sementara, lalu menutup server dan browser setelah selesai. `package-banners.ps1` mengemas seluruh ukuran.
