import { Injectable } from '@angular/core';
import { AppSettings } from './app-settings';
import { HttpClient } from '@angular/common/http';


@Injectable()
export class MapSeriesService {

  static clusterImg = '/assets/img/cluster.png';
  static cluster2Img = '/assets/img/cluster2.png';

  center = {lat: 49.5, lng: 15};
  zoom: number = 7;
  zoomBrowse: number = 5;
  rootCollectionUUID = "uuid:ee2388c6-7343-4a7f-9287-15bc8b564cbf"; 
  seriesOptions: google.maps.MapOptions;
  browseOptions: google.maps.MapOptions;
  boxOptions: google.maps.RectangleOptions;
  svgMarker;
  svgMarker2;
  markerOptions: google.maps.MarkerOptions; 
  
  mapReady = false;
  lat = 49.206902;
  lng = 16.595591;

  constructor(
    private httpClient: HttpClient,
    private settings: AppSettings
  ) { }

  init(callback: () => void) {
    if (this.mapReady) {
      callback();
      return;
    }
    this.httpClient.jsonp('https://maps.googleapis.com/maps/api/js?key=' + this.settings.googleMapsApiKey, 'callback').subscribe((response) => {
      this.buildOptions();
      this.mapReady = true;
      callback();
    });
  }

  getRootUrl(): string {
    return this.settings.getRouteFor(`collection/${this.rootCollectionUUID}`)
  }

  buildOptions() {
    this.seriesOptions = {
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
      minZoom: 2
    };
    this.browseOptions = {
      center: {lat: this.lat, lng: this.lng},
      zoom: this.zoomBrowse,
      styles: this.stylesArray,
      mapTypeId: "hybrid",
      fullscreenControl: false,
      streetViewControl: false,
      zoomControlOptions: {
        position: google.maps.ControlPosition.TOP_RIGHT
      }
    };
    this.boxOptions = {
      fillColor: '#0277BD',
      fillOpacity: 0.5,
      strokeColor: '#0277bd',
      strokeOpacity: 1
    }
        // fillColor: '#DAA520',
    this.svgMarker = {
      // path: "M-1.547 12l6.563-6.609-1.406-1.406-5.156 5.203-2.063-2.109-1.406 1.406zM0 0q2.906 0 4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 2.039-4.945t4.945-2.039z",
      // path: 'M66.9,41.8c0-11.3-9.1-20.4-20.4-20.4c-11.3,0-20.4,9.1-20.4,20.4c0,11.3,20.4,32.4,20.4,32.4S66.9,53.1,66.9,41.8z    M37,41.4c0-5.2,4.3-9.5,9.5-9.5c5.2,0,9.5,4.2,9.5,9.5c0,5.2-4.2,9.5-9.5,9.5C41.3,50.9,37,46.6,37,41.4z',
      path: 'M66.9,41.8c0-11.3-9.1-20.4-20.4-20.4c-11.3,0-20.4,9.1-20.4,20.4c0,11.3,20.4,32.4,20.4,32.4S66.9,53.1,66.9,41.8z',
      fillColor: '#42a7FD',
      fillOpacity: 0.9,
      strokeWeight: 0,
      rotation: 0,
      scale: 0.7,
      labelOrigin: new google.maps.Point(47, 42),
      anchor: new google.maps.Point(47, 75),
    };
    this.svgMarker2 = {
      // path: "M-1.547 12l6.563-6.609-1.406-1.406-5.156 5.203-2.063-2.109-1.406 1.406zM0 0q2.906 0 4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 2.039-4.945t4.945-2.039z",
      // path: 'M66.9,41.8c0-11.3-9.1-20.4-20.4-20.4c-11.3,0-20.4,9.1-20.4,20.4c0,11.3,20.4,32.4,20.4,32.4S66.9,53.1,66.9,41.8z    M37,41.4c0-5.2,4.3-9.5,9.5-9.5c5.2,0,9.5,4.2,9.5,9.5c0,5.2-4.2,9.5-9.5,9.5C41.3,50.9,37,46.6,37,41.4z',
      path: 'M66.9,41.8c0-11.3-9.1-20.4-20.4-20.4c-11.3,0-20.4,9.1-20.4,20.4c0,11.3,20.4,32.4,20.4,32.4S66.9,53.1,66.9,41.8z',
      fillColor: '#d844b4',
      fillOpacity: 1,
      strokeWeight: 0,
      rotation: 0,
      scale: 0.7,
      labelOrigin: new google.maps.Point(47, 42),
      anchor: new google.maps.Point(47, 75),
    };
  
    this.markerOptions = {
      draggable: false,
      visible: true,
      icon: this.svgMarker,      
      optimized: true,
      // anchorPoint: new google.maps.Point(10,40)
    };
  }
  // ************* MAPSERIES - MARKER OPTIONS *******************
  svgMarker3 = {
    // path: "M10.453 14.016l6.563-6.609-1.406-1.406-5.156 5.203-2.063-2.109-1.406 1.406zM12 2.016q2.906 0 4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 2.039-4.945t4.945-2.039z",
    path: 'M0 0 0 0',
    // anchor: new google.maps.Point(0, 0),
  };
  marker_options2: google.maps.MarkerOptions = {
    draggable: false,
    visible: true,
    icon: this.svgMarker3,
    title: 'title'
  };
  marker_options3: google.maps.MarkerOptions = {
    draggable: false,
    visible: true,
    icon: this.svgMarker3,
    title: 'title'
  };

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

  // ************* CLUSTER OPTIONS *******************
  clusterOptions: ClusterIconStyle[] = [
    {
      height: 32,
      width: 32,
      anchorText: [10, 0],
      textColor: 'white',
      url: MapSeriesService.clusterImg,
    },
  ];

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
    // {
    //   "elementType": "labels.text.fill",
    //   "stylers": [
    //     {
    //       "color": "#555555"
    //     }
    //   ]
    // },
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

  
}
