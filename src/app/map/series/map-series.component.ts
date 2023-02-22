import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { GoogleMap, MapPolygon, MapMarker, MapInfoWindow } from '@angular/google-maps';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AppSettings } from '../../services/app-settings';
import { KrameriusApiService } from '../../services/kramerius-api.service';
import { ActivatedRoute, Router } from '@angular/router';

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
  selectedValue: any;
  bounds: any;
  polygonsInBounds: any;
  selectedPolygons: any[] = [];
  toggleShapefile: boolean = false;
  shapefile: any[] = [];
  zoomForMarkers: number = 6;
  mapSeries = [];
  neighbours = [];
  loadingSeries: boolean;
  

  constructor(public httpClient: HttpClient,
              public settings: AppSettings,
              private api: KrameriusApiService,
              private route: ActivatedRoute,
              private router: Router,) {
    this.apiLoaded = httpClient.jsonp('https://maps.googleapis.com/maps/api/js?key=' + settings.googleMapsApiKey, 'callback')
      .pipe(
        map(() => this.buildOptions()),
        catchError(() => of(false)),
      );
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const uuid = params.get('uuid');
      // const url = 'https://k7-test.mzk.cz/search/api/client/v7.0/search?q=in_collections.direct:%22uuid:ee2388c6-7343-4a7f-9287-15bc8b564cbf%22'
      const uuid_all_collections = 'uuid:ee2388c6-7343-4a7f-9287-15bc8b564cbf'
      const query = 'q=in_collections.direct:"' + uuid_all_collections +'" AND model:collection&fl=title.search,pid&rows=100'
      this.api.getSearchResults(query).subscribe((data:any) => {
        for (const col of data.response.docs) {
          const serie = {
            'name': col['title.search'],
            'pid': col.pid
          }
          this.mapSeries.push(serie)
        }
        this.selectMapSeries(uuid)
        this.selectedValue = this.mapSeries.find(x => x.pid === uuid)?.pid;
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
          // 'map_number': '▲' + ' ' + neighbourN.map_number,
          'map_number': '▲'})
    }
    if (neighbourS) {
      let markerPosition = {'lat': (neighbourS.position[3].lat - 0.01), 'lng': ((neighbourS.position[3].lng + neighbourS.position[0].lng)/2)}
      neighbours.push({
          'compass': 'S',
          'markerPosition': markerPosition,
          'position': neighbourS.position,
          // 'map_number': '▼' + ' ' + neighbourS.map_number,
          'map_number': '▼'})
    }
    if (neighbourE) {
      let markerPosition = {'lat': ((neighbourE.position[3].lat + neighbourE.position[2].lat)/2), 'lng': (neighbourE.position[3].lng + 0.02)}
      neighbours.push({
          'compass': 'E',
          'markerPosition': markerPosition,
          'position': neighbourE.position,
          // 'map_number': '►' + ' ' + neighbourE.map_number,
          'map_number': '►'})
    }
    if (neighbourW) {
      let markerPosition = {'lat': ((neighbourW.position[0].lat + neighbourW.position[1].lat)/2), 'lng': (neighbourW.position[0].lng - 0.02)}
      neighbours.push({
          'compass': 'W',
          'markerPosition': markerPosition,
          'position': neighbourW.position,
          // 'map_number': '◄' + ' ' + neighbourW.map_number,
          'map_number': '◄'})
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

  selectMapSeries(pid: string) {
    const nav = ['/']
    nav.push('mapseries')
    nav.push(pid)
    this.router.navigate(nav)
    const query = 'q=in_collections.direct:"' + pid + '"&fl=pid,shelf_locators,coords.bbox.center,coords.bbox.corner_ne,coords.bbox.corner_sw,title.search,date_range_start.year,date_range_end.year&rows=1000'
    let shapefile = this.shapefiles.find(x => x.pid === pid)?.shapefile
    this.selectedValue = this.mapSeries.find(x => x.pid === pid)?.pid
    this.shapefile = [];
    this.api.getSearchResults(query).subscribe((data: any) => {
      if (data.response.docs.length > 0) {
        this.data = this.normalizeDataForMapK7(data.response.docs);
        if (shapefile) {
          this.httpClient.get(shapefile).subscribe((file: any) => {
              this.shapefile = this.normalizeShapefile(file.features)
              // console.log('shapefile', this.shapefile)
              this.reloadData()
          })
        }
        else {
          this.reloadData()
        } 
      } else {
        // console.log(this.polygons)
        this.polygons = [];
        console.log("neobsahuje zadne mapy", this.data)
      }

    })
    // let url: any = this.mapSeries.find(x => x.pid === pid)?.pid
    // console.log('URL', url)
    // let shapefile: any = this.shapefiles.find(x => x.pid === pid)?.shapefile
    // console.log(shapefile)
    // this.shapefile = [];
    // this.httpClient.get(url).subscribe((data: any) => {
    //     this.data = this.normalizeDataForMapK7(data.response.docs);
    //     if (shapefile) {
    //         this.httpClient.get(shapefile).subscribe((file: any) => {
    //             this.shapefile = this.normalizeShapefile(file.features)
    //             console.log('shapefile', this.shapefile)
    //             this.reloadData()
    //         })  
    //     }
    //     else {
    //       this.reloadData()
    //     }  
    // });
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
    // console.log(maxbounds)
    
    let maxN: number = Number(data[0]['coords.bbox.corner_ne'].split(',')[0]);
    let maxE: number = Number(data[0]['coords.bbox.corner_ne'].split(',')[1]);
    let maxS: number = Number(data[0]['coords.bbox.corner_sw'].split(',')[0]);
    let maxW: number = Number(data[0]['coords.bbox.corner_sw'].split(',')[1]);
    // console.log(maxN, maxE, maxS, maxW)
    let heightOfBox = maxN - maxS
    let widthOfBox = maxE - maxW
    // console.log('widthOfBox', widthOfBox, 'heigthOfBox', heightOfBox)
    if (widthOfBox <= 0.25) {
      this.zoomForMarkers = 8;
    } else if (widthOfBox > 0.25 && widthOfBox < 0.5) {
      this.zoomForMarkers = 7;
    } else if (widthOfBox >= 0.5 && widthOfBox < 2) {
      this.zoomForMarkers = 6;
    } else if (widthOfBox >= 2) {
      this.zoomForMarkers = 5
    }
    // console.log(this.zoomForMarkers)


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
                let map_number = '';
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
  // ************* SHAPEFILE LIST (z tabulky) ******************* 
  shapefiles = [
    {
      'name': 'Befestigungskarte Tschechoslowakei 1:25 000',
      'pid': 'uuid:ec026411-93ab-45ca-96b8-c9aed04f292c',
      'shapefile': 'https://raw.githubusercontent.com/moravianlibrary/mapseries-data/master/geojson/evropa-befestigungskarte-tschechoslowakei-125-000.json'
    },
    {
      'name': 'Topographische Karte der Tschechoslowakei 1:25 000',
      'pid': 'uuid:1650b23e-2673-4b59-96f6-fd5dc194b2f1',
      'shapefile': 'https://raw.githubusercontent.com/moravianlibrary/mapseries-data/master/geojson/evropa-treti-vojenske-mapovani-topograficke-mapy-125-000.json'
    },
    {
      'name': 'Deutsche Heereskarte 1:200 000',
      'pid': 'uuid:b8f2d277-4c8b-4003-9ad7-912685ab733f',
      'shapefile': 'https://raw.githubusercontent.com/moravianlibrary/mapseries-data/master/geojson/evropa-deutsche-heereskarte-1200-000.json'
    },
    {
      'name': 'Slowakei 1:75 000',
      'pid': 'uuid:03e3029f-9f0e-429c-b657-08bc121bb93c',
      'shapefile': 'https://raw.githubusercontent.com/moravianlibrary/mapseries-data/master/geojson/evropa-karte-slowakei-175-000.json'
    },
    {
      'name': 'Ungarn 1:75 000',
      'pid': 'uuid:276d2c25-b47f-4345-a29f-651923120d1d',
      'shapefile': 'https://raw.githubusercontent.com/moravianlibrary/mapseries-data/master/geojson/evropa-karte-ungarn-175-000.json'
    },
    {
      'name': 'Bulgarien 1:100 000',
      'pid': 'uuid:523c8b64-c5ad-459d-af7f-47b53e81c630',
      'shapefile': 'https://raw.githubusercontent.com/moravianlibrary/mapseries-data/master/geojson/evropa-deutsche-heereskarte-bulgarien-1100-000.json'
    },
    {
      'name': 'Italien 1:100 000',
      'pid': 'uuid:527c5670-3448-4253-9656-bae573f6e7ad',
      'shapefile': 'https://raw.githubusercontent.com/moravianlibrary/mapseries-data/master/geojson/evropa-deutsche-heereskarte-italien-1100-000.json'
    },
    {
      'name': 'Osteuropa 1:300 000',
      'pid': 'uuid:31c10d40-c17b-4252-8056-2797b438f16b',
      'shapefile': 'https://raw.githubusercontent.com/moravianlibrary/mapseries-data/master/geojson/evropa-deutsche-heereskarte-1300-000.json'
    },
    {
      'name': 'Spezialkarte der Tschechoslowakei - Sonderausgabe 1:75 000',
      'pid': 'uuid:f3628ebb-2fed-4a33-9a98-524ab2b559c6',
      'shapefile': 'https://raw.githubusercontent.com/moravianlibrary/mapseries-data/master/geojson/evropa-treti-vojenske-mapovani-specialni-mapy-175-000.json'
    },
    {
      'name': 'Europa 1:300 000',
      'pid': 'uuid:ab2d2dfe-53b3-4def-a5a3-b8c4bb5b931d',
      'shapefile': 'https://raw.githubusercontent.com/moravianlibrary/mapseries-data/master/geojson/evropa-deutsche-heereskarte-1300-000.json'
    },
    {
      'name': 'Mitteleuropa 1:300 000',
      'pid': 'uuid:58ad6662-4cf7-4790-97ad-1ee0925c4306',
      'shapefile': 'https://raw.githubusercontent.com/moravianlibrary/mapseries-data/master/geojson/evropa-deutsche-heereskarte-1300-000.json'
    },
    {
      'name': 'Übersichtskarte von Mitteleuropa 1:300 000',
      'pid': 'uuid:2577e466-b819-4bfd-a5fb-9b50ae00d3a9',
      'shapefile': 'https://raw.githubusercontent.com/moravianlibrary/mapseries-data/master/geojson/evropa-deutsche-heereskarte-1300-000.json'
    },
    {
      'name': 'Přehledná mapa střední Evropy v měřítku 1:750 000 - československá vydání',
      'pid': 'uuid:b5148044-7df6-400e-8af3-df8cb1a9d614',
      'shapefile': 'https://raw.githubusercontent.com/moravianlibrary/mapseries-data/master/geojson/evropa-treti-vojenske-mapovani-prehledna-mapa-stredni-evropy-1750-000.json'
    },
    {
      'name': 'Prozatímní topografická mapa 1 : 10 000',
      'pid': 'uuid:6c5dbb46-0c12-4879-bf86-621c861062ac',
      'shapefile': 'https://raw.githubusercontent.com/moravianlibrary/mapseries-data/master/geojson/evropa-prozatimni-vojenske-mapovani-110-000-benesovo-zobrazeni-oprava.json'
    },
    {
      'name': 'Prozatímní mapa ČSR 1:50 000',
      'pid': 'uuid:6c5dbb46-0c12-4879-bf86-621c861062ac',
      'shapefile': 'https://raw.githubusercontent.com/moravianlibrary/mapseries-data/master/geojson/evropa-souradnicovy-system-1942-s42.json'
    },
    {
      'name': 'Topografická mapa Protektorátu Čechy a Morava 1:25 000',
      'pid': 'uuid:7df4c1c1-1b66-4af9-93c6-72b3ca6195e9',
      'shapefile': 'https://raw.githubusercontent.com/moravianlibrary/mapseries-data/master/geojson/evropa-treti-vojenske-mapovani-topograficke-mapy-125-000.json'
    },
    {
      'name': 'Speciální mapa Rakouské republiky v měřítku 1:75 000',
      'pid': 'uuid:c1508e09-b66e-4f64-975c-c44a220c6764',
      'shapefile': 'https://raw.githubusercontent.com/moravianlibrary/mapseries-data/master/geojson/evropa-treti-vojenske-mapovani-specialni-mapy-175-000.json'
    },
    {
      'name': 'Topografická mapa Rakouska-Uherska 1:25 000',
      'pid': 'uuid:6be3634d-c639-4bdb-858f-d142f1a6e407',
      'shapefile': 'https://raw.githubusercontent.com/moravianlibrary/mapseries-data/master/geojson/evropa-treti-vojenske-mapovani-topograficke-mapy-125-000.json'
    },
    {
      'name': 'Geologische Spezialkarte der im Reichsrate vertretenen Königreiche und Länder der österreichisch-ungarischen Monarchie 1:75 000',
      'pid': 'uuid:e879e660-94e5-4811-9d32-d053a9a0cbe5',
      'shapefile': 'https://raw.githubusercontent.com/moravianlibrary/mapseries-data/master/geojson/evropa-geologicka-specialni-mapa-175-000.json'
    },
    {
      'name': 'Spezialkarte der österreich-ungarischen Monarchie im Maße 1:75 000',
      'pid': 'uuid:16209bb4-2e1a-4d1e-a0a0-50462127c093',
      'shapefile': 'https://raw.githubusercontent.com/moravianlibrary/mapseries-data/master/geojson/evropa-treti-vojenske-mapovani-specialni-mapy-175-000.json'
    },
    {
      'name': 'Soubor přehledných map pro plánování a statistiku',
      'pid': 'uuid:df0edbe3-7ded-4ec0-96c9-b6aef1cb3b6b',
      'shapefile': 'https://raw.githubusercontent.com/moravianlibrary/mapseries-data/master/geojson/evropa-soubor-prehlednych-map-pro-planovani-a-statistiku-175-000.json'
    },
    {
      'name': 'Geologická speciální mapa Uher v měřítku 1:75 000',
      'pid': 'uuid:35a540e3-92f4-440e-a965-38ca26e257cb',
      'shapefile': 'https://raw.githubusercontent.com/moravianlibrary/mapseries-data/master/geojson/evropa-geologicka-specialni-mapa-175-000.json'
    },
    {
      'name': 'Soubor přehledných map pro plánování a statistiku 1:75 000',
      'pid': 'uuid:14716d5e-da4d-485f-98c6-73d685b826aa',
      'shapefile': 'https://raw.githubusercontent.com/moravianlibrary/mapseries-data/master/geojson/evropa-treti-vojenske-mapovani-specialni-mapy-175-000.json'
    },
    {
      'name': 'Deutsche Heereskarte. Protektorat 1:50 000',
      'pid': 'uuid:e38713f4-0253-475c-889f-b58d27b0ed8d',
      'shapefile': 'https://raw.githubusercontent.com/moravianlibrary/mapseries-data/master/geojson/evropa-deutsche-heereskarte-150-000-protektorat.json'
    },
    {
      'name': 'Generalkarte der Tschechoslowakei 1:200 000',
      'pid': 'uuid:1b726fca-05e6-4d89-800b-f6fcf360478a',
      'shapefile': 'https://raw.githubusercontent.com/moravianlibrary/mapseries-data/master/geojson/evropa-treti-vojenske-mapovani-generalni-mapy-1200-000.json'
    },
    {
      'name': 'Speciální mapa Československé republiky v měřítku 1:75 000',
      'pid': 'uuid:ca10efd2-121e-428b-8d1b-bf40b3dd1654',
      'shapefile': 'https://raw.githubusercontent.com/moravianlibrary/mapseries-data/master/geojson/evropa-treti-vojenske-mapovani-specialni-mapy-175-000.json'
    },
    {
      'name': 'Generální mapa Československé republiky 1:200 000',
      'pid': 'uuid:f1bd1d01-7f9a-4bb8-8698-c775079e6254',
      'shapefile': 'https://raw.githubusercontent.com/moravianlibrary/mapseries-data/master/geojson/evropa-treti-vojenske-mapovani-generalni-mapy-1200-000.json'
    },
    {
      'name': 'General-Karte von Mittel-Europa im Masse 1:200 000',
      'pid': 'uuid:d4f281ee-2c3a-49f1-93b3-4190b70bdd8a',
      'shapefile': 'https://raw.githubusercontent.com/moravianlibrary/mapseries-data/master/geojson/evropa-treti-vojenske-mapovani-generalni-mapy-1200-000.json'
    },
    {
      'name': 'Generální mapa Protektorátu Čechy a Morava 1:200 000',
      'pid': 'uuid:a5ccafdc-6e05-4370-a6f0-54997c8919c9',
      'shapefile': 'https://raw.githubusercontent.com/moravianlibrary/mapseries-data/master/geojson/evropa-treti-vojenske-mapovani-generalni-mapy-1200-000.json'
    },
    {
      'name': 'Generální úpatnicová mapa Československé republiky 1:200 000',
      'pid': 'uuid:3b7a8c7b-499a-4950-a3d6-c5f96931f346',
      'shapefile': 'https://raw.githubusercontent.com/moravianlibrary/mapseries-data/master/geojson/evropa-treti-vojenske-mapovani-generalni-mapy-1200-000.json'
    },
    {
      'name': 'General-Karte von Mittel-Europa im Masse 1:200 000 (Hauptvermessungsabteilung XIV)',
      'pid': 'uuid:db25519a-1f47-4592-80b5-c663f765bff7',
      'shapefile': 'https://raw.githubusercontent.com/moravianlibrary/mapseries-data/master/geojson/evropa-treti-vojenske-mapovani-generalni-mapy-1200-000.json'
    },
    {
      'name': 'Speciální mapa Protektorátu Čechy a Morava v měřítku 1:75 000',
      'pid': 'uuid:57765f1c-f063-482a-9781-134f6db82b69',
      'shapefile': 'https://raw.githubusercontent.com/moravianlibrary/mapseries-data/master/geojson/evropa-treti-vojenske-mapovani-specialni-mapy-175-000.json'
    },
    {
      'name': 'Speciální mapa Československé republiky v měřítku 1:75 000 - přetisky hranic 1938',
      'pid': 'uuid:78f5d972-bd18-4820-a6a6-6ee101d96e78',
      'shapefile': 'https://raw.githubusercontent.com/moravianlibrary/mapseries-data/master/geojson/evropa-treti-vojenske-mapovani-specialni-mapy-175-000.json'
    },
    {
      'name': 'Übersichts-Karte von Mittel-Europa im Masse 1:750 000 der Natur',
      'pid': 'uuid:6722219b-0aad-45fd-a11d-395aff611a31',
      'shapefile': 'https://raw.githubusercontent.com/moravianlibrary/mapseries-data/master/geojson/evropa-treti-vojenske-mapovani-prehledna-mapa-stredni-evropy-1750-000.json'
    },
    {
      'name': 'Topografická mapa Československé republiky 1:25 000',
      'pid': 'uuid:d8fa8a44-0b0d-4b24-8bb3-18d2f966dcfa',
      'shapefile': 'https://raw.githubusercontent.com/moravianlibrary/mapseries-data/master/geojson/evropa-treti-vojenske-mapovani-topograficke-mapy-125-000.json'
    },
    {
      'name': 'Generální mapa Československé republiky 1:200 000 - přetisky hranic 1938',
      'pid': 'uuid:a038bca8-ba59-4eed-8a97-47c3f57d92b5',
      'shapefile': 'https://raw.githubusercontent.com/moravianlibrary/mapseries-data/master/geojson/evropa-treti-vojenske-mapovani-generalni-mapy-1200-000.json'
    }
  ]

  // ************* MAPSERIES LIST ******************* 
  mapSeries_old = [
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
