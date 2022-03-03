import { HistoryService } from './../services/history.service';
import { DocumentItem } from './../model/document_item.model';
import { KrameriusApiService } from './../services/kramerius-api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { NotFoundError } from '../common/errors/not-found-error';
import { AppSettings } from '../services/app-settings';

@Component({
  selector: 'app-persistent-link',
  templateUrl: './persistent-link.component.html'
})
export class PersistentLinkComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private router: Router,
    private appSettings: AppSettings,
    private history: HistoryService,
    private krameriusApiService: KrameriusApiService) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const uuid = params.get('uuid');
      this.krameriusApiService.getItem(uuid).subscribe(
        (item: DocumentItem) => {
          this.resolveLink(item);
        },
        error => {
          if (error instanceof NotFoundError) {
              this.router.navigateByUrl(this.appSettings.getRouteFor('404'), { skipLocationChange: true });
          }
      });
    });
  }

  private resolveLink(item: DocumentItem) {
    this.history.removeCurrent();
    if (item.doctype === 'page') {
      const parentUuid = item.context[item.context.length - 2].uuid;
      this.router.navigate(['/view', parentUuid], { queryParams: { page: item.uuid } });
    } else if (item.doctype === 'article') {
      const parentUuid = item.context[item.context.length - 2].uuid;
      this.router.navigate(['/view', parentUuid], { queryParams: { article: item.uuid } });
    } else if (item.doctype === 'periodical' || item.doctype === 'periodicalvolume' || item.doctype === 'convolute') {
      this.router.navigate(['/periodical', item.uuid]);
    } else if (item.doctype === 'soundunit' || item.doctype === 'soundrecording') {
      this.router.navigate(['/music', item.uuid]);
    } else if (item.doctype === 'collection') {
      this.router.navigate(['/collection', item.uuid]);
    } else {
      this.router.navigate(['/view', item.uuid]);
    }
  }

}
