# Google Sans Flex untuk banner Latin

Kedua file ini dibuat dari font asli 1.401.788 byte. Keduanya memuat **A–Z, a–z, 0–9, spasi, semua tanda baca ASCII**, non-breaking space, en/em dash, kutip melengkung, bullet, ellipsis, dan euro: **105 karakter**. Font dapat dipakai untuk teks baru dengan karakter tersebut tanpa membuat subset ulang. Huruf beraksen dan aksara di luar cakupan ini belum disertakan.

| File | Ukuran | Sumbu variable yang tetap tersedia | Sumbu yang dikunci |
| --- | ---: | --- | --- |
| `google-sans-flex-latin-compact.woff2` | **337.572 byte** | opsz, wdth, wght, GRAD | slnt=0 dan ROND=0 |
| `google-sans-flex-latin-upright.woff2` | **540.832 byte** | opsz, wdth, wght, GRAD, ROND | slnt=0 |

Gunakan versi **compact** untuk banner yang memakai `slnt=0` dan `ROND=0`, seperti banner The Forgotten Birthday saat diperiksa. Gunakan versi **upright** jika perlu mengatur kebulatan huruf (`ROND`). Kedua versi memakai huruf tegak; variasi kemiringan tidak tersedia. Rentang penuh weight (1–1000), width (25–151), optical size (6–144), dan grade (0–100) tetap dipertahankan. Versi upright juga mempertahankan roundness 0–100.

Untuk memakai pada banner lain:

1. Salin salah satu file ke folder `assets` banner.
2. Ganti nama salinannya menjadi `google-sans-flex.woff2` bila ingin mempertahankan referensi CSS banner yang sekarang.
3. Sertakan salinan font tersebut di dalam ZIP masing-masing banner. Jangan merujuk ke folder shared di luar ZIP.

Contoh CSS setelah disalin ke folder `assets`:

```css
@font-face {
    font-family: "Google Sans Flex";
    src: url("assets/google-sans-flex.woff2") format("woff2");
    font-weight: 1 1000;
    font-style: normal;
}
```

WOFF2 sudah merupakan format terkompresi. Pengurangan ukuran di sini diperoleh dengan subset karakter dan penguncian sumbu yang tidak digunakan. Versi yang mempertahankan 105 karakter dan seluruh enam sumbu masih berukuran **966.556 byte** pada percobaan ini.

Pengujian Chrome memastikan sembilan contoh teks memiliki lebar dan tinggi yang sama dengan font asli pada pengaturan yang diuji (semuanya slnt=0, ROND=0). Screenshot menunjukkan perbedaan kecil pada rasterisasi; jangan menganggap hasilnya identik piksel demi piksel. Rincian pengujian tersedia di `validation/reusable-font`.

Masing-masing file font berada di bawah 600 KB. Ukuran keseluruhan ZIP tetap harus dihitung untuk setiap banner; font 541 KB menyisakan sedikit ruang untuk gambar dan kode.
