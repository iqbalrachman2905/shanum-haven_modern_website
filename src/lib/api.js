// Cache in-memory - build Astro itu satu proses Node.js yang sama dipakai
// bareng buat semua halaman (index, listing artikel, tiap halaman artikel).
// Tanpa ini, getSiteData() bisa kepanggil belasan kali dalam 1 build =
// belasan request ke Apps Script yang sebenernya nanya hal yang sama.
let cachedSiteData = null;
const articleCache = new Map();

const API_URL = 'https://script.google.com/macros/s/AKfycbwlmX6B5_BUlANlFm5ZkdvwRBZDaoSEXKgsq8AMaAkMlxwzljcUyP04T2vUgpN_yW_1/exec';

/**
 * Dipanggil di frontmatter halaman .astro (jalan di Node.js pas build,
 * BUKAN di browser visitor) - jadi visitor akhir nggak pernah nunggu API ini.
 */
export async function getSiteData() {
  if (cachedSiteData) return cachedSiteData;

  const res = await fetch(`${API_URL}?action=all`);
  if (!res.ok) {
    throw new Error(`Gagal fetch data dari Apps Script (status ${res.status}). Cek apakah deployment masih aktif.`);
  }
  const data = await res.json();
  if (data.error) {
    throw new Error(`Apps Script mengembalikan error: ${data.error}`);
  }
  cachedSiteData = data;
  return data; // { content, units, gallery, articles, generated_at }
}

/** Ambil 1 artikel lengkap (termasuk body_html dari Google Doc) by slug. */
export async function getArticleBySlug(slug) {
  if (articleCache.has(slug)) return articleCache.get(slug);

  const res = await fetch(`${API_URL}?action=article&slug=${encodeURIComponent(slug)}`);
  if (!res.ok) {
    throw new Error(`Gagal fetch artikel "${slug}" (status ${res.status}).`);
  }
  const data = await res.json();
  if (data.error) {
    throw new Error(`Apps Script error untuk artikel "${slug}": ${data.error}`);
  }
  articleCache.set(slug, data);
  return data;
}

/** Cari foto pertama (sesuai urutan) untuk kategori & unit_id tertentu. */
export function findCoverImage(gallery, kategori, unitId) {
  return gallery
    .filter(g => g.kategori === kategori && g.unit_id === unitId && g.image_url)
    .sort((a, b) => (a.urutan || 0) - (b.urutan || 0))[0] || null;
}
