# Simulasi Video Call (HTML/CSS/JS terpisah)

## Cara pakai
1. Upload semua file/folder apa adanya.
2. Edit `app.js` jika ingin mengubah:
   - `AD_LINK` → directlink Adsterra kamu
   - `REDIRECT_SECONDS` → detik sebelum auto-redirect setelah panggilan diterima
3. Behavior:
   - Ringtone loop saat halaman terbuka sampai tombol **Accept** atau **Decline** ditekan.
   - Setelah **Accept**, timer berjalan dan ketika mencapai `REDIRECT_SECONDS`, halaman akan redirect ke `AD_LINK`.
   - Jika user sudah pernah klik **Accept** (tercatat di `localStorage`), **klik Accept di kunjungan berikutnya** langsung redirect ke `AD_LINK` (tanpa menampilkan video call).
