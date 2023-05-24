import Layer from 'ol/layer/Layer'
import { transformExtent } from 'ol/proj'
import { Point } from 'ol/geom'

import createREGL from 'regl'
import { getIiifTiles } from './lib/tiles'
import { loadImage, MAX_TEXTURE_SIZE, MAX_TILES } from './lib/textures'
import { createDrawCommand } from './lib/regl'

import potpack from 'potpack'

import { createTransformer, toWorld } from './transform'

export class WarpedMapLayer extends Layer {
  constructor (options) {
    options = options || {}

    super(options)

    this.warpedMap = options.georeferencedMap;
    this.cliped = options.cliped;

    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.width = '100%'
    container.style.height = '100%';
    if (options.opacity) {
      container.style.opacity = options.opacity;
    }
    container.classList.add('ol-layer')
    const canvas = document.createElement('canvas')
    canvas.style.width = '100%'
    canvas.style.height = '100%'

    container.appendChild(canvas)
    this.container = container;

    const regl = createREGL({
      extensions: ['OES_texture_float', 'WEBGL_depth_texture'],
      canvas,
      attributes: {
        antialias: true,
        preserveDrawingBuffer: true
      }
    })

    this.visible = true

    this.tiles = new Map()
    this.textureSize = [0, 0]
    this.texture = regl.texture()
    this.scaleFactors = regl.texture()
    this.tilePositions = regl.texture()
    this.imagePositions = regl.texture()

    this.canvas = canvas
    this.container = container

    this.regl = regl

    this.update(options.image, options.georeferencedMap)
  }

  update (image, georeferencedMap) {
    if (!image || !georeferencedMap) {
      return
    }

    this.image = image
    this.georeferencedMap = georeferencedMap

    // TODO: use all tileSets
    this.tileWidth = this.image.tiles[0].width
    this.tileHeight = this.image.tiles[0].height || this.tileWidth

    if (this.georeferencedMap && this.georeferencedMap.gcps) {
      try {
        this.transformArgs = createTransformer(this.georeferencedMap.gcps)
      } catch (err) {
        console.error(err)
      }
    }
  }

  fillArray (length, pixel = [0, 0, 0, 0]) {
    return Array.from({length}, () => pixel)
  }

  updateTexture () {
    const tiles = Array.from(this.tiles.values())
      .filter((tile) => !tile.loading)
      .map((tile) => ({
        ...tile,
        w: tile.tileWidth,
        h: tile.tileHeight
      }))

    this.tileCount = tiles.length

    if (this.tileCount === 0) {
      return
    } else if (this.tileCount > MAX_TILES) {
      throw new Error('too many tiles')
    }

    this.scaleFactors({
      width: this.tileCount,
      height: 1,
      data: [
        tiles.map((tile) => [tile.scaleFactor, 0, 0])
      ]
    })

    const {w: textureWidth, h: textureHeight} = potpack(tiles)

    if (Math.max(textureWidth, textureHeight) > MAX_TEXTURE_SIZE) {
      throw new Error('tile texture too large')
    }

    this.texture.resize(textureWidth, textureHeight)
    tiles.forEach((tile) => {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')

      canvas.width = tile.tileWidth
      canvas.height = tile.tileHeight
      
      if (this.cliped) {
        const pixelMask = this.warpedMap.pixelMask
        context.save()
        context.beginPath()

        const translateCoordinate = ([x, y]) => [
          (x - tile.regionX) / tile.scaleFactor,
          (y - tile.regionY) / tile.scaleFactor]

        context.moveTo(...translateCoordinate(pixelMask[0]))
        pixelMask.slice(1).forEach((point) => {
          // console.log(tile.scaleFactor, point, translateCoordinate(point))
          context.lineTo(...translateCoordinate(point))
        })


        context.closePath()
        context.clip()
      }

      context.drawImage(tile.tileImage, 0, 0)

      this.texture.subimage(canvas, tile.x, tile.y)
    })

    this.textureSize = [textureWidth, textureHeight]

    const tilePositions = tiles.map(({x, y}) => ([
      x / textureWidth,
      y / textureHeight,
      0
    ]))

    const imagePositions = tiles.map(({regionX, regionY, regionWidth, regionHeight}) => ([
      regionX / this.image.width,
      regionY / this.image.height,
      regionWidth / this.image.width,
      regionHeight / this.image.height
    ]))

    this.tilePositions({
      width: this.tileCount,
      height: 1,
      format: 'rgb',
      type: 'float',
      data: [
        tilePositions
      ]
    })

    this.imagePositions({
      width: this.tileCount,
      height: 1,
      format: 'rgba',
      type: 'float',
      data: [
        imagePositions
      ]
    })
  }

  async loadTile (tile) {
    const baseUrl = tile.baseUrl + '/'
    const url = baseUrl + tile.urlSuffix

    const tileImage = await loadImage(url)

    this.tiles.set(tile.id, {
      loading: false,
      tileImage,
      ...tile
    })

    this.updateTexture()
    this.getSource().refresh()
  }

  destroy () {
    if (this.texture) {
      this.texture.destroy()
    }

    if (this.imagePositions) {
      this.imagePositions.destroy()
    }

    if (this.tilePositions) {
      this.tilePositions.destroy()
    }

    if (this.scaleFactors) {
      this.scaleFactors.destroy()
    }

    if (this.regl) {
      this.regl.destroy()
    }
  }

  updateTiles (frameState) {
    if (!this.georeferencedMap) {
      return
    }

    //const transformedExtent = transformExtent(frameState.extent, 'EPSG:3857', 'EPSG:4326')
    const transformedExtent = transformExtent(frameState.extent, 'EPSG:900913', 'EPSG:4326')
    const iiifTiles = getIiifTiles(frameState.size, transformedExtent, this.georeferencedMap, this.image)

    const newTiles = new Map(iiifTiles.map((tile) => ([
      tile.id,
      tile
    ])))

    let tilesAdded = Array.from(newTiles.keys())
      .filter((id) => !this.tiles.has(id))

    let tilesRemoved = Array.from(this.tiles.keys())
      .filter((id) => !newTiles.has(id))

    if (tilesAdded.length) {
      tilesAdded.forEach((id) => {
        const tile = newTiles.get(id)

        this.tiles.set(id, {
          loading: true,
          ...tile
        })

        this.loadTile(tile)
      })
    }

    if (tilesRemoved.length) {
      tilesRemoved.forEach((id) => {
        if (this.tiles.has(id)) {
          this.tiles.delete(id)
        }
      })

      this.updateTexture()
    }
  }

  toLatLon (point) {
    return new Point(point)
    // .transform('EPSG:3857', 'EPSG:4326')
    .transform('EPSG:900913', 'EPSG:4326')
     .getCoordinates()
  }

  getCanvasSize () {
    const pixelRatio = Math.max(2, window.devicePixelRatio)
    const canvasWidth = Math.floor(this.container.clientWidth * pixelRatio)
    const canvasHeight = Math.floor(this.container.clientHeight * pixelRatio)
    return [canvasWidth, canvasHeight]
  }

  setVisible (visible) {
    this.visible = visible

    const source = this.getSource()
    if (source) {
      source.refresh()
    }
  }

  setCliped (cliped) {
    this.cliped = cliped

    this.updateTexture();
    const source = this.getSource()
    if (source) {
      source.refresh()
    }
  }

  setOpacity(opacity) {
    this.container.style.opacity = opacity;
    const source = this.getSource()
    if (source) {
      source.refresh()
    }
  }

  updateCanvasSize ([width, height]) {
    this.canvas.width = width
    this.canvas.height = height
  }

  render (frameState) {
    if (!this.image || !this.georeferencedMap) {
      return
    }

    const canvasSize = this.getCanvasSize()

    this.updateTiles(frameState)

    const extent = frameState.extent
    const southWest = [extent[0], extent[1]]
    const northEast = [extent[2], extent[3]]

    const props = {
      southWest: this.toLatLon(southWest),
      northEast: this.toLatLon(northEast),
      tileCount: this.tileCount || 0,
      textureSize: this.textureSize,
      visible: this.visible
    }

    let resized = false

    if (!this.canvasSize || this.canvasSize[0] !== canvasSize[0] || this.canvasSize[1] !== canvasSize[1]) {
      this.updateCanvasSize(canvasSize)
      resized = true
    }

    const imageSize = [this.image.width, this.image.height]
    const tileSize = [this.tileWidth, this.tileHeight]

    if (this.transformArgs && resized) {
      this.draw = createDrawCommand(
        this.regl,
        MAX_TILES,
        canvasSize, imageSize, tileSize,
        this.texture, this.imagePositions, this.tilePositions, this.scaleFactors,
        this.transformArgs)
    }

    if (this.draw) {
      this.draw(props)
    }

    this.canvasSize = canvasSize

    return this.container
  }
}
