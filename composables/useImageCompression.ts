import imageCompression from 'browser-image-compression'

export const useImageCompression = () => {
  const compressing = ref(false)

  async function compressImage(file: File): Promise<File> {
    if (file.size <= 512 * 1024) return file

    compressing.value = true
    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        fileType: 'image/jpeg'
      })
      return new File([compressedFile], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })
    } finally {
      compressing.value = false
    }
  }

  return { compressing, compressImage }
}
