import { DocumentItem } from './../model/document_item.model';
import { LocalStorageService } from './../services/local-storage.service';
import { PeriodicalItem } from './../model/periodicalItem.model';
import { SolrService } from './../services/solr.service';
import { ActivatedRoute } from '@angular/router';
import { ModsParserService } from './../services/mods-parser.service';
import { KrameriusApiService } from './../services/kramerius-api.service';
import { Metadata } from './../model/metadata.model';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-periodical',
  templateUrl: './periodical.component.html',
  styleUrls: ['./periodical.component.scss']
})
export class PeriodicalComponent implements OnInit {

  uuid: string;
  metadata: Metadata;
  items: PeriodicalItem[];
  doctype: string;
  volumeYear;
  volumeNumber;
  minYear: number;
  maxYear: number;
  state: PeriodicalState = PeriodicalState.Loading;
  yearsLayoutEnabled = false;

  constructor(private route: ActivatedRoute,
    private solrService: SolrService,
    private modsParserService: ModsParserService,
    private localStorageService: LocalStorageService,
    private krameriusApiService: KrameriusApiService) { }

  ngOnInit() {
    this.state = PeriodicalState.Loading;
    const ctx = this;
    this.route.paramMap.subscribe(params => {
      ctx.uuid = params.get('uuid');
      if (ctx.uuid) {
        this.state = PeriodicalState.Loading;
        this.metadata = null;
        this.items = null;
        this.volumeYear = null;
        this.volumeNumber = null;
        this.minYear = null;
        this.maxYear = null;
        this.loadDocument(ctx.uuid);
      }
    });
  }

  isSuccess(): boolean {
    return this.state === PeriodicalState.Success;
  }

  isFailure(): boolean {
    return this.state === PeriodicalState.Failure;
  }

  isLoading(): boolean {
    return this.state === PeriodicalState.Loading;
  }

  private loadDocument(uuid: string) {
    const ctx = this;
    this.krameriusApiService.getItem(uuid).subscribe((item: DocumentItem)  => {
      ctx.doctype = item.doctype;
      this.krameriusApiService.getMods(item.root_uuid).subscribe(response => {
        ctx.metadata = ctx.modsParserService.parse(response);
        ctx.metadata.doctype = 'periodical';
        ctx.metadata.volume.number = item.volumeNumber;
        ctx.metadata.volume.year = item.volumeYear;
        if (ctx.doctype === 'periodical') {
          this.localStorageService.addToVisited(item, ctx.metadata);
          this.krameriusApiService.getPeriodicalVolumes(uuid).subscribe(volumes => {
            this.items = this.solrService.periodicalItems(volumes);
            this.calcYearsRange();
            this.state = PeriodicalState.Success;
          });
        } else if (ctx.doctype === 'periodicalvolume') {
          this.krameriusApiService.getPeriodicalIssues(item.root_uuid, uuid).subscribe(issues => {
            this.items = this.solrService.periodicalItems(issues);
            this.state = PeriodicalState.Success;
          });
        }
      });
    });

  }


  calcYearsRange() {
    const range = this.metadata.getYearRange();
    if (range && range.length === 2) {
      this.minYear = range[0];
      this.maxYear = range[1];
    }
    for (const item of this.items) {
      if (item.title && !isNaN(item.title as any)) {
        const year = parseInt(item.title, 10);
        if (!this.maxYear || year > this.maxYear) {
          this.maxYear = year;
        }
        if (!this.minYear || year < this.minYear) {
          this.minYear = year;
        }
      } else {
        return;
      }
    }
    this.yearsLayoutEnabled = true;
  }

}

export enum PeriodicalState {
  Success, Loading, Failure
}
