import { Component, OnInit } from '@angular/core';
import { LatLngBounds } from '@agm/core';
import { DomSanitizer } from '@angular/platform-browser';
import { KrameriusApiService } from '../../services/kramerius-api.service';
import { SearchService } from '../../services/search.service';
import { DocumentItem } from '../../model/document_item.model';

@Component({
  selector: 'app-map-browse',
  templateUrl: './map-browse.component.html',
  styleUrls: ['./map-browse.component.scss']
})
export class MapBrowseComponent implements OnInit {

  lat = 49.206902;
  lng = 16.595591;
  zoom = 9

  bounds: LatLngBounds;

  focusedItem: DocumentItem;

  constructor(private api: KrameriusApiService, public searchService: SearchService, private _sanitizer: DomSanitizer) { }

  ngOnInit() {
    // this.loadMarkers();
  }

  onBoundsChange(bounds: LatLngBounds) {
    this.bounds = bounds;
  }

  onIdle() {
    this.loadMarkers();
  }

  loadMarkers() {
    let north = this.bounds.getNorthEast().lat();
    let south = this.bounds.getSouthWest().lat();
    let east = this.bounds.getNorthEast().lng();
    let west = this.bounds.getSouthWest().lng();
    // console.log(`${north} ${south} ${east} ${west}`);

    this.searchService.setBoundingBox(north, south, west, east);
// return;
    // const lat = (north + south)/2.0;
    // const lng = (east + west)/2.0;

    // this.api.getSearchResults(this.searchService.query.buildQueryForMap(north, south, west, east)).subscribe((response) => {

    // // this.api.getItems(lat, lng).subscribe((response) => {
    //   // console.log(response['response']['docs']);
    //   this.items = [];
    //   for (const item of response['response']['docs']) {
    //     const location = item['location'];
    //     if (!location || !location[0] || !location[1] || location[0].indexOf(',') < 0 || location[1].indexOf(',') < 0) {
    //       continue;
    //     }
    //     let title = item['dc.title'];
    //     if (title.length > 75) {
    //       title = title.substring(0, 75) + ' ...';
    //     }
    //     const south = +location[0].split(',')[0];
    //     const north = +location[1].split(',')[0];
    //     const west = +location[0].split(',')[1];
    //     const east = +location[1].split(',')[1];
    //     const isPoint = south === north && east === west;
    //     const authors = item['dc.creator'] ? item['dc.creator'].join(', ') : '';
    //     const geonames = item['geographic_names'] ? item['geographic_names'].join(', ') : '';
    //     const date = item['datum_str'];
    //     const pid = item['PID'];
    //     this.items.push({
    //       north: north,
    //       south: south,          
    //       east: east,
    //       west: west,
    //       isPoint: isPoint,
    //       authors: authors,
    //       geonames: geonames,
    //       date: date,
    //       pid: pid,
    //       title: title
    //     });
    //   }

    // })

  }




  thumb(uuid: string) {
    return this._sanitizer.bypassSecurityTrustStyle(`url(${this.api.getThumbUrl(uuid)})`);
  }



}


// interface Item {
//   north: number,
//   south: number,          
//   east: number,
//   west: number,
//   isPoint: boolean,
//   authors: string,
//   geonames: string,
//   date: string,
//   pid: string,
//   title: string
// }