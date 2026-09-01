import { NextRequest, NextResponse } from 'next/server';
import { getCloudinary, getCloudinaryPublicConfig } from '@/lib/cloudinary';
import { canChangeAvatar } from '@/lib/rateLimit/profileFields';
import { getAuthenticatedUserFromRequest } from '@/lib/server/auth-service';
import { errorResponse, profileRateLimited } from '@/lib/server/route-utils';
import { canBypassProfileLimits } from '@/lib/server/roles';

export const runtime = 'nodejs';

// Kimliği doğrulanmış kullanıcı için doğrudan Cloudinary yüklemesinin imzasını üretir.
export async function POST(_request: NextRequest) {
  try {
    const user = await getAuthenticatedUserFromRequest(_request);
    const limit = canChangeAvatar(user.avatarChangeCount, user.avatarChangeWindowStart);
    if (!(await canBypassProfileLimits(user.id)) && !limit.allowed) {
      const nextAllowedAt = user.avatarChangeWindowStart ? new Date(user.avatarChangeWindowStart.getTime() + 24 * 60 * 60 * 1000) : undefined;
      // Yükleme imzasını vermeden önce kontrol ederek Cloudinary'de boşa dosya oluşmasını önler.
      return profileRateLimited(nextAllowedAt);
    }
    const timestamp = Math.floor(Date.now() / 1000);
    const publicId = `avatars/${user.id}`;
    // public_id zaten klasör yolunu içerdiği için folder göndermiyoruz; ikisini birlikte kullanmak yolu iki kez ekleyebilir.
    const signature = getCloudinary().utils.api_sign_request({ timestamp, public_id: publicId, overwrite: true }, process.env.CLOUDINARY_API_SECRET!);
    const { cloudName, apiKey } = getCloudinaryPublicConfig();
    return NextResponse.json({ signature, timestamp, apiKey, cloudName, publicId });
  } catch (error) { return errorResponse(error); }
}
