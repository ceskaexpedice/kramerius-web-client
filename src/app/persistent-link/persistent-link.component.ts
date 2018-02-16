import { DocumentItem } from './../model/document_item.model';
import { KrameriusApiService } from './../services/kramerius-api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-persistent-link',
  templateUrl: './persistent-link.component.html'
})
export class PersistentLinkComponent implements OnInit {

  constructor(private route: ActivatedRoute, private router: Router, private krameriusApiService: KrameriusApiService) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const uuid = params.get('uuid');
      this.krameriusApiService.getItem(uuid).subscribe((item: DocumentItem) => {
        this.resolveLink(item);
      });
    });
  }

  private resolveLink(item: DocumentItem) {
    console.log('item', item);
    if (item.doctype === 'page') {
      const parentUuid = item.context[item.context.length - 2].uuid;
      this.router.navigate(['/view', parentUuid], { queryParams: { page: item.uuid } });
    } else if (item.doctype === 'periodical' || item.doctype === 'periodicalvolume') {
      this.router.navigate(['/periodical', item.uuid]);
    } else if (item.doctype === 'soundunit' || item.doctype === 'soundrecording') {
      this.router.navigate(['/music', item.uuid]);
    } else {
      this.router.navigate(['/view', item.uuid]);
    }
  }

}
