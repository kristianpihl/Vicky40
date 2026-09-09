// Downscale an image File in the browser before it is uploaded, so the photos
// stay small and Supabase storage lasts on the free plan.
//
//   - the longest edge is capped at MAX_EDGE pixels
//   - the image is re-encoded as JPEG at QUALITY
//
// A typical ~4 MB phone photo comes out around 0.4–0.7 MB, which is still
// plenty for a slideshow, a photo book or a montage.
//
// If anything goes wrong (unreadable format, tiny image, etc.) the original
// file is returned untouched.

const MAX_EDGE = 2048
const QUALITY = 0.8

export async function resizeImage(file) {
  if (!file.type.startsWith('image/')) return file

  try {
    const bitmap = await loadBitmap(file)
    const width = bitmap.naturalWidth || bitmap.width
    const height = bitmap.naturalHeight || bitmap.height
    if (!width || !height) return file

    const scale = Math.min(1, MAX_EDGE / Math.max(width, height))
    const targetW = Math.max(1, Math.round(width * scale))
    const targetH = Math.max(1, Math.round(height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = targetW
    canvas.height = targetH
    const ctx = canvas.getContext('2d')
    ctx.drawImage(bitmap, 0, 0, targetW, targetH)
    if (bitmap.close) bitmap.close()

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', QUALITY),
    )

    // Keep the original if the re-encoded version is not actually smaller.
    if (!blob || blob.size >= file.size) return file

    const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg'
    return new File([blob], newName, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    })
  } catch (err) {
    console.warn('Image resize failed, using original:', file.name, err)
    return file
  }
}

// Decode the file, applying EXIF orientation so rotated phone photos come out
// the right way up.
async function loadBitmap(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' })
    } catch {
      // fall through to the <img> approach
    }
  }

  return await new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = (e) => {
      URL.revokeObjectURL(url)
      reject(e)
    }
    img.src = url
  })
}
