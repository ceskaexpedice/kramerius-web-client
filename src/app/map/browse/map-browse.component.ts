import { Component, OnInit } from '@angular/core';
// import { LatLngBounds } from '@agm/core';
import { DomSanitizer } from '@angular/platform-browser';
import { KrameriusApiService } from '../../services/kramerius-api.service';
import { SearchService } from '../../services/search.service';
import { DocumentItem } from '../../model/document_item.model';
import { AppSettings } from '../../services/app-settings';
import { AuthService } from '../../services/auth.service';
// import { ControlPosition, ZoomControlStyle } from '@agm/core/services/google-maps-types';
import { LicenceService } from '../../services/licence.service';


@Component({
  selector: 'app-map-browse',
  templateUrl: './map-browse.component.html',
  styleUrls: ['./map-browse.component.scss']
})
export class MapBrowseComponent implements OnInit {

  lat = 49.206902;
  lng = 16.595591;
  zoom = 9;

  // bounds: LatLngBounds;

  focusedItem: DocumentItem;

  locks: any;

  constructor(private api: KrameriusApiService, 
    public searchService: SearchService, 
    public auth: AuthService, 
    private licences: LicenceService,
    public settings: AppSettings,
    private _sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.locks = {};
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

  onMapReady(map) {
    // map.setOptions({
    //     zoomControl: 'true',
    //     zoomControlOptions: {
    //         position: ControlPosition.RIGHT_TOP,
    //         style: ZoomControlStyle.DEFAULT
    //     }
    // });
  }

  // onBoundsChange(bounds: LatLngBounds) {
  //   this.bounds = bounds;
  // }

  onIdle() {
    this.reload();
  }

  reload() {
    // const north = this.bounds.getNorthEast().lat();
    // const south = this.bounds.getSouthWest().lat();
    // const east = this.bounds.getNorthEast().lng();
    // const west = this.bounds.getSouthWest().lng();
    // this.searchService.setBoundingBox(north, south, west, east);
  }

  thumb(uuid: string) {
    return this._sanitizer.bypassSecurityTrustStyle(`url(${this.api.getThumbUrl(uuid)})`);
  }

}
