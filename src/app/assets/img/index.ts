import screenMockup from "./screen-mockup-replace-fill.png";


const images = {
  screenMockup
}

type Images = typeof images
function processImageUrls() {

  Object.keys(images).forEach((key) => {
    const k: keyof Images = key as keyof Images
    images[k] = new URL(images[k], import.meta.url).href
  })

  return images
}

processImageUrls()



export default images

