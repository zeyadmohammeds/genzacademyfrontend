export async function uploadToCloudinary(file: File | string, folder: string = 'general'): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary configuration is missing. Check NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env');
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const formData = new FormData();
  
  if (typeof file === 'string') {
    // If it's a base64 string or URL
    formData.append('file', file);
  } else {
    formData.append('file', file);
  }
  
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', `elsewedy-academy/${folder}`);

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to upload image to Cloudinary');
  }

  const data = await response.json();
  return data.secure_url;
}
