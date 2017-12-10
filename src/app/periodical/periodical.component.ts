import { DocumentItem } from './../model/document_item.model';
import { LocalStorageService } from './../services/local-storage.service';
import { PeriodicalItem } from './../model/periodicalItem.model';
import { SolrService } from './../services/solr.service';
import { ActivatedRoute } from '@angular/router';
import { ModsParserService } from './../services/mods-parser.service';
import { KrameriusApiService } from './../services/kramerius-api.service';
import { Metadata } from './../model/metadata.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { PeriodicalService } from '../services/periodical.service';

@Component({
  selector: 'app-periodical',
  templateUrl: './periodical.component.html'
})
export class PeriodicalComponent implements OnInit, OnDestroy {

  constructor(private route: ActivatedRoute,
    public periodicalService: PeriodicalService) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const uuid = params.get('uuid');
      this.periodicalService.init(uuid);
    });
  }

  ngOnDestroy(): void {
    this.periodicalService.clear();
  }

}
