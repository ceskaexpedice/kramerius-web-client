import { Component, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { KrameriusApiService } from '../../services/kramerius-api.service';
import { SearchService } from '../../services/search.service';
import { DocumentItem } from '../../model/document_item.model';
import { AppSettings } from '../../services/app-settings';
import { AuthService } from '../../services/auth.service';
import { LicenceService } from '../../services/licence.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { GoogleMap } from '@angular/google-maps';

@Component({
  selector: 'app-map-browse',
  templateUrl: './map-browse.component.html',
  styleUrls: ['./map-browse.component.scss']
})
export class MapBrowseComponent implements OnInit {

  lat = 49.206902;
  lng = 16.595591;
  zoom = 9;

  focusedItem: DocumentItem;
  locks: any;

  apiLoaded: Observable<boolean>;

  options: google.maps.MapOptions;
  boxOptions: google.maps.RectangleOptions;

  @ViewChild(GoogleMap, { static: false }) map: GoogleMap

  constructor(private api: KrameriusApiService, 
    httpClient: HttpClient,
    public searchService: SearchService, 
    public auth: AuthService, 
    private licences: LicenceService,
    public settings: AppSettings,
    private _sanitizer: DomSanitizer) {
      this.apiLoaded = httpClient.jsonp('https://maps.googleapis.com/maps/api/js?key=' + settings.googleMapsApiKey, 'callback')
      .pipe(
        map(() => this.buildOptions() ),
        catchError(() => of(false)),
      );
     }

  ngOnInit() {
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

  buildOptions(): boolean {
    this.options = {
      center: {lat: this.lat, lng: this.lng},
      zoom: this.zoom,
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
    return true
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
    this.reload();
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

}
