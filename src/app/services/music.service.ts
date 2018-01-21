import { SoundUnit } from './../model/soundunit.model';
import { Track } from './../model/track.model';
import { KrameriusApiService } from './kramerius-api.service';
import { LocalStorageService } from './local-storage.service';
import { ModsParserService } from './mods-parser.service';
import { SolrService } from './solr.service';
import { DocumentItem } from './../model/document_item.model';
import { PeriodicalItem } from './../model/periodicalItem.model';
import { Injectable } from '@angular/core';
import { Metadata } from '../model/metadata.model';

@Injectable()
export class MusicService {

  soundUnitIndex = 0;
  uuid: string;
  metadata: Metadata;
  document: DocumentItem;
  state: MusicState = MusicState.None;
  tracks: Track[] = [];
  soundUnits: SoundUnit[] = [];

  constructor(private solrService: SolrService,
    private modsParserService: ModsParserService,
    private localStorageService: LocalStorageService,
    private krameriusApiService: KrameriusApiService) {
  }

  init(uuid: string) {
    this.clear();
    this.uuid = uuid;
    this.state = MusicState.Loading;
    this.krameriusApiService.getItem(uuid).subscribe((item: DocumentItem) => {
      this.document = item;
      this.krameriusApiService.getMods(this.document.root_uuid).subscribe(response => {
        this.metadata = this.modsParserService.parse(response);
        this.metadata.doctype = 'soundrecording';
        this.localStorageService.addToVisited(this.document, this.metadata);
        this.loadSoundUnits();
      });
    });
  }


  private loadSoundUnits() {
    this.krameriusApiService.getChildren(this.uuid).subscribe((units) => {
      for (const unit of units) {
        if (unit['model'] === 'soundunit') {
          this.soundUnits.push(new SoundUnit(unit['pid'], unit['title']));
        }
      }
      this.soundUnitIndex = 0;
      this.loadTrack();
    });
  }


  private loadTrack() {
    if (this.soundUnitIndex < this.soundUnits.length) {
      const unit = this.soundUnits[this.soundUnitIndex];
      this.krameriusApiService.getChildren(unit['uuid']).subscribe((tracks) => {
        for (const track of tracks) {
          if (track['model'] === 'track') {
            this.tracks.push(new Track(track['pid'], track['title'], unit['name'], track['policy'] === 'public'));
          }
        }
        this.soundUnitIndex += 1;
        this.loadTrack();
      });
    } else {
      this.state = MusicState.Success;
    }
  }

    // KrameriusApi.getChildren(parentPid).then(function(response) {
    //     var children = response.data;
    //     children.forEach(function(child) {
    //         if(child.model === 'track') {
    //             child.parentTitle = parentTitle;

    //             $scope.tracks.push(child);
    //             if($scope.tracks.length == 1) {
    //                 $scope.selectTrack(0);
    //             }
    //         } else if(child.model === 'soundunit') {
    //             loadTracks(child.pid, child.title);
    //          } else if(child.model === 'page' && root) {
    //             if($scope.pages.length < 15) {
    //                 $scope.pages.push(child);
    //             }
    //         }
    //     });
    //     Loading.stop();
    // },
    // function(response, status) {
    //     Loading.stop();
    //     //DialogService.dataError();
    // });







  clear() {
    this.state = MusicState.None;
    this.metadata = null;
    this.document = null;
    this.state = MusicState.None;
    this.tracks = [];
    this.soundUnits = [];
    this.soundUnitIndex = 0;
  }

  isStateSuccess(): boolean {
    return this.state === MusicState.Success;
  }

  isStateFailure(): boolean {
    return this.state === MusicState.Failure;
  }

  isStateLoading(): boolean {
    return this.state === MusicState.Loading;
  }


}


export enum MusicState {
  Success, Loading, Failure, None
}
