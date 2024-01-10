import { Component, OnInit, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppSettings } from '../../services/app-settings';

@Component({
  selector: 'app-licence-messages',
  templateUrl: './licence-messages.component.html',
  styleUrls: ['./licence-messages.component.scss']
})

export class LicenceMessagesComponent implements OnInit {
  
  @Input() title: string;
  @Input() content: string;

  constructor(private settings: AppSettings, private translate: TranslateService) { }

  ngOnInit() {

  }

  formattedContent(): string {
    if (!this.content) {
      return "";
    }
    const lang = this.translate.currentLang;
      const uuid = AppSettings.getUuidFromUrl();
      const path = encodeURIComponent(this.settings.getRelativePath());
      const target = encodeURIComponent(window.location.href)
    return this.content
      .replace(/\${LANG}/g, lang)
      .replace(/\${TARGET}/g, target)
      .replace(/\${PATH}/g, path)
      .replace(/\${UUID}/g, uuid);
  }


}
