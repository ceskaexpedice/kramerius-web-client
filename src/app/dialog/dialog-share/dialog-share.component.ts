import { Component, OnInit, Input } from '@angular/core';
import { MzBaseModal } from 'ng2-materialize';

@Component({
  selector: 'app-dialog-share',
  templateUrl: './dialog-share.component.html'
})
export class DialogShareComponent extends MzBaseModal implements OnInit {
  @Input() link: string;

  ngOnInit(): void {

  }


  share = function(site) {
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
  };


}
