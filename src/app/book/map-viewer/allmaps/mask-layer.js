<template>
//   <div class="container">
//     <Maps :maps="maps" :bus="bus" :selectedMapId="selectedMapId" />
//     <div id="iiif" class="iiif"></div>
//   </div>
// </template>

// <script>
// import Maps from './Maps.vue'

// import Map from 'ol/Map'
// import Feature from 'ol/Feature'
// import View from 'ol/View'
// import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer'
// import {Draw, Modify} from 'ol/interaction'
// import {Polygon} from 'ol/geom'
// import {shiftKeyOnly} from 'ol/events/condition'
// import {Vector as VectorSource} from 'ol/source'
// import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style'
// import IIIF from 'ol/source/IIIF'
// import IIIFInfo from 'ol/format/IIIFInfo'

// import {round} from '../lib/functions'
// import {randomId} from '../lib/id'
// import {deleteCondition} from '../lib/openlayers'

// export default {
//   name: 'PixelMask',
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
//       iiifOl: undefined,
//       iiifSource: undefined,
//       iiifLayer: undefined,
//       iiifVector: undefined,

//       pixelMasks: undefined,
//       dimensions: undefined
//     }
//   },
//   watch: {
//     showAnnotation: function () {
//       window.setTimeout(this.onResize, 100)
//     },
//     image: function () {
//       this.updateImage(this.image)
//     },
//     maps: function () {
//       if (this.differentSource()) {
//         this.updatePixelMasks(this.maps)
//       }
//     }
//   },
//   methods: {
//     differentSource: function () {
//       return this.lastMapsUpdateSource !== this.$options.name
//     },
//     onResize: function () {
//       if (this.iiifOl) {
//         this.iiifOl.updateSize()
//       }
//     },
//     updatePixelMasks: function (maps) {
//       this.iiifSource.clear()

//       if (maps && Object.keys(maps).length) {
//         Object.entries(maps)
//           .forEach(([id, map]) => {
//             const feature = new Feature({
//               geometry: new Polygon(this.maskToPolygon(map.pixelMask))
//             })

//             feature.setId(id)

//             this.iiifSource.addFeature(feature)
//           })
//       }
//     },
//     createMap: function (feature) {
//       const id = feature.getId()
//       const polygon = feature.getGeometry().getCoordinates()
//       const pixelMask = this.polygonToMask(polygon)

//       return {
//         id,
//         map: {
//           imageId: this.image.id,
//           pixelMask
//         }
//       }
//     },
//     onEdited: function (event) {
//       const maps = {}

//       if (event.type === 'addfeature') {
//         const feature = event.feature

//         if (feature.getId()) {
//           return
//         }

//         feature.setId(randomId())

//         const {id, map} = this.createMap(feature)
//         maps[id] = map
//       } else if (event.type === 'modifyend') {
//         event.features.forEach((feature) => {
//           const {id, map} = this.createMap(feature)
//           maps[id] = map
//         })
//       }

//       this.bus.$emit('maps-update', {
//         source: this.$options.name,
//         maps
//       })
//     },
//     updateImage: function (image) {
//       if (!image) {
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
//     polygonToMask: function (polygon, dimensions = [1, 1]) {
//       return polygon[0].map((coordinate) => ([
//         coordinate[0] / dimensions[0],
//         -coordinate[1] / dimensions[1]
//       ].map((coordinate) => round(coordinate, 0))))
//     },
//     maskToPolygon: function (mask, dimensions = [1, 1]) {
//       return [
//         mask.map((coordinate) => ([
//           coordinate[0] * dimensions[0],
//           -coordinate[1] * dimensions[1]
//         ]))
//       ]
//     },
//     // clearMask: function () {
//     //   source.clear()
//     //   updateMask()
//     // }
//     emptyMask: function () {
//       // return this.pixelMask === undefined || this.pixelMask.length === 0
//     }
//   },
//   mounted: function () {
//     this.iiifLayer = new TileLayer()
//     this.iiifSource = new VectorSource()

//     this.iiifVector = new VectorLayer({
//       source: this.iiifSource,
//       style: new Style({
//         stroke: new Stroke({
//           color: '#E10800',
//           width: 3
//         }),
//         image: new CircleStyle({
//           radius: 7,
//           fill: new Fill({
//             color: '#E10800'
//           })
//         })
//       })
//     })

//     this.iiifOl = new Map({
//       layers: [this.iiifLayer, this.iiifVector],
//       target: 'iiif'
//     })

//     const iiifModify = new Modify({
//       source: this.iiifSource,
//       deleteCondition
//     })
//     this.iiifOl.addInteraction(iiifModify)

//     const iiifDraw = new Draw({
//       source: this.iiifSource,
//       type: 'Polygon',
//       freehandCondition: (event) => {
//         return this.emptyMask() && shiftKeyOnly(event)
//       },
//       // condition: () => {
//       //   return this.emptyMask()
//       // }
//     })

//     this.iiifOl.addInteraction(iiifDraw)

//     this.iiifSource.on('addfeature', this.onEdited)
//     iiifModify.on('modifyend', this.onEdited)

//     this.updateImage(this.image)
//     this.updatePixelMasks(this.maps)
//   }
// }
// </script>

// <style scoped>
// .container {
//   width: 100%;
//   height: 100%;
//   display: flex;
//   flex-direction: row;
// }

// #iiif {
//   width: 100%;
//   height: 100%;
//   padding: 2px;
// }
// </style>
