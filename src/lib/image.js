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
  try {
    return await getImage({ src, inferSize: true, ...options });
  } catch (err) {
    console.warn(`⚠️  Gagal proses gambar, dilewati: ${src}\n   Alasan: ${err.message}`);
    return null;
  }
}
