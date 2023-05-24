import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import IIIF from 'ol/source/IIIF'
import IIIFInfo from 'ol/format/IIIFInfo'

function createIIIFTileSource (image) {
  const options = new IIIFInfo(image).getTileSourceOptions()
  if (options === undefined || options.version === undefined) {
    throw new Error('Data seems to be no valid IIIF image information.')
  }

  options.zDirection = -1
  return new IIIF(options)
}

export class IIIFLayer extends TileLayer {
  constructor (image) {
    super()

    const iiifTileSource = createIIIFTileSource(image)
    this.setSource(iiifTileSource)
  }

  getExtent () {
    return this.getSource().getTileGrid().getExtent()
  }

  getView () {
    return new View({
      resolutions: this.getSource().getTileGrid().getResolutions(),
      extent: this.getExtent(),
      constrainOnlyCenter: true
      // enableRotation: false
    })
  }
}
