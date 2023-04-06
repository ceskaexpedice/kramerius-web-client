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

@Component({
  selector: 'app-map-browse',
  templateUrl: './map-browse.component.html',
  styleUrls: ['./map-browse.component.scss']
})
export class MapBrowseComponent implements OnInit, OnDestroy, AfterContentChecked {
  focusedItem: DocumentItem;
  locks: any;
  
  // CLUSTERS
  activeNavigationTab: any = 'maps';
  points: any = [];
  clusterArray: any;
  selectedCluster: any;
  waitForBounds = false;
  loadingMarkers: boolean;
  searchResults: Subscription;
  calculatorCount: number = 5;

  @ViewChild('googleMap') googleMap: GoogleMap;
  @ViewChild('markerCluster') markerClusterer: MarkerClusterer;


  constructor(private api: KrameriusApiService, 
              public searchService: SearchService, 
              public auth: AuthService, 
              private licences: LicenceService,
              public settings: AppSettings,
              private _sanitizer: DomSanitizer,
              private changeDetector: ChangeDetectorRef,
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
          this.googleMap.fitBounds(bounds, 0);
        }, 50);
      });
    } else {
      this.ms.init(() => {});
    }

    if (this.settings.mapMarkers) {
      this.loadingMarkers = true;
      this.searchResults = this.searchService.watchAllResults().subscribe((results: DocumentItem[]) => {
        this.handleSearchResults(results);
        this.loadingMarkers = false;
      });
      this.handleSearchResults(this.searchService.allResults);
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
    // console.log('-- results', results);
    if (this.activeNavigationTab === 'graphics') {
      this.points = this.extractPoints(results)
    }
    else {
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
    // console.log(north, east)
  }

  thumb(uuid: string) {
    return this._sanitizer.bypassSecurityTrustStyle(`url(${this.api.getThumbUrl(uuid)})`);
  }

  changeNavigationTab(tab: string) {
    this.activeNavigationTab = tab;
    if (tab == 'maps') {
      this.points = [];
    }
    this.handleSearchResults(this.searchService.allResults);
  }

  extractPoints(results:DocumentItem[]) {
    let points = [];
    for (const item of results) {
      // ZJISTIM, ZDA JE TO BOD
      if (item.north === item.south && item.west === item.east) {
        // console.log(item)
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
    }
    return points;
  }

  onClusteringEnd(markerCluster: any) {
    console.log('onClusteringEnd begin')
    let clusters = markerCluster.getClusters();
    let clusterArray = [];
    for (const cluster of clusters) {
      clusterArray.push(cluster); 
      cluster.markerClusterer_.addListener('mouseover', (a: any) => {
        this.highlightCluster(null, a);
      });
      cluster.markerClusterer_.addListener('mouseout', (a: any) => {
        this.highlightCluster(null, null);
      });
      // console.log(cluster)
      // console.log(this.points)
      // console.log(cluster.markers_[0].getPosition().toJSON().lat)
      // console.log(this.findMarkerByPosition(cluster.markers_[0].getPosition().toJSON().lat, cluster.markers_[0].getPosition().toJSON().lat))
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
    this.selectedCluster = markerCluster;
  }

  highlightCluster(event: any, cluster: any) {
    if (this.selectedCluster == cluster) {
      return;
    }
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
            element.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
          }
        }
        item.clusterIcon_.styles_[0].url = 'assets/markers/cluster/n2.png';
        item.updateIcon();
        item.markers_[0].setIcon(this.ms.svgMarker2);
      } else {
        item.clusterIcon_.styles_[0].url = 'assets/markers/cluster/n1.png';
        item.updateIcon();
        item.markers_[0].setIcon(this.ms.svgMarker);
      }
      if (item.markers_.length == 1 && !event) {
        if (cluster && cluster._position) {
          if ((item.markers_[0].position.toJSON().lat == cluster._position.lat) && (item.markers_[0].position.toJSON().lng == cluster._position.lng)) {
            const element = document.getElementById("app-point-" + i);
            if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
            }
          }
        }  
      }
      i++;
    }
  }

  onMouseOverMarker(event: any, marker: any) {
    if (marker) {
      this.highlightCluster(null, marker);
      marker.marker.setIcon(this.ms.svgMarker2)
    }
  }

  onMouseOutMarker(event: any, marker: any) {
    marker.marker.setIcon(this.ms.svgMarker)
  }

  onClusterClickFromDiv(markerCluster: any) {
    console.log('clusterClickedFromDiv')
    markerCluster.clusterIcon_.styles_[0].url = 'assets/markers/cluster/n1.png';
    markerCluster.markers_[0].setIcon(this.ms.svgMarker);
    markerCluster.updateIcon();
    this.googleMap.fitBounds(markerCluster.bounds_);
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

  analyzeGeonamesOfCluster(item: any) {
    let geonames: any = {};
    for (const marker of item.markers_) {
      let record = this.findMarkerByPosition(
        marker.getPosition().toJSON().lat,
        marker.getPosition().toJSON().lng
      );
      if (record) {
        // console.log(record)
        for (const item of record) {
          for (const g of item.geonames) {
            if (!geonames[g]) {
              geonames[g] = 1;
            } else {
              geonames[g] += 1;
            }
          }
        }
      }
      
      // console.log(record.geographic_names)
    }
    let geoArray = [];
    for (const keyvalue in geonames) {
      geoArray.push({ key: keyvalue, count: geonames[keyvalue] });
    }
    geoArray.sort((a, b) => b.count - a.count);
    // console.log(geoArray)
    return geoArray;
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
