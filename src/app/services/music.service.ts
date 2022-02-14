import { SoundUnit } from './../model/soundunit.model';
import { Track } from './../model/track.model';
import { KrameriusApiService } from './kramerius-api.service';
import { LocalStorageService } from './local-storage.service';
import { saveAs } from 'file-saver';
import { DocumentItem } from './../model/document_item.model';
import { Injectable } from '@angular/core';
import { Metadata } from '../model/metadata.model';
// import { NgxGalleryImage } from 'ngx-gallery';
import { PageTitleService } from './page-title.service';
import { NotFoundError } from '../common/errors/not-found-error';
import { Router } from '@angular/router';
import { AppSettings } from './app-settings';
import { AnalyticsService } from './analytics.service';
import { MatDialog } from '@angular/material/dialog';
import { BasicDialogComponent } from '../dialog/basic-dialog/basic-dialog.component';
import { NgxGalleryImage } from '@kolkov/ngx-gallery';

@Injectable()
export class MusicService {

  audio;
  activeTrack: Track;
  downloadedTrack: Track;
  soundUnitIndex = 0;
  uuid: string;
  metadata: Metadata;
  document: DocumentItem;
  state: MusicState = MusicState.None;
  tracks: Track[] = [];
  soundUnits: SoundUnit[] = [];
  playing: boolean;
  canPlay: boolean;
  trackPosition: number;
  trackDuration: number;
  trackPositionText: string;
  trackDurationText: string;
  error: string;

  activeMobilePanel: String;

  galleryImages: NgxGalleryImage[];

  downloadingTrackIndex: number;

  progress: number;

  constructor(
    private router: Router,
    private appSettings: AppSettings,
    private pageTitle: PageTitleService,
    public analytics: AnalyticsService,
    private dialog: MatDialog,
    private localStorageService: LocalStorageService,
    private krameriusApiService: KrameriusApiService) {
  }

  init(uuid: string) {
    this.clear();
    this.uuid = uuid;
    this.state = MusicState.Loading;
    this.krameriusApiService.getItem(uuid).subscribe((item: DocumentItem) => {
      this.document = item;
      this.krameriusApiService.getMetadata(this.document.root_uuid).subscribe((metadata: Metadata) => {
        this.metadata = metadata
        this.metadata.addToContext('soundrecording', this.metadata.uuid);
        this.metadata.assignDocument(item);
        this.metadata.licence = this.document.licence;
        this.metadata.doctype = 'soundrecording';
        this.pageTitle.setTitle(null, this.metadata.getShortTitle());
        this.localStorageService.addToVisited(this.document, this.metadata);
        this.loadSoundUnits();
      });
    },
    error => {
      if (error instanceof NotFoundError) {
        this.router.navigateByUrl(this.appSettings.getRouteFor('404'), { skipLocationChange: true });
      }
  });
  }

  private addImageToGallery(uuid: string, title: string) {
    this.galleryImages.push({
      small: this.krameriusApiService.getThumbUrl(uuid),
      medium: this.krameriusApiService.getThumbUrl(uuid),
      big: this.krameriusApiService.getScaledJpegUrl(uuid, 1500),
      description: title
    });
  }

  private loadSoundUnits() {
    this.krameriusApiService.getChildren(this.uuid).subscribe((units) => {
      for (const unit of units) {
        if (unit['model'] === 'soundunit') {
          this.soundUnits.push(new SoundUnit(unit['pid'], unit['title']));
        } else if (unit['model'] === 'page') {
          this.addImageToGallery(unit['pid'], unit['title']);
        }
      }
      this.soundUnitIndex = 0;
      for (const su of this.soundUnits) {
        this.addImageToGallery(su.uuid, su.name);
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
            this.tracks.push(new Track(track['pid'], track['title'], track['length'], unit, track['policy'] === 'public'));
          }
        }
        this.soundUnitIndex += 1;
        this.loadTrack();
      });
    } else {
      this.state = MusicState.Success;
      this.nextTrack(false);
    }
  }

  isActiveTrack(track: Track): boolean {
    return this.activeTrack === track;
  }

  nextTrack(autoplay: boolean) {
    if (this.tracks.length === 0) {
      return;
    }
    if (!this.activeTrack) {
      this.changeTrack(this.tracks[0], autoplay);
    } else {
      let index = 0;
      for (const track of this.tracks) {
        if (track === this.activeTrack) {
          break;
        }
        index += 1;
      }
      index += 1;
      if (index >= this.tracks.length) {
        this.changeTrack(this.tracks[0], false);
      } else {
        this.changeTrack(this.tracks[index], autoplay);
      }
    }
  }


  selectTrack(track: Track) {
    this.analytics.sendEvent('music', 'select track', track.name);
    if (track === this.activeTrack) {
      if (this.isPlaying()) {
        this.pauseTrack();
      } else {
        this.playTrack();
      }
    } else {
      this.changeTrack(track, true);
    }
  }



  changeTrack(track: Track, autoplay: boolean) {
    this.trackPosition = -1;
    this.trackDuration = -1;
    this.trackPositionText = '';
    this.trackDurationText = '';
    this.progress = 0;
    this.canPlay = false;
    this.playing = false;
    this.error = null;
    if (!track) {
      return;
    }
    this.activeTrack = track;
    const url = this.krameriusApiService.getMp3Url(this.activeTrack.uuid);
    if (this.audio) {
      this.audio.setAttribute('src', url);
      this.audio.load();
    } else {
      this.audio = new Audio(url);
      this.audio.load();
    }
    this.audio.ontimeupdate = () => {
      this.trackPosition = Math.round(this.audio.currentTime);
      this.trackPositionText = this.formatTime(this.trackPosition);
      if (this.trackDuration) {
        this.progress = this.trackPosition / this.trackDuration;
      }
    };
    this.audio.onloadedmetadata = () => {
      this.trackDuration = Math.round(this.audio.duration);
      this.trackDurationText = this.formatTime(this.trackDuration);
      this.trackPosition = Math.round(this.audio.currentTime);
      this.trackPositionText = this.formatTime(this.trackPosition);
    };
    this.audio.onended = () => {
      this.nextTrack(true);
    };
    this.audio.oncanplay = () => {
      this.canPlay = true;
      if (autoplay) {
        this.playTrack();
      }
    };
    this.audio.onerror = (er: any) => {
      this.canPlay = false;
      console.log('onError', er);
      if (!track.isPublic) {
        this.error = 'inaccessible_track';
      } else {
        this.error = 'unknown_error';
      }
    };

  }



  downloadTrack(e, track: Track) {
    this.analytics.sendEvent('music', 'download', track.name);
    e.preventDefault();
    e.stopPropagation();
    if (track === null) {
        return;
    }
    if (!track.isPublic) {
      this.dialog.open(BasicDialogComponent, { data: {
        title: 'common.warning',
        message: 'music.inaccessible_track',
        button: 'common.close'
    }, autoFocus: false });
      return;
    }
    this.downloadedTrack = track;
    this.krameriusApiService.downloadMp3(track.uuid).subscribe(
      blob => {
        saveAs(blob, track.name + '.mp3');
        this.downloadedTrack = null;
      },
      error => {
        this.downloadedTrack = null;
        console.error('MP3 download failed', error);
      }
    );
    this.downloadingTrackIndex = -1;
  }



  isPlaying(): boolean {
    return this.playing;
  }

  playTrack() {
    if (this.audio && this.canPlay) {
      this.playing = true;
      this.audio.play();
    }
  }

  pauseTrack() {
    if (this.audio && this.canPlay) {
      this.playing = false;
      this.audio.pause();
    }
  }

  changeProgress(progress: number) {
    this.audio.currentTime = progress * this.trackDuration;
  }

  getSoundUnitImageUrl(): string {
    if (this.activeTrack) {
      return this.krameriusApiService.getThumbUrl(this.activeTrack.unit.uuid);
    }
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

  getAlbumDate(): string {
    if (this.metadata.publishers && this.metadata.publishers.length > 0) {
      return this.metadata.publishers[0].date
    }
  }


  clear() {
    this.state = MusicState.None;
    this.metadata = null;
    this.document = null;
    this.state = MusicState.None;
    this.tracks = [];
    this.soundUnits = [];
    this.soundUnitIndex = 0;
    this.galleryImages = [];
    this.activeTrack = null;
    this.pauseTrack();
    this.audio = null;
    this.trackPosition = -1;
    this.trackDuration = -1;
    this.trackPositionText = '';
    this.trackDurationText = '';
    this.playing = false;
    this.canPlay = false;
    this.activeMobilePanel = 'player';
    this.downloadingTrackIndex = -1;
    this.downloadedTrack = null;
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
