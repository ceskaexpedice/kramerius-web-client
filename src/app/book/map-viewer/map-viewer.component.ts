import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import Map from 'ol/Map'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { Fill, Stroke, Style } from 'ol/style'
import { GeoJSON } from 'ol/format'
import XYZ from 'ol/source/XYZ'
import View from 'ol/View';
import { transformExtent } from 'ol/proj'
import { Point } from 'ol/geom'

import OSM, { ATTRIBUTION } from 'ol/source/OSM';
import { HttpClient } from '@angular/common/http';
import { GeoreferenceService } from '../../services/georeference.service';
import { ViewerActions, ViewerControlsService } from '../../services/viewer-controls.service';
import { Subscription } from 'rxjs';


const transformA = require('./allmaps/transform');
const { createTransformer, toWorld } = transformA

const layers = require('./allmaps/warped-map-layer');
const { WarpedMapLayer } = layers

// import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-map-viewer',
  templateUrl: './map-viewer.component.html',
  styleUrls: ['./map-viewer.component.scss']
})
export class MapViewerComponent implements OnInit, OnChanges {

  @Input() uuid: string = '';
  @Input() data: any;

  private viewerActionsSubscription: Subscription;

  opacity = .8;
  isShowMap = true;
  cliped = true;
  ol: Map | undefined;
  warpedMapLayer: any;
  vectorSource: any;
  vectorLayer: any;
  xyz: any;
  baseLayer: any;
  map: any = {};

  // geoInfo1: any = {
  //   "type": "AnnotationPage",
  //   "@context": [
  //     "http://geojson.org/geojson-ld/geojson-context.jsonld",
  //     "http://iiif.io/api/presentation/3/context.json"
  //   ],
  //   "items": [
  //     {
  //       "type": "Annotation",
  //       "@context": [
  //         "http://geojson.org/geojson-ld/geojson-context.jsonld",
  //         "http://iiif.io/api/presentation/3/context.json"
  //       ],
  //       "motivation": "georeference",
  //       "target": {
  //         "type": "Image",
  //         "source": "https://kramerius.mzk.cz/search/iiif/uuid:2a5b0e80-d92c-4cd3-b9b2-9e855efb7af9/full/full/0/default.jpg",
  //         "service": [
  //           {
  //             "@id": "https://kramerius.mzk.cz/search/iiif/uuid:2a5b0e80-d92c-4cd3-b9b2-9e855efb7af9",
  //             "type": "ImageService2",
  //             "profile": "http://iiif.io/api/image/2/level2.json"
  //           }
  //         ],
  //         "selector": {
  //           "type": "SvgSelector",
  //           "value": "<svg width=\"8641\" height=\"7114\"><polygon points=\"3560,2192 2804,2853 2795,3250 2209,3259 1500,4119 1000,5517 1293,6113 3343,6339 5279,6396 7358,4601 7452,2891 6479,1342 5468,1578 5723,1285 5383,1162 4618,1719 4051,1257 3626,1379 3560,2192\" /></svg>"
  //         }
  //       },
  //       "body": {
  //         "type": "FeatureCollection",
  //         "features": [
  //           {
  //             "type": "Feature",
  //             "id": "AJ6vwZLqUxsRZJT4",
  //             "properties": {
  //               "image": [
  //                 3342,
  //                 5359
  //               ]
  //             },
  //             "geometry": {
  //               "type": "Point",
  //               "coordinates": [
  //                 16.3138749,
  //                 49.0446249
  //               ]
  //             }
  //           },
  //           {
  //             "type": "Feature",
  //             "id": "AUhXPbrP6kV13ViP",
  //             "properties": {
  //               "image": [
  //                 3510,
  //                 5148
  //               ]
  //             },
  //             "geometry": {
  //               "type": "Point",
  //               "coordinates": [
  //                 16.3708282,
  //                 49.0992259
  //               ]
  //             }
  //           },
  //           {
  //             "type": "Feature",
  //             "id": "f1yL1DhrM2P9bkJK",
  //             "properties": {
  //               "image": [
  //                 1282,
  //                 5285
  //               ]
  //             },
  //             "geometry": {
  //               "type": "Point",
  //               "coordinates": [
  //                 15.4520595,
  //                 49.1843039
  //               ]
  //             }
  //           },
  //           {
  //             "type": "Feature",
  //             "id": "xx1ZWnSTUetGN1vz",
  //             "properties": {
  //               "image": [
  //                 4455,
  //                 4857
  //               ]
  //             },
  //             "geometry": {
  //               "type": "Point",
  //               "coordinates": [
  //                 16.8816463,
  //                 49.1527884
  //               ]
  //             }
  //           },
  //           {
  //             "type": "Feature",
  //             "id": "A5WbkxaTgvR6wQ77",
  //             "properties": {
  //               "image": [
  //                 5265,
  //                 3985
  //               ]
  //             },
  //             "geometry": {
  //               "type": "Point",
  //               "coordinates": [
  //                 17.3057566,
  //                 49.3493868
  //               ]
  //             }
  //           }
  //         ]
  //       }
  //     }
  //   ]
  // };

  constructor(
    public controlsService: ViewerControlsService,
    private geoService: GeoreferenceService) {
    this.viewerActionsSubscription = this.controlsService.viewerActions().subscribe((action: ViewerActions) => {
      this.onActionPerformed(action);
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    if (this.viewerActionsSubscription) {
      this.viewerActionsSubscription.unsubscribe();
    }
  }

  initMap() {

    this.baseLayer = new TileLayer({
      source: new OSM(),
    });


    this.vectorSource = new VectorSource()
    this.vectorLayer = new VectorLayer({
      source: this.vectorSource,
      style: new Style({
        stroke: new Stroke({
          color: 'rgb(0, 0, 79)',
          width: 2
        })
      })
    })
    this.vectorLayer.setZIndex(100);
    this.ol = new Map({
      // layers: [this.baseLayer, this.vectorLayer],
      layers: [this.baseLayer],
      target: 'geo_ol',
      controls: [],
      view: new View({
        enableRotation: false,
        minZoom: 6,
        maxZoom: 20,
        zoom: 12
      })
    });

    // this.setMap();

  }

  ngOnChanges(c: SimpleChanges) {
    if (!this.ol) {
      this.initMap();
    }
    if (c.uuid) {
      this.setMap();
    }
  }

  setMap() {
    console.log(this.ol)
    //if (this.uuid) {
    //this.geoService.getGeoreference(this.uuid).subscribe((res: any) => {
    const image_url = this.data.image_url.replace('info.json', '');
    this.map = {};
    this.map.pixelMask = this.data.georefereces.cutline;
    this.map.image = { uri: image_url, dimensions: [0, 0] };
    this.map.gcps = [];

    const features: any = [];
    this.data.georefereces.gcps.forEach((c: any) => {
      this.map.gcps.push({
        image: c.pixel,
        // world: transform(c.location, 'EPSG:4326', 'EPSG:3857')
        world: c.location
      })
    });

    if (this.map) {
      this.updateMap(this.map);
    }

    //})
    //}

  }

  updateMap(map: any) {
    if (this.warpedMapLayer && this.ol) {
      this.ol.removeLayer(this.warpedMapLayer)
      this.ol.removeLayer(this.vectorLayer)
    }
    if (this.ol) {
      // this.vectorSource.clear();
      this.vectorSource = new VectorSource();
      this.vectorLayer = new VectorLayer({
        source: this.vectorSource,
        style: new Style({
          stroke: new Stroke({
            color: 'rgb(0, 0, 79)',
            width: 2
          })
        })
      })
      this.vectorLayer.setZIndex(100);
      const transformArgs = createTransformer(map.gcps)
      const polygon = map.pixelMask.map((point: any) => {
        return toWorld(transformArgs, point);
      });

      const geoMask = {
        type: 'Polygon',
        coordinates: [polygon]
      }
      //this.vectorSource.addFeature((new GeoJSON()).readFeature(geoMask, { dataProjection: 'EPSG:900913', featureProjection: 'EPSG:3857' }));
      this.vectorSource.addFeature((new GeoJSON()).readFeature(geoMask, { featureProjection: 'EPSG:900913' }));
      const imageUri = map.image.uri;
      this.fetchImage(imageUri, map);

    }
  }

  fetchImage(imageUri: string, map: any) {
    fetch(`${imageUri}/info.json`).then(response => {
      response
        .json()
        .then(image => {
          map.image.dimensions = [image.width, image.height];
          const options = {
            image,
            georeferencedMap: map,
            opacity: this.opacity,
            cliped: this.cliped,
            source: new VectorSource()
          }
          // console.log(this.map)
          this.warpedMapLayer = new WarpedMapLayer(options)

          this.ol!.addLayer(this.warpedMapLayer);
          //this.ol!.addLayer(this.vectorLayer);

          const extent = this.vectorSource.getExtent();
          this.ol!.getView().fit(extent, {
            // TODO: move to settings file
            padding: [20, 20, 20, 20],
            maxZoom: 24
          })
        })
    });
  }

  setOpacity() {
    this.warpedMapLayer.setOpacity(this.opacity)
  }

  showMap() {
    this.warpedMapLayer.setVisible(this.isShowMap)
  }

  changeCliped() {
    this.warpedMapLayer.setCliped(this.cliped)
  }


  private onActionPerformed(action: ViewerActions) {
    switch (action) {
      case ViewerActions.zoomIn:
        this.zoomIn();
        break;
      case ViewerActions.zoomOut:
        this.zoomOut();
        break;
      case ViewerActions.fitToScreen:
        this.fitToScreen();
        break;
    }
  }

  private fitToScreen() {
    this.ol.updateSize();
    this.ol.getView().setRotation(0);
    // this.ol.getView().fit(this.extent);
  }

  private zoomIn() {
    const currentZoom = this.ol.getView().getResolution();
    let newZoom = currentZoom / 1.5;
    this.ol.getView().animate({
      resolution: newZoom,
      duration: 300
    });
  }

  private zoomOut() {
    const currentZoom = this.ol.getView().getResolution();
    let newZoom = currentZoom * 1.5;
    this.ol.getView().animate({
      resolution: newZoom,
      duration: 300
    });
  }

}
