import { CollectionService } from './../services/collection.service';
import { Component, OnInit } from '@angular/core';
import { KrameriusApiService } from '../services/kramerius-api.service';

@Component({
  selector: 'app-collections',
  templateUrl: './collections.component.html'
})
export class CollectionsComponent implements OnInit {

  constructor(public collectionService: CollectionService,
    private krameriusApiService: KrameriusApiService ) { }

  ngOnInit() {
    if (!this.collectionService.ready()) {
      this.krameriusApiService.getCollections().subscribe(
          results => {
              this.collectionService.assign(results);
          }
      );
    }
  }

}
