export const MAX_TEXTURE_SIZE = 8192
export const MAX_TILES = (MAX_TEXTURE_SIZE / 512) ** 2

export function loadImage (url) {
  return new Promise((resolve, reject) => {
    const image = new Image()

    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (err) => reject(err))

    image.crossOrigin = 'anonymous'
    image.src = url
  })
}
