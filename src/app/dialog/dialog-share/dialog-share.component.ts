import { Component, OnInit, Input } from '@angular/core';
import { MzBaseModal, MzToastService } from 'ngx-materialize';
import { Translator } from 'angular-translator';
import { Metadata } from '../../model/metadata.model';
import { ShareService } from '../../services/share.service';
import { SolrService } from '../../services/solr.service';

@Component({
  selector: 'app-dialog-share',
  templateUrl: './dialog-share.component.html'
})
export class DialogShareComponent extends MzBaseModal implements OnInit {
  @Input() metadata: Metadata;

  data = [];
  selection;


  constructor(private toastService: MzToastService,
              private shareService: ShareService,
              private translator: Translator) {
    super();
  }

  ngOnInit(): void {
    for (const doctype of SolrService.allDoctypes) {
      if (this.metadata.context[doctype]) {
        const uuid = this.metadata.context[doctype];
        if (uuid) {
          this.data.push({
            type: doctype,
            link: this.shareService.getPersistentLink(uuid)
          });
        }
      }
    }
    if (this.metadata.activePages) {
      this.data.push({
        type: 'page',
        link: this.shareService.getPersistentLinkByUrl()
      });
    }


    this.data.reverse();

    this.data = this.metadata.getFullContext(SolrService.allDoctypes);
    for (let item of this.data) {
      if (item.type == 'page') {
        item.link = this.shareService.getPersistentLinkByUrl();
      } else {
        item.link = this.shareService.getPersistentLink(item.uuid);
      }
    }


    if (this.data.length > 0) {
      this.selection = this.data[0];
    }
  }

  changeTab(item) {
    this.selection = item;
  }

  share(site) {
    if (!this.selection) {
      return;
    }
    let baseUrl = '';
    if (site === 'facebook') {
      baseUrl = 'https://www.facebook.com/sharer/sharer.php?u=';
    } else if (site === 'twitter') {
      baseUrl = 'https://www.twitter.com/intent/tweet?url=';
    } else {
      return;
    }
    const width = 500;
    const height = 500;
    window.open(baseUrl
         + encodeURIComponent(this.selection.link)
        , 'sharer', 'toolbar=0,status=0,width=' + width + ',height=' + height
        + ',top=' + (window.innerHeight - height) / 2 + ',left=' + (window.innerWidth - width) / 2);
  }

  onCopied(callback) {
    if (callback && callback['isSuccess']) {
      this.toastService.show(<string> this.translator.instant('common.copied_to_clipboard'), 1000);
    }
  }

}
