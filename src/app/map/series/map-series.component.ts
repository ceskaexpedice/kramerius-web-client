import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { GoogleMap, MapPolygon, MapMarker, MapInfoWindow } from '@angular/google-maps';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AppSettings } from '../../services/app-settings';
import { ActivatedRoute } from '@angular/router';
import { ThisReceiver } from '@angular/compiler';


@Component({
  selector: 'app-map-series',
  templateUrl: './map-series.component.html',
  styleUrls: ['./map-series.component.scss']
})

export class MapSeriesComponent implements OnInit {
  @ViewChild(GoogleMap, { static: false }) map: GoogleMap

  center = {lat: 49.5, lng: 15};
  zoom: number = 7;
  polygonZoom: number;
  apiLoaded: Observable<boolean>;
  options: google.maps.MapOptions;
  boxOptions: google.maps.RectangleOptions;
  data: any;
  points: any;
  polygons: any;
  actualPolygonBounds: any;
  maxbounds: any;
  selected: any = '';
  bounds: any;
  polygonsInBounds: any;
  neighbourMarkersInBounds: any;
  selectedPolygons: any[] = [];
  toggleShapefile: boolean = false;
  shapefile: any[] = [];
  zoomForMarkers: number = 6;
  mapSeries2 = [];
  neighbours = [];
  

  constructor(public httpClient: HttpClient,
              public settings: AppSettings,
              private route: ActivatedRoute) {
    this.apiLoaded = httpClient.jsonp('https://maps.googleapis.com/maps/api/js?key=' + settings.googleMapsApiKey, 'callback')
      .pipe(
        map(() => this.buildOptions()),
        catchError(() => of(false)),
      );
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const uuid = params.get('uuid');
      console.log(uuid)
      // const url = 'https://k7-test.mzk.cz/search/api/client/v7.0/search?q=in_collections.direct:%22uuid:ee2388c6-7343-4a7f-9287-15bc8b564cbf%22'
      const uuid_all_collections = 'uuid:ee2388c6-7343-4a7f-9287-15bc8b564cbf'
      const url_all_collections = 'https://k7-test.mzk.cz/search/api/client/v7.0/search?q=in_collections.direct:"' + uuid_all_collections +'"%20AND%20model:collection&fl=title.search,pid'
      this.httpClient.get(url_all_collections).subscribe((data:any) => {
        // console.log(data.response.docs)
        for (const col of data.response.docs) {
          const serie = {
            'name': col['title.search'],
            'urlk7': 'https://k7-test.mzk.cz/search/api/client/v7.0/search?q=in_collections.direct:"' + col.pid + '"&fl=pid,shelf_locators,coords.bbox.center,coords.bbox.corner_ne,coords.bbox.corner_sw,title.search,date_range_start.year,date_range_end.year&rows=1000'
          }
          this.mapSeries2.push(serie)
        }
        this.selected = this.mapSeries2[0].name
        this.selectMapSeries(this.selected)
      })
    });
    this.reloadData()
  }

  // ************* MAP OPTIONS *******************
  stylesArray: google.maps.MapTypeStyle[] = [
    {
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#f5f5f5"
        }
      ]
    },
    {
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": "#f5f5f5"
        }
      ]
    },
    {
      "elementType": "labels.icon",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "elementType": "labels.text",
      "stylers": [
        {
          "weight": 2.5
        }
      ]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#616161"
        }
      ]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#f5f5f5"
        }
      ]
    },
    {
      "featureType": "administrative",
      "elementType": "labels",
      "stylers": [
        {
          "visibility": "on"
        },
        {
          "weight": 1
        }
      ]
    },
    {
      "featureType": "administrative.country",
      "elementType": "geometry",
      "stylers": [
        {
          "lightness": -15
        }
      ]
    },
    {
      "featureType": "administrative.country",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "visibility": "on"
        }
      ]
    },
    {
      "featureType": "administrative.country",
      "elementType": "geometry.stroke",
      "stylers": [
        {
          "lightness": -50
        },
        {
          "visibility": "on"
        }
      ]
    },
    {
      "featureType": "administrative.locality",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "visibility": "on"
        }
      ]
    },
    {
      "featureType": "administrative.locality",
      "elementType": "geometry.stroke",
      "stylers": [
        {
          "color": "#000000"
        },
        {
          "visibility": "on"
        }
      ]
    },
    {
      "featureType": "administrative.locality",
      "elementType": "labels",
      "stylers": [
        {
          "visibility": "simplified"
        }
      ]
    },
    {
      "featureType": "administrative.province",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "weight": 1
        }
      ]
    },
    {
      "featureType": "administrative.province",
      "elementType": "geometry.stroke",
      "stylers": [
        {
          "color": "#000000"
        }
      ]
    },
    {
      "featureType": "landscape",
      "stylers": [
        {
          "weight": 2
        }
      ]
    },
    {
      "featureType": "landscape",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "visibility": "on"
        }
      ]
    },
    {
      "featureType": "landscape.man_made",
      "stylers": [
        {
          "color": "#e0e0e0"
        },
        {
          "lightness": 5
        }
      ]
    },
    {
      "featureType": "landscape.natural",
      "stylers": [
        {
          "visibility": "simplified"
        }
      ]
    },
    {
      "featureType": "landscape.natural",
      "elementType": "labels",
      "stylers": [
        {
          "visibility": "on"
        }
      ]
    },
    {
      "featureType": "landscape.natural",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "landscape.natural",
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "landscape.natural.landcover",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "landscape.natural.terrain",
      "stylers": [
        {
          "color": "#d6d6d6"
        }
      ]
    },
    {
      "featureType": "poi",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#eeeeee"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#e5e5e5"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#9e9e9e"
        }
      ]
    },
    {
      "featureType": "road",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#ffffff"
        }
      ]
    },
    {
      "featureType": "road.arterial",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#dadada"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#616161"
        }
      ]
    },
    {
      "featureType": "road.local",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#9e9e9e"
        }
      ]
    },
    {
      "featureType": "transit.line",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "transit.line",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#e5e5e5"
        }
      ]
    },
    {
      "featureType": "transit.station",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#eeeeee"
        }
      ]
    },
    {
      "featureType": "water",
      "stylers": [
        {
          "color": "#809ecb"
        },
        {
          "weight": 1
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#ffffff"
        },
        {
          "visibility": "on"
        }
      ]
    }
  ];
  buildOptions(): boolean {
    this.options = {
      center: this.center,
      zoom: this.zoom,
      styles: this.stylesArray,
      mapTypeId: "terrain",
      fullscreenControl: false,
      streetViewControl: false,
      zoomControl: true,
      scaleControl: true,
      scrollwheel: true,
      mapTypeControl: false,
      disableDoubleClickZoom: false,
      maxZoom: 15,
      minZoom: 2,
      // zoomControlOptions: {
      //   position: google.maps.ControlPosition.TOP_RIGHT
      // }
    };
    this.boxOptions = {
      fillColor: '#0277BD',
      fillOpacity: 0.5,
      strokeColor: '#0277bd',
      strokeOpacity: 1
    }
    return true
  }
  // ************* POLYGON OPTIONS *******************
  polygon_options: google.maps.PolygonOptions = {
    strokeColor: "#000000",
    strokeOpacity: 0.6,
    strokeWeight: 1,
    fillColor: "#000000",
    fillOpacity: 0.3,
    clickable: true,
    geodesic: false

  }
  shapefile_options: google.maps.PolygonOptions = {
    strokeColor: "#000000",
    strokeOpacity: 0.3,
    strokeWeight: 1,
    fillColor: "#000000",
    fillOpacity: 0.0,
    clickable: false,
    geodesic: false
  }
  svgMarker = {
    // path: "M10.453 14.016l6.563-6.609-1.406-1.406-5.156 5.203-2.063-2.109-1.406 1.406zM12 2.016q2.906 0 4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 2.039-4.945t4.945-2.039z",
    path: 'M0 0 0 0',
    // anchor: new google.maps.Point(0, 0),
  };
  marker_options2: google.maps.MarkerOptions = {
    draggable: false,
    visible: true,
    icon: this.svgMarker,
    title: 'title'
  };
  marker_options3: google.maps.MarkerOptions = {
    draggable: false,
    visible: true,
    icon: this.svgMarker,
    title: 'title'
  };

  // ************* FUNKCE *******************  

  onIdle() {
    this.bounds = new google.maps.LatLngBounds(this.map.getBounds())
    this.zoom = Number(this.map.getZoom())
    this.polygonsInBounds = this.displayPolygonsInBounds()
    // console.log('bounds', this.bounds.toJSON())
    if (this.actualPolygonBounds) {
      // console.log('actualPolygonBounds', this.actualPolygonBounds.toJSON())
      if (this.bounds.toJSON().north < this.actualPolygonBounds.toJSON().north
        || this.bounds.toJSON().south > this.actualPolygonBounds.toJSON().south
        || this.bounds.toJSON().east < this.actualPolygonBounds.toJSON().east
        || this.bounds.toJSON().west > this.actualPolygonBounds.toJSON().west) {
            this.neighbours = [];
      }
    }
  }

  private reloadData() {
    this.maxbounds = this.maxbounds
    this.points = this.points;
    this.polygons = this.polygons;
    this.selectedPolygons = this.polygons;
    // this.shapefile = this.dataService.shapefile;
    // console.log(this.polygons)
    // this.map.fitBounds(this.maxbounds)
    if (this.map) {
      this.map.fitBounds(this.maxbounds)
    }
  }
  displayPolygonsInBounds() {
    let polygonsInBounds:any[] = [];
    if (this.polygons) {
      for (const pol of this.polygons) {
        if (pol.center.lat > this.bounds.toJSON().south 
         && pol.center.lat < this.bounds.toJSON().north
         && pol.center.lng < this.bounds.toJSON().east
         && pol.center.lng > this.bounds.toJSON().west) {
          polygonsInBounds.push(pol)
        }
      }
    }
    return polygonsInBounds;
  }
  displayMarkersInBounds() {
    let neighbourMarkersInBounds:any[] = []
    if (this.neighbours) {
      for (const neighbour of this.neighbours) {
        if (neighbour.neighbourN.position.lat > this.bounds.toJSON().south
        && neighbour.neighbourS.position.lat) {
          neighbourMarkersInBounds.push(neighbour)
        }
      }
    }
  }
  polygonClick(polygon: MapPolygon, content: any) {
    //BOUNDS MUSI BYT (SW, NE)
    this.bounds = new google.maps.LatLngBounds(content.position[2], content.position[0])
    this.actualPolygonBounds = this.bounds;
    this.neighbours = this.findNeighbours(content.position)
    this.selectedPolygons = []
    this.selectedPolygons.push(content)
    this.map.fitBounds(this.bounds)
    this.polygonZoom = this.map.getZoom()
  }
  findNeighbours(polygon_position: any) {
    let neighbourN = this.polygons.find(x => (x.position[2].lat === polygon_position[3].lat) 
                                          && (x.position[2].lng === polygon_position[3].lng) 
                                          && (x.position[1].lng === polygon_position[0].lng)
                                          && (x.position[1].lng === polygon_position[0].lng) 
                                          )
    let neighbourE = this.polygons.find(x => (x.position[3].lat === polygon_position[0].lat) 
                                          && (x.position[3].lng === polygon_position[0].lng) 
                                          && (x.position[2].lng === polygon_position[1].lng)
                                          && (x.position[2].lng === polygon_position[1].lng) 
                                          )
    let neighbourS = this.polygons.find(x => (x.position[3].lat === polygon_position[2].lat) 
                                          && (x.position[3].lng === polygon_position[2].lng) 
                                          && (x.position[0].lng === polygon_position[1].lng)
                                          && (x.position[0].lng === polygon_position[1].lng) 
                                          )
    let neighbourW = this.polygons.find(x => (x.position[0].lat === polygon_position[3].lat) 
                                          && (x.position[0].lng === polygon_position[3].lng) 
                                          && (x.position[1].lng === polygon_position[2].lng)
                                          && (x.position[1].lng === polygon_position[2].lng) 
                                          )
    // console.log('neighbourN', neighbourN, 'neighbourE', neighbourE, 'neighbourS', neighbourS, 'neighbourW', neighbourW)
    let neighbours = []
    if (neighbourN) {
      let markerPosition = {'lat': (neighbourN.position[2].lat + 0.01), 'lng': ((neighbourN.position[2].lng + neighbourN.position[1].lng)/2)}
      neighbours.push({
          'compass': 'N',
          'markerPosition': markerPosition,
          'position': neighbourN.position,
          'map_number': '▲' + ' ' + neighbourN.map_number})
    }
    if (neighbourS) {
      let markerPosition = {'lat': (neighbourS.position[3].lat - 0.01), 'lng': ((neighbourS.position[3].lng + neighbourS.position[0].lng)/2)}
      neighbours.push({
          'compass': 'S',
          'markerPosition': markerPosition,
          'position': neighbourS.position,
          'map_number': '▼' + ' ' + neighbourS.map_number})
    }
    if (neighbourE) {
      let markerPosition = {'lat': ((neighbourE.position[3].lat + neighbourE.position[2].lat)/2), 'lng': (neighbourE.position[3].lng + 0.02)}
      neighbours.push({
          'compass': 'E',
          'markerPosition': markerPosition,
          'position': neighbourE.position,
          'map_number': '►' + ' ' + neighbourE.map_number})
    }
    if (neighbourW) {
      let markerPosition = {'lat': ((neighbourW.position[0].lat + neighbourW.position[1].lat)/2), 'lng': (neighbourW.position[0].lng - 0.02)}
      neighbours.push({
          'compass': 'W',
          'markerPosition': markerPosition,
          'position': neighbourW.position,
          'map_number': '◄' + ' ' + neighbourW.map_number})
    }
    return neighbours;
  }
  polygonMouseOver(somepolygon: any) {
    somepolygon.options = {
        // strokeColor: "#FFFF00",
        // fillColor: "#FFFF00",
        fillOpacity: 0.5
    }
  }
  polygonMouseOut(somepolygon: any) {
    somepolygon.options = {
        // strokeColor: "#000000",
        // fillColor: "#000000",
        fillOpacity: 0.3
    }
  }
  polygonZoomOut() {
    this.neighbours = []
  }
  displayAllMaps() {
    this.selectedPolygons = this.polygons
    this.map.fitBounds(this.maxbounds)
  }

  selectMapSeries(name: any) {
    let url: any = this.mapSeries2.find(x => x.name === name)?.urlk7
    console.log('URL', url)
    let shapefile: any = this.mapSeries2.find(x => x.name === name)?.shapefile
    this.shapefile = [];
    if (name === 'Body v klastru') {
        this.httpClient.get(url).subscribe((data: any) => {
          this.data = data;
        });
    } else {
        this.httpClient.get(url).subscribe((data: any) => {
            this.data = this.normalizeDataForMapK7(data.response.docs);
            if (shapefile) {
                this.httpClient.get(shapefile).subscribe((file: any) => {
                    this.shapefile = this.normalizeShapefile(file.features)
                    console.log('shapefile', this.shapefile)
                    this.reloadData()
                })  
            }
            else {
              this.reloadData()
            }  
        });

    }
  }
  normalizeShapefile(file: any) {
    let shapefile = [];
    // console.log(this.shapefile[0].geometry.coordinates[0][0][0])
    for (const x of file) {
        if (x.geometry.coordinates) {
            let position = [
                {"lat": x.geometry.coordinates[0][0][1], 
                "lng": x.geometry.coordinates[0][0][0] },
                {"lat": x.geometry.coordinates[0][1][1], 
                "lng": x.geometry.coordinates[0][1][0] },
                {"lat": x.geometry.coordinates[0][2][1], 
                "lng": x.geometry.coordinates[0][2][0] },
                {"lat": x.geometry.coordinates[0][3][1], 
                "lng": x.geometry.coordinates[0][3][0] }
            ]
            shapefile.push({'position': position })
        }
    }
    return shapefile
  }

  normalizeDataForMapK7(data: any) {
    let points: any[] = [];
    let polygons: any[] = [];
    let maxbounds = new google.maps.LatLngBounds();
    
    let maxN: number = Number(data[0]['coords.bbox.corner_ne'].split(',')[0]);
    let maxE: number = Number(data[0]['coords.bbox.corner_ne'].split(',')[1]);
    let maxS: number = Number(data[0]['coords.bbox.corner_sw'].split(',')[0]);
    let maxW: number = Number(data[0]['coords.bbox.corner_sw'].split(',')[1]);
    console.log(maxN, maxE, maxS, maxW)
    let heightOfBox = maxN - maxS
    let widthOfBox = maxE - maxW
    console.log('widthOfBox', widthOfBox, 'heigthOfBox', heightOfBox)
    if (widthOfBox <= 0.25) {
      this.zoomForMarkers = 8;
    } else if (widthOfBox > 0.25 && widthOfBox < 0.5) {
      this.zoomForMarkers = 7;
    } else if (widthOfBox >= 0.5 && widthOfBox < 2) {
      this.zoomForMarkers = 6;
    } else if (widthOfBox >= 2) {
      this.zoomForMarkers = 5
    }
    console.log(this.zoomForMarkers)


    for (const record of data) {
        if (record['coords.bbox.corner_ne'] && record['coords.bbox.corner_sw']) {
            // PREVEDU SI SOURADNICE
            let lat1 = Number(record['coords.bbox.corner_ne'].split(',')[0])
            let lng1 = Number(record['coords.bbox.corner_ne'].split(',')[1])
            let lat2 = Number(record['coords.bbox.corner_sw'].split(',')[0])
            let lng2 = Number(record['coords.bbox.corner_sw'].split(',')[1])
            
            // HLEDAM BOUNDS PRO CELOU SERII
            if (lat1 > maxN) {
                maxN = lat1
            }
            if (lat2 < maxS) {
                maxS = lat2
            }
            if (lng1 > maxE) {
                maxE = lng1
            }
            if (lng2 < maxW) {
                maxW = lng2
            }
            // ZJISTUJU, JESTLI JE TO BOD
            if (record['coords.bbox.corner_ne'] === record['coords.bbox.corner_sw']) {
                // TODO
                if (!points.some(e => (e.coord_ne === record['coords.bbox.corner_ne'] && e.coord_sw === record['coords.bbox.corner_sw']))) {
                    // console.log(points.some(e => (e.coord_ne === record['coords.bbox.corner_ne'] && e.coord_sw === record['coords.bbox.corner_sw'])))
                }
                points.push({
                    "coord_ne": record['coords.bbox.corner_ne'],
                    "coord_sw": record['coords.bbox.corner_sw'],
                    "position": 
                        {
                            "lat": lat1,
                            "lng": lng1
                        },
                    "maps": [
                        {
                            "pid": record['pid'], 
                            "title": record['title.search']
                        }
                    ]}) 
            }
            // JE TO POLYGON
            else {
                // DATUM
                let date;
                if (record['date_range_start.year'] === record['date_range_end.year']) {
                    date = record['date_range_start.year']
                } else {
                    date = record['date_range_start.year'] + ' ' + '-' + ' ' + record['date_range_end.year']
                }
                // CISLO LISTU
                let map_number;
                if (record['shelf_locators'][0]) {
                    let map_number_plus = String(record['shelf_locators'][0].split(',')[1])
                    if (map_number_plus) {
                        map_number = map_number_plus?.split('-')[0]
                    }
                }

                // STRED POLYGONU - PRO MARKER
                let center;
                if (record['coords.bbox.center']) {
                    center = {'lat': Number(record['coords.bbox.center'].split(',')[0]),
                              'lng': Number(record['coords.bbox.center'].split(',')[1])}
                }
                
                // VICE MAP NA JEDNOM POLYGONU
                if (!polygons.some(e => (e.coord_ne === record['coords.bbox.corner_ne'] && e.coord_sw === record['coords.bbox.corner_sw']))) {
                    let position = [
                        {"lat": lat1, 
                        "lng": lng1 },
                        {"lat": lat2, 
                        "lng": lng1 },
                        {"lat": lat2, 
                        "lng": lng2 },
                        {"lat": lat1, 
                        "lng": lng2 }]
                    polygons.push({
                        "coord_ne": record['coords.bbox.corner_ne'],
                        "coord_sw": record['coords.bbox.corner_sw'],
                        "position": position,
                        "map_number": map_number,
                        "center": center,
                        "maps": [{
                            "pid": record['pid'], 
                            "title": record['title.search'],
                            "date": date,
                            "shelf_locators": record['shelf_locators']
                            }]
                    })
                }
                else {
                    let polygon = polygons.find(e => (e.coord_ne === record['coords.bbox.corner_ne'] && e.coord_sw === record['coords.bbox.corner_sw']))
                    polygon.maps.push({
                        "pid": record['pid'], 
                        "title": record['title.search'],
                        "date": date
                    })
                }   
            }
        }  
    }
    maxbounds = new google.maps.LatLngBounds({"lat": maxS, "lng": maxW }, {"lat": maxN, "lng": maxE})
    this.points = points
    this.polygons = polygons.sort(function(a, b){return a.map_number - b.map_number})
    this.maxbounds = maxbounds
  }

  // ************* MAPSERIES LIST ******************* 
  mapSeries = [
    // {
    //     'urlk5': 'https://kramerius.mzk.cz/search/api/v5.0/search?q=location:*&fl=location,title,PID&rows=500000&wt=json',
    //     'urlk7': 'https://k7-test.mzk.cz/search/api/client/v7.0/search?q=coords.bbox.corner_ne:*&fl=pid,shelf_locators,coords.bbox.center,coords.bbox.corner_ne,coords.bbox.corner_sw,title.search,date_range_start.year,date_range_end.year&rows=50000',
    //     'name': 'Body v klastru'
    // },
    {
      'name': 'Befestigungskarte Tschechoslowakei',
      'urlk5': 'https://kramerius.mzk.cz/search/api/v5.0/search?q=mods.shelfLocator:1396.305*&fl=PID,title,location&rows=1000&wt=json',
      'urlk7': 'https://k7-test.mzk.cz/search/api/client/v7.0/search?q=shelf_locators:*1396.305*&fl=pid,shelf_locators,coords.bbox.center,coords.bbox.corner_ne,coords.bbox.corner_sw,title.search,date_range_start.year,date_range_end.year&rows=1000', 
      'shapefile': 'https://raw.githubusercontent.com/moravianlibrary/mapseries-data/master/geojson/evropa-befestigungskarte-tschechoslowakei-125-000.json'
    },
    {
      'name': 'Speciální mapa Československé republiky',
      'urlk5': 'https://kramerius.mzk.cz/search/api/v5.0/search?q=mods.shelfLocator:0174.951*&fl=PID,title,location&rows=1000&wt=json',
      'urlk7': 'https://k7-test.mzk.cz/search/api/client/v7.0/search?q=shelf_locators:*0174.951*&fl=pid,shelf_locators,coords.bbox.center,coords.bbox.corner_ne,coords.bbox.corner_sw,title.search,date_range_start.year,date_range_end.year&rows=1000',

    },
    {
      'name': 'Přehledná mapa střední Evropy',
      'urlk5': 'https://kramerius.mzk.cz/search/api/v5.0/search?q=mods.shelfLocator:1388.791*&fl=PID,title,location&rows=1000&wt=json',
      'urlk7': 'https://k7-test.mzk.cz/search/api/client/v7.0/search?q=shelf_locators:*1388.791*&fl=pid,shelf_locators,coords.bbox.center,coords.bbox.corner_ne,coords.bbox.corner_sw,title.search,date_range_start.year,date_range_end.year&rows=1000'
        //nema shapefile
    },
    {
      'name': 'Stierova mapa Uher na 12 listech',
      'urlk5': 'https://kramerius.mzk.cz/search/api/v5.0/search?q=mods.shelfLocator:0003.193*&fl=PID,title,location&rows=1000&wt=json',
      'urlk7': 'https://k7-test.mzk.cz/search/api/client/v7.0/search?q=shelf_locators:Moll-0003.193*&fl=pid,shelf_locators,coords.bbox.center,coords.bbox.corner_ne,coords.bbox.corner_sw,title.search,date_range_start.year,date_range_end.year&rows=1000',
        
    },
    {
      'name': 'Special-Karte der österreichisch-ungarischen Monarchie',
      'urlk5': 'https://kramerius.mzk.cz/search/api/v5.0/search?q=mods.shelfLocator:0081.473*&fl=PID,title,location&rows=1000&wt=json',
      'urlk7': 'https://k7-test.mzk.cz/search/api/client/v7.0/search?q=shelf_locators:*0081.473*&fl=pid,shelf_locators,coords.bbox.center,coords.bbox.corner_ne,coords.bbox.corner_sw,title.search,date_range_start.year,date_range_end.year&rows=1000',
        
    },
    {
      'name': 'Mapa Dunaje na 31 listech',
      'urlk5': 'https://kramerius.mzk.cz/search/api/v5.0/search?q=mods.shelfLocator:0003.128*&fl=PID,title,location&rows=1000&wt=json',
      'urlk7': 'https://k7-test.mzk.cz/search/api/client/v7.0/search?q=shelf_locators:Moll-0003.128*&fl=pid,shelf_locators,coords.bbox.center,coords.bbox.corner_ne,coords.bbox.corner_sw,title.search,date_range_start.year,date_range_end.year&rows=1000',
        
    },
    {   
      'name': 'Italien',
      'urlk7': 'https://k7-test.mzk.cz/search/api/client/v7.0/search?q=shelf_locators:*0190.956*&fl=pid,shelf_locators,coords.bbox.center,coords.bbox.corner_ne,coords.bbox.corner_sw,title.search,date_range_start.year,date_range_end.year&rows=1000',
      'shapefile': 'https://raw.githubusercontent.com/moravianlibrary/mapseries-data/master/geojson/evropa-deutsche-heereskarte-italien-1100-000.json'
    },
    {
      'name': 'Osteuropa',
      'urlk7': 'https://k7-test.mzk.cz/search/api/client/v7.0/search?q=shelf_locators:*0190.958*&fl=pid,shelf_locators,coords.bbox.center,coords.bbox.corner_ne,coords.bbox.corner_sw,title.search,date_range_start.year,date_range_end.year&rows=1000'
        
    },
    {
      'name': 'Deutsche Heereskarte. Protektorat.',
      'urlk7': 'https://k7-test.mzk.cz/search/api/client/v7.0/search?q=shelf_locators:*0190.961*&fl=pid,shelf_locators,coords.bbox.center,coords.bbox.corner_ne,coords.bbox.corner_sw,title.search,date_range_start.year,date_range_end.year&rows=1000',
      'shapefile': 'https://raw.githubusercontent.com/moravianlibrary/mapseries-data/master/geojson/evropa-deutsche-heereskarte-150-000-protektorat.json'
    }
  ]

}
