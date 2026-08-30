export type CroppedAreaPixels = { x: number; y: number; width: number; height: number };

// Görseli döndürür, crop alanına küçültür, dairesel maskeler ve PNG blob olarak döndürür.
export async function getCroppedImage(imageSrc: string, crop: CroppedAreaPixels, rotation = 0): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const radians = rotation * Math.PI / 180;
  const rotated = document.createElement('canvas');
  const boundWidth = Math.ceil(Math.abs(image.width * Math.cos(radians)) + Math.abs(image.height * Math.sin(radians)));
  const boundHeight = Math.ceil(Math.abs(image.width * Math.sin(radians)) + Math.abs(image.height * Math.cos(radians)));
  rotated.width = boundWidth; rotated.height = boundHeight;
  const rotatedContext = rotated.getContext('2d');
  if (!rotatedContext) throw new Error('Görsel düzenleyici başlatılamadı.');
  rotatedContext.translate(boundWidth / 2, boundHeight / 2);
  rotatedContext.rotate(radians);
  rotatedContext.drawImage(image, -image.width / 2, -image.height / 2);
  const size = Math.max(1, Math.round(Math.min(crop.width, crop.height)));
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Görsel düzenleyici başlatılamadı.');
  context.beginPath();
  context.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  context.clip();
  context.drawImage(rotated, crop.x, crop.y, crop.width, crop.height, 0, 0, size, size);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Görsel oluşturulamadı.')), 'image/png');
  });
}

// Kaynak URL'sini canvas'ın güvenli biçimde çizebileceği bir Image nesnesine dönüştürür.
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Görsel okunamadı.'));
    image.src = src;
  });
}
