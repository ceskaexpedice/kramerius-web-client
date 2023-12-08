import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import Map from 'ol/Map'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { Stroke, Style } from 'ol/style'
import { GeoJSON } from 'ol/format'
import View from 'ol/View';

import OSM from 'ol/source/OSM';
import { ViewerActions, ViewerControlsService } from '../../services/viewer-controls.service';
import { Subscription } from 'rxjs';
import { KrameriusApiService } from '../../services/kramerius-api.service';


const transformA = require('./allmaps/transform');
const { createTransformer, toWorld } = transformA

const layers = require('./allmaps/warped-map-layer');
const { WarpedMapLayer } = layers

@Component({
  selector: 'app-map-viewer',
  templateUrl: './map-viewer.component.html',
  styleUrls: ['./map-viewer.component.scss']
})
export class MapViewerComponent implements OnInit, OnChanges {

  @Input() uuid: string = '';
  @Input() data: any;

  private viewerActionsSubscription: Subscription;

  isShowMap = true;
  cliped = true;
  ol: Map | undefined;
  warpedMapLayer: any;
  vectorSource: any;
  vectorLayer: any;
  xyz: any;
  baseLayer: any;
  map: any = {};

  constructor(
    private api: KrameriusApiService,
    public controlsService: ViewerControlsService) {
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
    //if (this.uuid) {
    //this.geoService.getGeoreference(this.uuid).subscribe((res: any) => {
    // const image_url = this.data.image_url.replace('info.json', '');
    const image_url = this.api.getIiifBaseUrl(this.uuid);
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
            opacity: this.controlsService.geoLayerOpacity,
            cliped: this.cliped,
            source: new VectorSource()
          }
          // console.log(this.map)
          this.warpedMapLayer = new WarpedMapLayer(options)

          this.ol!.addLayer(this.warpedMapLayer);
          //this.ol!.addLayer(this.vectorLayer);

          // const extent = this.vectorSource.getExtent();
          this.fitToScreen();
          // this.ol!.getView().fit(extent, {
          //   // TODO: move to settings file
          //   padding: [20, 20, 20, 20],
          //   maxZoom: 24
          // });
        })
    });
  }

  setOpacity() {
    this.warpedMapLayer.setOpacity(this.controlsService.geoLayerOpacity)
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
      case ViewerActions.cromMap:
        this.cliped = !this.cliped;
        this.changeCliped();
        break;
      case ViewerActions.hideWarpedLayer:
        this.isShowMap = !this.isShowMap;
        this.showMap()
        break;
      case ViewerActions.setWarpedLayerOpacity:
        this.setOpacity();
        break;
    }
  }

  private fitToScreen() {
    this.ol.updateSize();
    this.ol.getView().setRotation(0);
    // this.ol.getView().fit(this.vectorSource.getExtent());

    this.ol.getView().fit(this.vectorSource.getExtent());
    // , {
        // TODO: move to settings file
        // padding: [200, 200, 200, 200],
        // maxZoom: 24,
        // minZoom: 2
      // });

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
