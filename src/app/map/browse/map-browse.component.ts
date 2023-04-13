import { Component, OnDestroy, OnInit, ViewChild, ChangeDetectorRef, AfterContentChecked } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { KrameriusApiService } from '../../services/kramerius-api.service';
import { SearchService } from '../../services/search.service';
import { DocumentItem } from '../../model/document_item.model';
import { AppSettings } from '../../services/app-settings';
import { AuthService } from '../../services/auth.service';
import { LicenceService } from '../../services/licence.service';
import { GoogleMap } from '@angular/google-maps';
import { MapSeriesService } from '../../services/mapseries.service';
import { Subscription } from 'rxjs';
import { LocalStorageService } from '../../services/local-storage.service';

@Component({
  selector: 'app-map-browse',
  templateUrl: './map-browse.component.html',
  styleUrls: ['./map-browse.component.scss']
})
export class MapBrowseComponent implements OnInit, OnDestroy, AfterContentChecked {
  focusedItem: DocumentItem;
  locks: any;
  
  // CLUSTERS
  activeNavigationTab: string;
  points: any = [];
  clusterArray: any;
  selectedCluster: any;
  waitForBounds = false;
  searchResults: Subscription;
  calculatorCount: number = 5;

  minimumClusterSize = 2;
  markersCount = 0;
  mapsCount = 0;

  @ViewChild('googleMap') googleMap: GoogleMap;
  @ViewChild('markerCluster') markerClusterer: MarkerClusterer;


  constructor(private api: KrameriusApiService, 
              public searchService: SearchService, 
              public auth: AuthService, 
              private licences: LicenceService,
              public settings: AppSettings,
              private _sanitizer: DomSanitizer,
              private localStorageService: LocalStorageService,
              private changeDetector: ChangeDetectorRef,
              public ms: MapSeriesService) {
  }

  ngOnInit() {
    console.log('map browse ngOnInit')
    const q = this.searchService.query;
    const preferredtype = this.localStorageService.getProperty(LocalStorageService.MAP_ACTIVE_TAB);
    if (this.settings.mapSearchType == 'all' && ['markers', 'maps'].includes(preferredtype)) {
      this.activeNavigationTab = preferredtype;
    } else {
      this.activeNavigationTab = this.settings.mapSearchTypeDefault;

    }
    if (q.isBoundingBoxSet()) {
      this.waitForBounds = true;
      this.ms.init( () => {
        setTimeout(() => {
          let bounds = new google.maps.LatLngBounds(
            {"lat": q.south, "lng": q.west }, 
            {"lat": q.north, "lng": q.east }
          );
          this.waitForBounds = false;
          this.googleMap.fitBounds(bounds, 0);
          if (['all', 'markers'].includes(this.settings.mapSearchType)) {
            this.searchResults = this.searchService.watchAllResults().subscribe((results: DocumentItem[]) => {
              this.handleSearchResults(results);
            });
            this.handleSearchResults(this.searchService.allResults);
          }
        }, 50);
      });
    } else {
      this.ms.init(() => {});
    }
    this.locks = {};
  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  ngOnDestroy(): void {
    if (this.searchResults) {
      this.searchResults.unsubscribe();
    }
  } 



  handleSearchResults(results: DocumentItem[]) {
    const markerDocs = this.filterDocsByBounds(results);
    this.markersCount = markerDocs.length;
    if (this.activeNavigationTab === 'markers') {
      this.points = this.extractPoints(markerDocs);
      const zoom = this.googleMap.getZoom();
      this.minimumClusterSize = 2;
      console.log('zoom', zoom);
      if (zoom > 15) {
        this.minimumClusterSize = 5;
      } else if (zoom > 17) {
        this.minimumClusterSize = 1000;
      }
    } else {
      this.points = [];
    }
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
    const bounds = this.googleMap.getBounds();
    const north = bounds.getNorthEast().lat();
    const south = bounds.getSouthWest().lat();
    const east = bounds.getNorthEast().lng();
    const west = bounds.getSouthWest().lng();
    this.searchService.setBoundingBox(north, south, west, east);
  }

  thumb(uuid: string) {
    return this._sanitizer.bypassSecurityTrustStyle(`url(${this.api.getThumbUrl(uuid)})`);
  }

  changeNavigationTab(tab: string) {
    this.activeNavigationTab = tab;
    this.localStorageService.setProperty(LocalStorageService.MAP_ACTIVE_TAB, tab);
    this.handleSearchResults(this.searchService.allResults);
  }

  filterDocsByBounds(results:DocumentItem[]): DocumentItem[] {
    let points = [];
    const bounds = this.googleMap.getBounds();
    if (!bounds) {
      return [];
    }
    const north = bounds.getNorthEast().lat();
    const south = bounds.getSouthWest().lat();
    const east = bounds.getNorthEast().lng();
    const west = bounds.getSouthWest().lng();
    for (const item of results) {
      if (item.isPoint()) {
        if (item.north > north|| item.south < south || item.east > east || item.west < west) {
          continue;
        }
        points.push(item);
      }
    }
    return points; 
  }

  extractPoints(results:DocumentItem[]) {
    let points = [];
    for (const item of results) {
      let geonames = item.geonames;
      if (geonames) {
        if (geonames[0] === 'Česko') {
            geonames.splice(0,1)
        }
        // JEN POSLEDNI GEONAME
        geonames = geonames.slice(-1)
        // console.log(geonames);
      }

      if (!points.some(e => (e.position.lat === item.north && e.position.lng === item.west))) {
        points.push(
          {
            "position": {
              "lat": item.north,
              "lng": item.west
            },
            "items": [{
              "pid": item.uuid,
              "title": item.title,
              "date": item.date,
              "authors": item.authors,
              "geonames": geonames,
              "url": item.url
            }]
          }
        )
      }
      else {
        let point = points.find(e => (e.position.lat === item.north && e.position.lng === item.west))
        point.items.push(
          {
            "pid": item.uuid,
            "title": item.title,
            "date": item.date,
            "authors": item.authors,
            "geonames": geonames,
            "url": item.url
          }
        )
      }
    }
    return points;
  }

  onClusteringEnd(markerCluster: any) {
    let clusters = markerCluster.getClusters();
    console.log('clusters', clusters.length);
    let clusterArray = [];
    if (this.clusterArray) {
      for (const cluster of this.clusterArray) {
        google.maps.event.clearListeners(cluster.markerClusterer_, 'mouseover');
        google.maps.event.clearListeners(cluster.markerClusterer_, 'mouseout');
      }
    }
    let f = true;
    for (const cluster of clusters) {
      cluster['info'] = this.clusterInfo(cluster);
      clusterArray.push(cluster); 
      if (f) {
        google.maps.event.addListener(cluster.markerClusterer_, 'mouseover', (a: any) => {
          this.highlightCluster(null, a);
        });
        google.maps.event.addListener(cluster.markerClusterer_, 'mouseout', (a: any) => {
          this.highlightCluster(null, null);
        });
        f = false;
      } 
      // cluster.markerClusterer_.addListener('mouseover', (a: any) => {
      //   this.highlightCluster(null, a);
      // });
      // cluster.markerClusterer_.addListener('mouseout', (a: any) => {
      //   this.highlightCluster(null, null);
      // });

    }
    if (clusterArray.length > 1) {
      clusterArray.sort((a, b) => {
        if (b.markers_ && a.markers_)
          return b.markers_.length - a.markers_.length;
        else return 0;
      });
    }
    this.clusterArray = clusterArray;
  }

  onClusterClick(markerCluster:any) {
    // this.selectedCluster = markerCluster;
  }

  highlightCluster(event: any, cluster: any) {
    console.log('highlightCluster', !!cluster);
    if (this.selectedCluster == cluster) {
      return;
    }
    // console.log('highlightCluster', cluster);
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!this.clusterArray) { 
      return;
    }
    this.selectedCluster = cluster;
    let i = 0;
    for (let item of this.clusterArray) {
      if (item == cluster) {
        if (!event) {
          const element = document.getElementById("app-point-" + i);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
          }
        }
        item.clusterIcon_.styles_[0].url = MapSeriesService.cluster2Img;
        item.updateIcon();
        item.markers_[0].setIcon(this.ms.svgMarker2);
      } else {
        item.clusterIcon_.styles_[0].url = MapSeriesService.clusterImg;
        item.updateIcon();
        item.markers_[0].setIcon(this.ms.svgMarker);
      }
      i++;
    }
    this.changeDetector.detectChanges();
  }

  onMouseOverMarker(event: any, marker: any) {
    // console.log('onMouseOverMarker');
    if (!marker) {
      return null;
    }
    marker.marker.setIcon(this.ms.svgMarker2);
    let i = -1;
    // console.log(`position`, `${marker._position.lat} -- ${marker._position.lng}`)
    // console.log('marker', marker);
    for (let item of this.clusterArray) {
      // console.log('item', item);
      i++;
      // if (item.markers_.length > 1) {
      //   continue;
      // }
      // const position = marker._position;
      // console.log('MP', position);
      // console.log('TO MP', item.markers_[0].position);
      // console.log('check', item.markers_[0] == marker);
      // console.log(`${item.center_.lat()} -- ${item.center_.lng()}`)
      if (item.markers_[0] == marker.marker) {
        this.selectedCluster = item;
        const element = document.getElementById("app-point-" + i);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
        }
        break;
      }
      // if (item.markers_[0].position.toJSON().lat == position.lat && item.markers_[0].position.toJSON().lng == position.lng) {
      //   this.selectedCluster = item;
      //   // console.log('marker', marker);
      //   // console.log('item', item.center_.lat());

      //   console.log('found');
      //   console.log('item', item.markers_[0]);
      //   console.log('marker', marker.marker);

      //   const element = document.getElementById("app-point-" + i);
      //   if (element) {
      //     element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      //   }
      //   break;
      // }
    }
  }

  onMouseOutMarker(event: any, marker: any) {
    this.selectedCluster = null;
    if (!marker) {
      return;
    }
    marker.marker.setIcon(this.ms.svgMarker)
  }

  onClusterClickFromDiv(markerCluster: any) {
    this.googleMap.fitBounds(markerCluster['info']['bounds'], 0);
  }

  findMarkerByPosition(lat: number, lng: number) {
    // console.log(this.points)
    for (const point of this.points) {
      if (point.position.lat == lat && point.position.lng == lng) {
        return point.items;
      }
      // else {
      //   console.log('whaaat?')
      // }
    }
  }

  clusterInfo(item: any) {
    let geonames: any = {};
    let markers = 0;
    let documents = 0;
    let n = -90;
    let s = 90;
    let w = 180;
    let e = -180;
    for (const marker of item.markers_) {
      const lat = Number(marker.getPosition().toJSON().lat);
      const lng = Number(marker.getPosition().toJSON().lng);
      if (n < lat) {
        n = lat;
      }
      if (s > lat) {
        s = lat;
      }
      if (e < lng) {
        e = lng;
      }
      if (w > lng) {
        w = lng;
      }
      let record = this.findMarkerByPosition(lat, lng);
      if (record) {

        markers += 1;
        for (const item of record) {
          documents += 1;
          for (const g of item.geonames) {
            if (!geonames[g]) {
              geonames[g] = { count: 1, pid: item.pid };
            } else {
              geonames[g]['count'] += 1;
            }
          }
        }
      }
      // console.log(record.geographic_names)
    }
    let geoArray = [];
    for (const keyvalue in geonames) {
      geoArray.push({ title: keyvalue, count: geonames[keyvalue]['count'], pid: geonames[keyvalue]['pid'] });
    }
    geoArray.sort((a, b) => b.count - a.count);
    // console.log(geoArray)

    let title = '';
    let pid = '';
    if (geoArray.length > 0) {
      title = geoArray[0]['title'];
      pid = geoArray[0]['pid'];
    }
    return {
      pid: pid,
      title: title,
      documents: documents,
      markers: markers,
      geonames: geoArray,
      bounds: new google.maps.LatLngBounds(
        {"lat": s, "lng": w }, 
        {"lat": n, "lng": e }
      )
    }
  }

  labelToString(markerlabel: number) {
    return String(markerlabel)
  }

  myCalculator(markers: any, clusterIconStylesCount: number): ClusterIconInfo {
    let index = 0;
    let count: number = markers.length;
    let clusterNumber = 0;
    for (const marker of markers) {
      let markerLabel = Number(marker.label.text)
      clusterNumber = clusterNumber + markerLabel
    }

    return {
      index: index,
      text: `${clusterNumber}`,
      title: ""
    }
  }

}
