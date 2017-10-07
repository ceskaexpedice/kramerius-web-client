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

  constructor(private route: ActivatedRoute,
    private solrService: SolrService,
    private modsParserService: ModsParserService,
    private krameriusApiService: KrameriusApiService) { }

  ngOnInit() {
    const ctx = this;
    this.route.paramMap.subscribe(params => {
      ctx.uuid = params.get('uuid');
      if (ctx.uuid) {
        this.loadDocument(ctx.uuid);
      }
    });
  }

  private loadDocument(uuid: string) {
    const ctx = this;
    this.krameriusApiService.getItem(uuid).subscribe(item => {
      ctx.doctype = item['model'];
      this.krameriusApiService.getMods(item['root_pid']).subscribe(response => {
        ctx.metadata = ctx.modsParserService.parse(response);
        ctx.metadata.doctype = 'periodical';
        if (item['details']) {
          ctx.metadata.volume.number = item['details']['volumeNumber'];
          ctx.metadata.volume.year = item['details']['year'];
        }
      });
      if (ctx.doctype === 'periodical') {
        this.krameriusApiService.getPeriodicalVolumes(uuid).subscribe(response => {
          this.items = this.solrService.periodicalItems(response);
        });
      } else if (ctx.doctype === 'periodicalvolume') {
        this.krameriusApiService.getPeriodicalIssues(item['root_pid'], uuid).subscribe(response => {
          this.items = this.solrService.periodicalItems(response);
        });
      }
    });

  }

}
