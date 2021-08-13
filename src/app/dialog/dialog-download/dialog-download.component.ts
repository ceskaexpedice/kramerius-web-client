import { Component, Input, OnInit } from '@angular/core';
import { MzBaseModal } from 'ngx-materialize';

@Component({
  selector: 'app-dialog-download',
  templateUrl: './dialog-download.component.html'
})
export class DialogDownloadComponent extends MzBaseModal implements OnInit {

  
  @Input() title: string;
  @Input() message: string;
  @Input() button: string;
  @Input() imageURL : string;
  @Input() deviceType : string;

  downloadImgURL : string;

  ngOnInit(): void {
    switch(this.deviceType){
      case 'Android':
        this.downloadImgURL = "assets/shared/img/google-play.png";
        break;
      case 'iPhone':
        this.downloadImgURL = "assets/shared/img/app-store.png";
        break;
    }
  }

  redirectStore(store : string){

    switch(store){
      case 'Android':
        window.open("https://play.google.com/store/apps/details?id=cz.mzk.kramerius.app&hl=cs", '_blank');
        break;
      case 'iPhone':
        window.open("https://apps.apple.com/cz/app/digit%C3%A1ln%C3%AD-knihovna/id1065771974", '_blank');
        break;
    }
  }

}
