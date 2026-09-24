'use client';

const MAX_SIDE = 1600;
// Batas body request Vercel 4,5 MB; sisakan ruang untuk base64 & JSON
const MAX_DATA_URL_LENGTH = 3_000_000;

/**
 * Perkecil foto (mis. dari kamera HP, 5-10 MB) menjadi JPEG maks. 1600 px
 * sebelum dikirim ke AI. Resolusi ini tetap cukup untuk membaca teks kitab.
 */
export async function compressImageForUpload(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('File harus berupa gambar.');

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new Error('Format foto tidak didukung browser ini. Coba simpan ulang sebagai JPG/PNG.');
  }

  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Browser tidak bisa memproses gambar.');
  // Latar putih agar PNG transparan tidak jadi hitam saat diubah ke JPEG
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  for (const quality of [0.85, 0.7, 0.55]) {
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    if (dataUrl.length <= MAX_DATA_URL_LENGTH) return dataUrl;
  }
  throw new Error('Foto terlalu besar. Coba potong (crop) bagian teksnya saja.');
}
