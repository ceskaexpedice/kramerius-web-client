import { Component, OnInit, Input } from '@angular/core';
import { MzBaseModal } from 'ngx-materialize';
import { ShareService } from '../../services/share.service';
import { CloudApiService } from '../../services/cloud-api.service';
import { AppSettings } from '../../services/app-settings';
import { Metadata } from '../../model/metadata.model';
import { Translator } from 'angular-translator';


@Component({
  selector: 'app-dialog-ocr',
  templateUrl: './dialog-ocr.component.html'
})
export class DialogOcrComponent extends MzBaseModal implements OnInit {
  @Input() ocr: string;
  @Input() ocr2: string;
  @Input() uuid: string;
  @Input() metadata: Metadata;
  citation: string;
  constructor(private cloudApi: CloudApiService, private shareService: ShareService, private settings: AppSettings, private translator: Translator) {
    super();
  }

  ngOnInit(): void {
    if (!this.settings.showCitation) {
      return;
    }
  /*  this.cloudApi.getCitation(this.uuid).subscribe( (citation: string) => {
      const link = this.shareService.getPersistentLink(this.uuid);
      this.citation = `${citation} Dostupné také z: ${link}`;
    });*/
    this.citation = "";
    if(typeof this.metadata.authors[0] != 'undefined') { this.citation += this.getAuthorName(this.metadata.authors[0].name); }
    if(typeof this.metadata.authors[1] != 'undefined') { if(typeof this.metadata.authors[2] == 'undefined') { this.citation += "a "; } else { this.citation += ", "; } this.citation += ", "+this.getAuthorName(this.metadata.authors[1].name); }
    if(typeof this.metadata.authors[2] != 'undefined') { this.citation += " a "+this.getAuthorName(this.metadata.authors[2].name); }
    if(this.citation != "") { this.citation += ". "; }
    this.citation += "<i>"+this.metadata.getTitle()+"</i>. ";
    if(this.metadata.getVolumeYear()!="") { this.citation += this.metadata.publishers[0].placeAndName()+", "+this.metadata.getVolumeYear()+". "; }
    else {
      try { this.citation += this.metadata.publishers[0].fullDetail(); } catch (error) { }
    }
    try { this.citation += "č. "+this.metadata.currentIssue.subtitle+". "; } catch (error) { }
    this.citation += "s. "+this.metadata.activePage.number+". ";
    this.citation += this.getLocalizedAvailability()+": "+this.settings.share_url.replace('${UUID}', this.metadata.activePage.uuid);
  }

  private getAuthorName(name): string {
    var name2 = name.split(",");
    var name3 = name[2][0].split(" ");
    if(name3.length>2) { return name; }
    return name2[0].toUpperCase()+", "+name2[1];
  }


  private getLocalizedAvailability(): string {
    return this.translator.language === 'cs' ? 'Dostupné také z' : 'Available also from';
  }



}
