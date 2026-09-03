import { getImage } from 'astro:assets';

/**
 * Bungkus getImage() dengan try/catch. Kalau 1 foto gagal diproses (format
 * aneh, corrupt, dll), build TIDAK berhenti total - foto itu aja yang
 * dilewati (fallback ke placeholder di komponen masing-masing), sisanya
 * tetap jalan normal. Sebelumnya 1 foto rusak bisa bikin SELURUH situs
 * gagal ke-build, itu terlalu rapuh buat sistem yang isinya bakal terus
 * bertambah foto dari waktu ke waktu.
 */
export async function safeImage(src, options = {}) {
   if (!src) return null;

   // Untuk URL eksternal, Astro wajib dikasih width & height eksplisit
   // (nyegah CLS). Kalau pemanggil cuma kasih `width` atau `widths`,
   // isi otomatis: width dasar = varian terbesar, height = rasio 4:3
   // (rasio dominan kartu/foto di situs ini; CSS object-fit tetap
   // ngebenerin tampilannya).
   const opts = { ...options };
   if (!opts.width && Array.isArray(opts.widths) && opts.widths.length > 0) {
     opts.width = opts.widths[opts.widths.length - 1];
   }
   if (opts.width && !opts.height) {
     opts.height = Math.round(opts.width * 0.75);
   }

   try {
     return await getImage({ src, ...opts });
   } catch (err) {
     console.warn(`⚠️  Gagal proses gambar, dilewati: ${src}\n   Alasan: ${err.message}`);
     return null;
   }
}

/**
 * URL `drive.google.com/thumbnail?id=...&sz=w1000` jauh lebih reliable buat
 * dimuat langsung dibanding `uc?export=download` (yang kadang balas HTML
 * interstitial / redirect aneh). Param `sz`-nya bisa dinaikkan buat ambil
 * resolusi lebih tinggi (sampai resolusi asli file). Kalau URL-nya bukan
 * thumbnail Drive, balikin apa adanya.
 */
export function drivePreviewUrl(url, width = 1000) {
  if (!url) return url;
  const str = String(url);
  if (str.includes('drive.google.com/thumbnail') && /sz=w\d+/.test(str)) {
    return str.replace(/sz=w\d+/, `sz=w${width}`);
  }
  return str;
}
