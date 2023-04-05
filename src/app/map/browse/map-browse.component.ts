import { Component, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { KrameriusApiService } from '../../services/kramerius-api.service';
import { SearchService } from '../../services/search.service';
import { DocumentItem } from '../../model/document_item.model';
import { AppSettings } from '../../services/app-settings';
import { AuthService } from '../../services/auth.service';
import { LicenceService } from '../../services/licence.service';
import { GoogleMap } from '@angular/google-maps';
import { MapSeriesService } from '../../services/mapseries.service';

@Component({
  selector: 'app-map-browse',
  templateUrl: './map-browse.component.html',
  styleUrls: ['./map-browse.component.scss']
})
export class MapBrowseComponent implements OnInit {
  focusedItem: DocumentItem;
  locks: any;
  waitForBounds = false;

  @ViewChild(GoogleMap, { static: false }) map: GoogleMap

  constructor(private api: KrameriusApiService, 
              public searchService: SearchService, 
              public auth: AuthService, 
              private licences: LicenceService,
              public settings: AppSettings,
              private _sanitizer: DomSanitizer,
              public ms: MapSeriesService) {
     }

  ngOnInit() {
    const q = this.searchService.query;
    if (q.isBoundingBoxSet()) {
      this.waitForBounds = true;
      this.ms.init( () => {
        setTimeout(() => {
          let bounds = new google.maps.LatLngBounds(
            {"lat": q.south, "lng": q.west }, 
            {"lat": q.north, "lng": q.east }
          );
          this.waitForBounds = false;
          this.map.fitBounds(bounds, 0);
        }, 50);
      });
    } else {
      this.ms.init(() => {});
    }
    this.locks = {};
  }

  getPoint() {
    return new google.maps.LatLng(this.focusedItem.north, this.focusedItem.west);
  }

  getBounds() {
    return new google.maps.LatLngBounds(
      new google.maps.LatLng(this.focusedItem.north, this.focusedItem.west),
      new google.maps.LatLng(this.focusedItem.south, this.focusedItem.east));
  }

  getLock(item: DocumentItem): any {
    if (!this.locks[item.uuid]) {
      if (item.public || this.settings.hiddenLocks) {
        this.locks[item.uuid] = 'none';
      } else {
        this.locks[item.uuid] = this.licences.buildLock(item.licences);
      }
    }
    return this.locks[item.uuid] == 'none' ? null : this.locks[item.uuid];
  }

  onIdle() {
    if (!this.waitForBounds) {
      this.reload();
    }
  }

  reload() {
    const bounds = this.map.getBounds();
    const north = bounds.getNorthEast().lat();
    const south = bounds.getSouthWest().lat();
    const east = bounds.getNorthEast().lng();
    const west = bounds.getSouthWest().lng();
    this.searchService.setBoundingBox(north, south, west, east);
  }

  thumb(uuid: string) {
    return this._sanitizer.bypassSecurityTrustStyle(`url(${this.api.getThumbUrl(uuid)})`);
  }

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

}
