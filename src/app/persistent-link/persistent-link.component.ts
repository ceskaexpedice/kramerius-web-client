import { HistoryService } from './../services/history.service';
import { DocumentItem } from './../model/document_item.model';
import { KrameriusApiService } from './../services/kramerius-api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { NotFoundError } from '../common/errors/not-found-error';
import { AppSettings } from '../services/app-settings';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-persistent-link',
  templateUrl: './persistent-link.component.html'
})
export class PersistentLinkComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private router: Router,
    private appSettings: AppSettings,
    private history: HistoryService,
    private api: KrameriusApiService) { }

  ngOnInit() {  
    combineLatest([this.route.paramMap, this.route.queryParams]).subscribe(results => {
      const params = results[0];
      const queryParams = results[1];
      console.log('queryParams', queryParams);
      const fulltext = queryParams['fulltext'];
      console.log('fulltext', fulltext);
      // return;
      const uuid = params.get('uuid');
      this.api.getItem(uuid).subscribe(
        (item: DocumentItem) => {
          this.resolveLink(item, fulltext);
        },
        error => {
          if (error instanceof NotFoundError) {
              this.router.navigateByUrl(this.appSettings.getRouteFor('404'), { skipLocationChange: true });
          }
      });
    });
  }

  private resolveLink(item: DocumentItem, fulltext?: string) {
    this.history.removeCurrent();
    if (item.doctype === 'page') {
      const parentUuid = item.context[item.context.length - 2].uuid;
      this.router.navigate(['/view', parentUuid], { queryParams: { page: item.uuid, fulltext: fulltext } });
    } else if (item.doctype === 'article') {
      const parentUuid = item.context[item.context.length - 2].uuid;
      this.router.navigate(['/view', parentUuid], { queryParams: { article: item.uuid } });
    } else if (item.doctype === 'periodical' || item.doctype === 'periodicalvolume' || item.doctype === 'convolute') {
      this.router.navigate(['/periodical', item.uuid], { queryParams: { fulltext: fulltext } });
    } else if (item.doctype === 'soundrecording') {
      this.router.navigate(['/music', item.uuid]);
    } else if (item.doctype === 'soundunit') {
      const soundrecording = item.context.find(item => item.doctype == 'soundrecording');
      if (soundrecording && soundrecording.uuid) {
        this.router.navigate(['/music', soundrecording.uuid]);
      } else {
        this.router.navigateByUrl(this.appSettings.getRouteFor('404'), { skipLocationChange: true });
      }
    } else if (item.doctype === 'track') {
      const soundrecording = item.context.find(item => item.doctype == 'soundrecording');
      if (soundrecording && soundrecording.uuid) {
        this.router.navigate(['/music', soundrecording.uuid], { replaceUrl: true, queryParams: { 'track': item.uuid } });
      } else {
        this.router.navigateByUrl(this.appSettings.getRouteFor('404'), { skipLocationChange: true });
      }
    } else if (item.doctype === 'supplement') {
      const periodicalItem = item.context.find(item => item.doctype == 'periodicalitem');
      if (periodicalItem && periodicalItem.uuid) {
        this.api.getChildren(item.uuid).subscribe((items) => {
          if (items && items.length > 0) {
            this.router.navigate(['/view', periodicalItem.uuid], { queryParams: { page: items[0].pid } });
          } else {
            this.router.navigate(['/view', periodicalItem.uuid]);
          }
        });
        this.router.navigate(['/view', periodicalItem.uuid]);
      } else {
        this.router.navigate(['/view', item.uuid]);
      }
    } else if (item.doctype === 'collection') {
      this.router.navigate(['/collection', item.uuid]);
    } else {
      this.router.navigate(['/view', item.uuid], { queryParams: { fulltext: fulltext } });
    }
  }

}
