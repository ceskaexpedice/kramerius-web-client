import { Component, OnInit, Input } from '@angular/core';
import { MzBaseModal, MzToastService } from 'ngx-materialize';
import { Translator } from 'angular-translator';

@Component({
  selector: 'app-dialog-share',
  templateUrl: './dialog-share.component.html'
})
export class DialogShareComponent extends MzBaseModal implements OnInit {
  @Input() link: string;

  ngOnInit(): void {

  }


  constructor(private toastService: MzToastService, private translator: Translator) {
    super();
  }


  share(site) {
    let baseUrl = '';
    if (site === 'facebook') {
      baseUrl = 'https://www.facebook.com/sharer/sharer.php?u=';
    } else if (site === 'gplus') {
      baseUrl = 'https://plus.google.com/share?url=';
    } else if (site === 'twitter') {
      baseUrl = 'https://www.twitter.com/intent/tweet?url=';
    } else {
      return;
    }
    const width = 500;
    const height = 500;
    window.open(baseUrl
         + encodeURIComponent(this.link)
        , 'sharer', 'toolbar=0,status=0,width=' + width + ',height=' + height
        + ',top=' + (window.innerHeight - height) / 2 + ',left=' + (window.innerWidth - width) / 2);
  }

  onCopied(callback) {
    if (callback && callback['isSuccess']) {
      this.toastService.show(<string> this.translator.instant('common.copied_to_clipboard'), 1000);
    }
  }

}
