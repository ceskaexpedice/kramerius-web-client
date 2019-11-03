import { Component, OnInit, Input } from '@angular/core';
import { MzBaseModal, MzToastService } from 'ngx-materialize';
import { Translator } from 'angular-translator';
import { Metadata } from '../../model/metadata.model';
import { ShareService } from '../../services/share.service';

@Component({
  selector: 'app-dialog-share',
  templateUrl: './dialog-share.component.html'
})
export class DialogShareComponent extends MzBaseModal implements OnInit {
  @Input() metadata: Metadata;

  data = [];
  selection;

  doctypes = [
    ['article', 3],
    ['periodicalitem', 2],
    ['periodicalvolume', 1],
    ['periodical', 0],
    ['monographbundle', 0],
    ['monograph', 0],
    ['map', 0],
    ['sheetmusic', 0],
    ['graphic', 0],
    ['archive', 0],
    ['soundrecording', 0],
    ['manuscript', 0]
];


  constructor(private toastService: MzToastService,
              private shareService: ShareService,
              private translator: Translator) {
    super();
  }

  ngOnInit(): void {
    if (this.metadata.activePages) {
      this.data.push({
        level: 4,
        link: this.shareService.getPersistentLinkByUrl()
      });
    }
    for (const doctype of this.doctypes) {
      if (this.metadata.modsMap[doctype[0]]) {
        const uuid = this.metadata.modsMap[doctype[0]].uuid;
        if (uuid) {
          this.data.push({
            level: doctype[1],
            link: this.shareService.getPersistentLink(uuid)
          });
        }
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
