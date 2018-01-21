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

  audio;
  activeTrack: Track;
  coverImageUuid: string;
  soundUnitIndex = 0;
  uuid: string;
  metadata: Metadata;
  document: DocumentItem;
  state: MusicState = MusicState.None;
  tracks: Track[] = [];
  soundUnits: SoundUnit[] = [];
  playing = false;

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
        } else if (!this.coverImageUuid && unit['model'] === 'page') {
          this.coverImageUuid = unit['pid'];
        }
      }
      this.soundUnitIndex = 0;
      if (!this.coverImageUuid && this.soundUnits.length > 0) {
        this.coverImageUuid = this.soundUnits[0].uuid;
      }
      this.loadTrack();
    });
  }


  private loadTrack() {
    if (this.soundUnitIndex < this.soundUnits.length) {
      const unit = this.soundUnits[this.soundUnitIndex];
      this.krameriusApiService.getChildren(unit['uuid']).subscribe((tracks) => {
        for (const track of tracks) {
          if (track['model'] === 'track') {
            this.tracks.push(new Track(track['pid'], track['title'], unit, track['policy'] === 'public'));
          }
        }
        this.soundUnitIndex += 1;
        this.loadTrack();
      });
    } else {
      this.state = MusicState.Success;
      if (this.tracks.length > 0) {
        this.selectTrack(this.tracks[0]);
        console.log(this.tracks[0]);
      }
    }
  }

  isActiveTrack(track: Track): boolean {
    return this.activeTrack === track;
  }

  selectTrack(track: Track) {
    console.log('track', track);
    this.activeTrack = track;
    const url = this.krameriusApiService.getMp3Url(this.activeTrack.uuid);
    if (this.audio) {
      this.audio.setAttribute('src', url);
    } else {
      this.audio = new Audio(url);
    }
    console.log('audio', this.audio);
  }

  isPlaying(): boolean {
    return this.playing;
  }

  playTrack() {
    if (this.audio) {
      this.playing = true;
      this.audio.play();
    }
  }

  pauseTrack() {
    if (this.audio) {
      this.playing = false;
      this.audio.pause();
      console.log("audio.currentSrc", this.audio.currentSrc );
      console.log("audio.currentTime", this.formatTime(this.audio.currentTime);
      console.log("audio.duration", this.formatTime(this.audio.duration));

    }
  }

  getCoverImageUrl(): string {
    return this.krameriusApiService.getThumbUrl(this.coverImageUuid);
  }

  getSoundUnitImageUrl(): string {
    if (this.activeTrack) {
      return this.krameriusApiService.getThumbUrl(this.activeTrack.unit.uuid);
    }
  }

  hasCoverImage(): boolean {
    return this.coverImageUuid !== null;
  }

  getAlbumTitle(): string {
    return this.metadata.getTitle();
  }

  getAlbumAuthor(): string {
    if (this.metadata.authors.length > 0) {
      return this.metadata.authors[0].name;
    }
    return '';
  }

  clear() {
    this.state = MusicState.None;
    this.metadata = null;
    this.document = null;
    this.state = MusicState.None;
    this.tracks = [];
    this.soundUnits = [];
    this.soundUnitIndex = 0;
    this.coverImageUuid = null;
    this.activeTrack = null;
    this.audio = null;
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



  private formatTime(secs: number) {
    const hr  = Math.floor(secs / 3600);
    const min = Math.floor((secs - (hr * 3600)) / 60);
    const sec = Math.floor(secs - (hr * 3600) -  (min * 60));
    const m = min < 10 ? '0' + min : '' + min;
    const s = sec < 10 ? '0' + sec : '' + sec;
    const h = hr > 0 ? hr + ':' : '';
    return h + m + ':' + s;
  }

}


export enum MusicState {
  Success, Loading, Failure, None
}
