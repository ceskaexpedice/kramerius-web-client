import { tile } from 'd3-tile'
import { geoMercator } from 'd3-geo'
import { uniqWith } from 'ramda'

import { createTransformer, toImage } from '../transform/dist/cjs'

const mapTileSize = 256

export function getIiifTiles (size, extent, map, image) {
  const imageSize = [image.width, image.height]
  const [width, height] = size

  const polygon = extentToPolygon(extent)

  const projection = geoMercator()
    .fitSize([width, height], polygon)

  const mapTiles = tile()
    .tileSize(mapTileSize)
    .size([width, height])
    .scale(projection.scale() * 2 * Math.PI)
    .translate(projection([0, 0]))()

  const transformArgs = createTransformer(map.gcps)

  const pixelMapTiles = mapTiles
    .map((tile) => tileExtent(tile))
    .map(([y1, x1, y2, x2]) => ([
      [y1, x1],
      [y1, x2],
      [y2, x2],
      [y2, x1]
    ].map((point) => toImage(transformArgs, point))))
    .map((tile) => tile.map(([x, y]) => ({x, y})))

  const iiifTilesets = getIiifTilesets(image)
  const neededIiifTiles = getNeededIiifTiles(pixelMapTiles, iiifTilesets, imageSize)

  return neededIiifTiles
    .map((tile) => getIiifTile(image, tile.x, tile.y, tile))
    .map((tile) => ({
      id: `${image.id}:${tile.urlSuffix}`,
      ...tile,
      mapId: map.id,
      imageId: image.id
    }))
}

function extentToPolygon (extent) {
  return {
    type: 'Polygon',
    coordinates: [
      [
        [extent[0], extent[1]],
        [extent[0], extent[3]],
        [extent[2], extent[3]],
        [extent[2], extent[1]],
        [extent[0], extent[1]]
      ]
    ]
  }
}

function tileExtent ([x, y, z]) {
  return [...tileToLonLat([x, y, z]), ...tileToLonLat([x + 1, y + 1, z])]
}

function tileToLonLat ([x, y, z]) {
  const n = Math.PI - 2 * Math.PI * y / Math.pow(2, z)
  const longitude = x / Math.pow(2, z) * 360 - 180
  const latitude = 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)))

  return [longitude, latitude]
}

function getIiifTile (image, x, y, tileset) {
  // See https://iiif.io/api/image/3.0/implementation/#3-tile-region-parameter-calculation

  const imageSize = [image.width, image.height]

  const regionX = x * tileset.originalWidth
  const regionY = y * tileset.originalHeight
  const regionWidth = x * tileset.originalWidth + tileset.width * tileset.scaleFactor > imageSize[0]
    ? imageSize[0] - x * tileset.originalWidth : tileset.width * tileset.scaleFactor
  const regionHeight = y * tileset.originalHeight + tileset.height * tileset.scaleFactor > imageSize[1]
    ? imageSize[1] - y * tileset.originalHeight : tileset.height * tileset.scaleFactor

  let tileWidth = tileset.width
  let tileHeight = tileset.height

  if (regionX + tileset.width * tileset.scaleFactor > imageSize[0]) {
    tileWidth = Math.floor((imageSize[0] - regionX + tileset.scaleFactor - 1) / tileset.scaleFactor)
  }

  if (regionY + tileset.height * tileset.scaleFactor > imageSize[1]) {
    tileHeight = Math.floor((imageSize[1] - regionY + tileset.scaleFactor - 1) / tileset.scaleFactor)
  }

  const baseUrl = image['@id']

  return {
    regionX,
    regionY,
    regionWidth,
    regionHeight,
    tileWidth,
    tileHeight,
    scaleFactor: tileset.scaleFactor,
    baseUrl,
    urlSuffix: getIiifTileUrlSuffix({
      tileset,
      regionX, regionY,
      regionWidth, regionHeight,
      tileWidth, tileHeight
    })
  }
}

function getIiifTileUrlSuffix (tile) {
  // const tileset = tile.tileset
  const region = `${tile.regionX},${tile.regionY},${tile.regionWidth},${tile.regionHeight}`

  let size
  // if (tile.tileWidth === tile.tileHeight) {
  //   size = `${tile.tileWidth},`
  // } else {
  //   size = `${tile.tileWidth},${tile.tileHeight}`
  // }
  // console.log(tile)
  // if (tile.tileHeight !== tileset.height) {
  //   size = `${tile.tileWidth},${tile.tileHeight}`
  // } else {
  //   size = `${tile.tileWidth},`
  // }

  size = `${tile.tileWidth},`

  return `${region}/${size}/0/default.jpg`
}

function getIiifTilesets (image) {
  return image.tiles.map((tileset) => tileset.scaleFactors
    .map((scaleFactor) => ({
      scaleFactor,
      width: tileset.width,
      height: tileset.height || tileset.width,
      originalWidth: tileset.width * scaleFactor,
      originalHeight: (tileset.height || tileset.width) * scaleFactor
    }))).flat()
}

function getNeededIiifTiles (pixelMapTiles, iiifTilesets, imageSize) {

  const allNeededIiifTiles = pixelMapTiles.map((pixelMapTile) => {
    const minX = Math.min(...pixelMapTile.map((point) => point.x))
    const maxX = Math.max(...pixelMapTile.map((point) => point.x))
    const minY = Math.min(...pixelMapTile.map((point) => point.y))
    const maxY = Math.max(...pixelMapTile.map((point) => point.y))

    const width = maxX - minX
    const height = maxY - minY

    const scaleDiffs = iiifTilesets
      .map((iiifTileset, index) => {
        const iiifTileScale = iiifTileset.scaleFactor
        const mapTileScale = Math.max(width, height) / mapTileSize
        return { scaleDiff: Math.abs(iiifTileScale - mapTileScale), index }
      })
      .sort((a, b) => a.scaleDiff - b.scaleDiff)

    const bestIiifTileSet = iiifTilesets[scaleDiffs[0].index]

    const minTileX = Math.floor(minX / bestIiifTileSet.originalWidth)
    const maxTileX = Math.ceil(maxX / bestIiifTileSet.originalWidth)
    const minTileY = Math.floor(minY / bestIiifTileSet.originalHeight)
    const maxTileY = Math.ceil(maxY / bestIiifTileSet.originalHeight)

    const tileXs = Array.from({length: maxTileX - minTileX}, (_, index) => minTileX + index)
    const tileYs = Array.from({length: maxTileY - minTileY}, (_, index) => minTileY + index)

    return tileXs.map((x) => tileYs.map((y) => ({
      x,
      y,
      ...bestIiifTileSet
    })))
  }).flat(2).filter((iiifTile) => {
    if (iiifTile.x < 0 || iiifTile.y < 0) {
      return false
    }

    if (iiifTile.x * iiifTile.originalWidth >= imageSize[0] ||
      iiifTile.y * iiifTile.originalHeight >= imageSize[1]) {
      return false
    }

    return true
  })

  return uniqWith((a, b) =>
    a.x === b.x && a.y === b.y &&
      a.scaleFactor === b.scaleFactor, allNeededIiifTiles)
}
