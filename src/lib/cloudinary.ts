import { v2 as cloudinary } from 'cloudinary';

let configured = false;

// Cloudinary SDK'sını yalnızca sunucu ortamındaki gizli bilgilerle yapılandırır.
export function getCloudinary() {
  if (!configured) {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) throw new Error('Cloudinary yapılandırması eksik');
    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
    configured = true;
  }
  return cloudinary;
}

// İstemciye yalnızca imzalı yükleme için gereken gizli olmayan Cloudinary bilgilerini verir.
export function getCloudinaryPublicConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  if (!cloudName || !apiKey) throw new Error('Cloudinary yapılandırması eksik');
  return { cloudName, apiKey };
}
