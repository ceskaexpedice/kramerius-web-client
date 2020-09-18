import { ShareService } from './../../services/share.service';
import { Component, OnInit, Input } from '@angular/core';
import { MzBaseModal } from 'ngx-materialize';
import { Metadata } from '../../model/metadata.model';
import { CloudApiService } from '../../services/cloud-api.service';
import { SolrService } from '../../services/solr.service';
import { AppSettings } from '../../services/app-settings';
import { Translator } from 'angular-translator';

@Component({
  selector: 'app-dialog-citation',
  templateUrl: './dialog-citation.component.html'
})
export class DialogCitationComponent extends MzBaseModal implements OnInit {
  @Input() citation: string;
  @Input() types: string[];
  @Input() metadata: Metadata;
  @Input() pages: string;

  data = [];
  selection;

  constructor(private cloudApi: CloudApiService, private appSettings: AppSettings, private shareService: ShareService, private translator: Translator) {
    super();
  }

  ngOnInit(): void {
    for (const doctype of SolrService.allDoctypes) {
      if (this.metadata.modsMap[doctype]) {
        this.data.push({
          type: doctype,
          citation: null,
          uuid: this.metadata.modsMap[doctype].uuid
        });
      }
    }
    if (this.metadata.activePage) {
      this.data.push({
        type: 'page',
        citation: null,
        uuid: this.metadata.activePage.uuid
      });
    }
    this.data.reverse();
    if (this.data.length > 0) {
      this.changeTab(this.data[0]);
    }
  }

 private getAuthorName(name): string {
   var name2 = name.split(",");
   var name3 = name[2][0].split(" ");
   if(name3.length>2) { return name; }
   return name2[0].toUpperCase()+", "+name2[1];
 }

  changeTab(item) {
    this.selection = item;
    /*if (!this.selection.citation) {
      this.cloudApi.getCitation(item.uuid).subscribe( (citation: string) => {
        const link = this.shareService.getPersistentLink(item.uuid);
        item.citation = `${citation} ${this.getLocalizedAvailability()}: ${link}`;
      });
    }*/
    item.citation = "";
    if(typeof this.metadata.authors[0] != 'undefined') { item.citation += this.getAuthorName(this.metadata.authors[0].name); }
    if(typeof this.metadata.authors[1] != 'undefined') { if(typeof this.metadata.authors[2] == 'undefined') { item.citation += " a "; } else { item.citation += ", "; } item.citation += this.getAuthorName(this.metadata.authors[1].name); }
    if(typeof this.metadata.authors[2] != 'undefined') { item.citation += " a "+this.getAuthorName(this.metadata.authors[2].name); }
    if(item.citation != "") { item.citation += ". "; }
    item.citation += "<i>"+this.metadata.getTitle()+"</i>. ";
    if(this.metadata.getVolumeYear()!="") { item.citation += this.metadata.publishers[0].placeAndName()+", "+this.metadata.getVolumeYear()+". "; }
    else {
      try { item.citation += this.metadata.publishers[0].fullDetail()+". "; } catch (error) { }
    }
    try { item.citation += "č. "+this.metadata.currentIssue.subtitle+". "; } catch (error) { }
    if(this.metadata.activePage.uuid==this.selection.uuid) { item.citation += "s. "+this.metadata.activePage.number+". "; }
    item.citation += this.getLocalizedAvailability()+': '+this.appSettings.share_url.replace('${UUID}', this.selection.uuid);
  }

  private getLocalizedAvailability(): string {
    return this.translator.language === 'cs' ? 'Dostupné také z' : 'Available also from';
  }


}
