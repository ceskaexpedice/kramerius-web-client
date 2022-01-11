import { CollectionService } from './../services/collection.service';
import { Component, OnInit } from '@angular/core';
import { KrameriusApiService } from '../services/kramerius-api.service';
import { PageTitleService } from '../services/page-title.service';

@Component({
  selector: 'app-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.scss']
})
export class CollectionsComponent implements OnInit {

  loading = false;

  constructor(public collectionService: CollectionService,
    private pageTitle: PageTitleService,
    private krameriusApiService: KrameriusApiService ) { }

  ngOnInit() {
    this.pageTitle.setTitle('collections', null);
    if (!this.collectionService.ready()) {
      this.loading = true;
      this.krameriusApiService.getCollections().subscribe(
          results => {
              this.collectionService.assign(results);
              this.loading = false;
          }
      );
    }
  }

}
