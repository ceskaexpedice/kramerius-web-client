import { Component, OnInit, Input } from '@angular/core';
import { MzBaseModal } from 'ngx-materialize';
import { AppSettings } from '../../services/app-settings';
import { KrameriusInfoService } from '../../services/kramerius-info.service';
import { BookService } from '../../services/book.service';


@Component({
  selector: 'app-dialog-policy',
  templateUrl: './dialog-policy.component.html'
})
export class DialogPolicyComponent extends MzBaseModal implements OnInit {
  @Input() type: string;

  constructor(
              public bookService: BookService,
              public krameriusInfo: KrameriusInfoService,
              public appSettings: AppSettings) {
    super();
  }

  ngOnInit(): void {
  }



}
