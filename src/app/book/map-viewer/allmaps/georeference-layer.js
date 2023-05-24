<template>
//   <div id="georeference">
//     <Maps :maps="maps" :bus="bus" :selectedMapId="selectedMapId" showGcps />
//     <div id="iiif" class="iiif"></div>
//     <div id="map" class="map"></div>
//   </div>
// </template>

// <script>
// import Maps from './Maps.vue'

// import Map from 'ol/Map'
// import Feature from 'ol/Feature'
// import View from 'ol/View'
// import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer'
// import {Draw, Modify} from 'ol/interaction'
// import {Point} from 'ol/geom'
// import {GeoJSON} from 'ol/format'
// import {getRenderPixel} from 'ol/render'
// // import {shiftKeyOnly, singleClick, primaryAction} from 'ol/events/condition'
// import {OSM, Vector as VectorSource} from 'ol/source'
// import {Circle as CircleStyle, Fill, Stroke, Style, Text} from 'ol/style'
// import IIIF from 'ol/source/IIIF'
// import IIIFInfo from 'ol/format/IIIFInfo'
// import {fromLonLat, toLonLat} from 'ol/proj'

// import {deleteCondition} from '../lib/openlayers'

// export default {
//   name: 'Georeference',
//   props: {
//     image: Object,
//     maps: Object,
//     bus: Object,
//     showAnnotation: Boolean,
//     selectedMapId: String,
//     lastMapsUpdateSource: String
//   },
//   components: {
//     Maps
//   },
//   data () {
//     return {
//       iiifCoordinates: [],
//       mapCoordinates: [],

//       iiifOl: undefined,
//       iiifSource: undefined,
//       iiifLayer: undefined,
//       iiifVector: undefined,

//       mapOl: undefined,
//       mapSource: undefined,
//       mapLayer: undefined,
//       mapVector: undefined,

//       dimensions: undefined
//     }
//   },
//   watch: {
//     selectedMapId: function () {
//       this.iiifSource.changed()
//       this.updateGCPs(this.maps)
//     },
//     showAnnotation: function () {
//       window.setTimeout(this.onResize, 100)
//     },
//     image: function () {
//       this.updateImage(this.image)
//     },
//     maps: function () {
//       if (this.differentSource()) {
//         this.updateGCPs(this.maps)
//       }
//     }
//   },
//   methods: {
//     prerender: function (event) {
//       if (this.pixelMasks.length === 0) {
//         return
//       }

//       const ctx = event.context
//       ctx.save()
//       ctx.beginPath()

//       const contextMask = this.selectedMap.pixelMask
//         .map((point) => this.iiifOl.getPixelFromCoordinate([point[0], -point[1]]))

//       ctx.moveTo(contextMask[0][0], contextMask[0][1])
//       contextMask.slice(1).forEach((point) => {
//         ctx.lineTo(point[0], point[1])
//       })

//       ctx.closePath()
//       ctx.clip()
//     },
//     postrender: function (event) {
//       const ctx = event.context
//       ctx.restore()
//     },
//     round: function (num, decimals = 6) {
//       const p = 10 ** decimals
//       return Math.round((num + Number.EPSILON) * p) / p
//     },
//     differentSource: function () {
//       return this.lastMapsUpdateSource !== this.$options.name
//     },
//     onResize: function () {
//       if (this.iiifOl && this.mapOl) {
//         this.iiifOl.updateSize()
//         this.mapOl.updateSize()
//       }
//     },
//     pointDifference: function () {
//       const iiifCoordinates = this.iiifCoordinates || []
//       const mapCoordinates = this.mapCoordinates || []

//       return iiifCoordinates.length - mapCoordinates.length
//     },
//     updateGCPs: function (maps) {
//       this.mapSource.clear()
//       this.iiifSource.clear()

//       const gcps = (this.selectedMap && this.selectedMap.gcps) || []

//       const iiifCoordinates = gcps.map((gcp) => gcp.pixel)
//       const mapCoordinates = gcps.map((gcp) => gcp.world)

//       this.iiifCoordinates = iiifCoordinates
//       this.mapCoordinates = mapCoordinates

//       if (!gcps || gcps.length === 0) {
//         return
//       }

//       if (this.pointDifference() === 0) {
//         this.iiifSource.addFeatures(this.iiifCoordinates.map((coordinates, index) => new Feature({
//           index,
//           geometry: new Point([
//             coordinates[0],
//             -coordinates[1]
//           ])
//         })))

//         this.mapSource.addFeatures(this.mapCoordinates.map((coordinates, index) => (new GeoJSON()).readFeature({
//           type: 'Feature',
//           properties: {
//             index
//           },
//           geometry: {
//             type: 'Point',
//             coordinates
//           }
//         }, { featureProjection: 'EPSG:3857' })))

//         if (!this.lastMapsUpdateSource) {
//           const extent = this.mapSource.getExtent()
//           this.mapOl.getView().fit(extent, {
//             padding: [25, 25, 25, 25],
//             maxZoom: 18
//           })
//         }
//       }
//     },
//     onEdited: function (event) {
//       if (event.type === 'addfeature') {
//         const feature = event.feature
//         const properties = feature.getProperties()

//         if (properties.index === undefined) {
//           const index = (this.selectedMap.gcps && this.selectedMap.gcps.length) || 0
//           feature.setProperties({
//             index
//           })
//         }
//       }

//       const iiifFeatures = this.iiifVector.getSource().getFeatures()
//       const mapFeatures = this.mapVector.getSource().getFeatures()

//       if (iiifFeatures.length) {
//         const iiifCoordinates = iiifFeatures
//           .map((feature) => {
//             const coordinate = feature.getGeometry().getCoordinates()
//             return [
//               Math.round(coordinate[0]),
//               Math.round(-coordinate[1])
//             ]
//           })

//         this.iiifCoordinates = iiifCoordinates
//       }

//       if (mapFeatures.length) {
//         const mapCoordinates = mapFeatures
//           .map((feature) => {
//             const geometry = feature.getGeometry().clone()
//             geometry.transform('EPSG:3857', 'EPSG:4326')
//             return geometry.getCoordinates()
//               .map((coordinate) => this.round(coordinate))
//           })

//         this.mapCoordinates = mapCoordinates
//       }

//       if (this.pointDifference() === 0) {
//         const gcps = this.iiifCoordinates.map((iiifCoordinate, index) => ({
//           pixel: iiifCoordinate,
//           world: this.mapCoordinates[index]
//         }))

//         if (this.selectedMapId) {
//           const maps = {
//             [this.selectedMapId]: {
//               gcps
//             }
//           }

//           this.bus.$emit('maps-update', {
//             source: this.$options.name,
//             maps
//           })
//         } else {
//           console.error('SELECT OR CREATE MAP!')
//         }
//       }
//     },
//     updateImage: function (image) {
//       if (!image || !image.iiif) {
//         return
//       }

//       const options = new IIIFInfo(image.iiif).getTileSourceOptions()
//       if (options === undefined || options.version === undefined) {
//         throw new Error('Data seems to be no valid IIIF image information.')
//       }

//       options.zDirection = -1
//       const iiifTileSource = new IIIF(options)
//       this.iiifLayer.setSource(iiifTileSource)

//       const extent = iiifTileSource.getTileGrid().getExtent()

//       this.dimensions = [extent[2], -extent[1]]

//       this.iiifOl.setView(new View({
//         resolutions: iiifTileSource.getTileGrid().getResolutions(),
//         extent,
//         constrainOnlyCenter: true
//       }))

//       this.iiifOl.getView().fit(iiifTileSource.getTileGrid().getExtent())
//     },
//     gcpStyle: function (feature) {
//       return new Style({
//         stroke: new Stroke({
//           color: '#E10800',
//           width: 3
//         }),
//         image: new CircleStyle({
//           radius: 7,
//           fill: new Fill({
//             color: '#E10800'
//           })
//         }),
//         text: this.gcpTextStyle(feature)
//       })
//     },
//     gcpTextStyle: function (feature) {
//       return new Text({
//         scale: 1.5,
//         text: this.gcpLabel(feature),
//         fill: new Fill({color: '#000'}),
//         stroke: new Stroke({color: '#fff', width: 2}),
//         offsetX: 14,
//         offsetY: 14
//       })
//     },
//     gcpLabel: function (feature) {
//       const properties = feature.getProperties()
//       return String(properties.index + 1)
//     }
//   },
//   computed: {
//     selectedMap: function () {
//       return this.maps[this.selectedMapId]
//     },
//     pixelMasks: function () {
//       return Object.values(this.maps).map((map) => map.pixelMask)
//         .filter((pixelMask) => pixelMask.length)
//     }
//   },
//   mounted: function () {
//     this.iiifLayer = new TileLayer()
//     this.iiifSource = new VectorSource()

//     this.iiifVector = new VectorLayer({
//       source: this.iiifSource,
//       style: this.gcpStyle
//     })

//     this.iiifOl = new Map({
//       layers: [this.iiifLayer, this.iiifVector],
//       target: 'iiif'
//     })

//     this.mapLayer = new TileLayer({
//       source: new OSM()
//     })
//     this.mapSource = new VectorSource()

//     this.mapVector = new VectorLayer({
//       source: this.mapSource,
//       style: this.gcpStyle
//     })

//     this.mapOl = new Map({
//       layers: [this.mapLayer, this.mapVector],
//       target: 'map',
//       view: new View({
//         center: fromLonLat([-77.036667, 38.895]),
//         zoom: 3
//       })
//     })

//     const iiifModify = new Modify({
//       source: this.iiifSource,
//       deleteCondition
//     })

//     const mapModify = new Modify({
//       source: this.mapSource,
//       deleteCondition
//     })

//     this.iiifOl.addInteraction(iiifModify)
//     this.mapOl.addInteraction(mapModify)

//     const iiifDraw = new Draw({
//       source: this.iiifSource,
//       type: 'Point',
//       condition: () =>
//         this.pointDifference() === 0 || this.pointDifference() === -1
//     })

//     const mapDraw = new Draw({
//       source: this.mapSource,
//       type: 'Point',
//       condition: () =>
//         this.pointDifference() === 0 || this.pointDifference() === 1
//     })

//     this.iiifOl.addInteraction(iiifDraw)

//     this.mapOl.addInteraction(mapDraw)

//     this.iiifSource.on('addfeature', this.onEdited)
//     iiifModify.on('modifyend', this.onEdited)

//     this.mapSource.on('addfeature', this.onEdited)
//     mapModify.on('modifyend', this.onEdited)

//     this.iiifLayer.on('prerender', this.prerender)
//     this.iiifLayer.on('postrender', this.postrender)

//     this.updateImage(this.image)
//     this.updateGCPs(this.maps)
//   }
// }
// </script>

// <style scoped>
// #georeference {
//   display: flex;
//   flex-direction: row;
// }

// #georeference > * {
//   width: 50%;
//   padding: 2px;
//   box-sizing: border-box;
// }
// </style>
