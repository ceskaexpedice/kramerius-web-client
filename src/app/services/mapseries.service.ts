import { Injectable } from '@angular/core';
import { AppSettings } from './app-settings';

@Injectable()
export class MapSeriesService {

  rootCollectionUUID = "uuid:ee2388c6-7343-4a7f-9287-15bc8b564cbf"; 

  constructor(
    private settings: AppSettings,
  ) { }


  getRootUrl(): string {
    return this.settings.getRouteFor(`collection/${this.rootCollectionUUID}`)
  }

}
