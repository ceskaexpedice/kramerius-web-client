import { ShareService } from './../../services/share.service';
import { Component, OnInit, Input } from '@angular/core';
import { MzBaseModal } from 'ngx-materialize';
import { Metadata, Author } from '../../model/metadata.model';
//import { CloudApiService } from '../../services/cloud-api.service';
import { KrameriusApiService } from '../../services/kramerius-api.service';
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

  public static LEVEL_DOCUMENT = 0;
  public static LEVEL_VOLUME = 1;
  public static LEVEL_ISSUE = 2;
  public static LEVEL_ARTICLE = 3;
  public static LEVEL_PAGE = 4;

  constructor(private api: KrameriusApiService, private appSettings: AppSettings, private shareService: ShareService, private translator: Translator) {
    super();
  }

  ngOnInit(): void {
    const path = location.pathname;
    var uuid = path.substr(path.indexOf('uuid:'));

    this.api.getMods(uuid).subscribe((result: string) => {
      return this.dataPush(result);
    },
    () => {
      return this.dataPush(false);
    });
  }

private getParamFromXml(item, xml) {
  xml = xml.replace(' type="text"','')
  var ex=xml.split(item+">");
  if(ex.length>=2) { var out = ex[1].split("</"); return out[0]; }
  else { return ""; }
}


private dataPush(mods) {
  for (const doctype of SolrService.allDoctypes) {
    if (this.metadata.context[doctype]) {
      this.data.push({
        type: doctype,
        level:  Number(this.doctypeLevel(doctype)),
        citation: this.generateCitation(this.metadata, this.metadata.context[doctype].uuid, Number(this.doctypeLevel(doctype)), mods),
        uuid: this.metadata.context[doctype].uuid
      });
    }
  }
  if (this.metadata.activePage) {
    this.data.push({
      type: 'page',
      level: DialogCitationComponent.LEVEL_PAGE,
      citation: this.generateCitation(this.metadata, this.metadata.activePage.uuid, DialogCitationComponent.LEVEL_PAGE, mods),
      uuid: this.metadata.activePage.uuid
    });
  }
  this.data.reverse();
  if (this.data.length > 0) {
    this.changeTab(this.data[0]);
  }
}


 private doctypeLevel(doctype): number {
    if(doctype=="page") {return DialogCitationComponent.LEVEL_PAGE;}
    else if(doctype=="periodicalvolume") {return DialogCitationComponent.LEVEL_VOLUME;}
    else if(doctype=="periodicalitem") {return DialogCitationComponent.LEVEL_ISSUE;}
    else if(doctype=="article") {return DialogCitationComponent.LEVEL_ARTICLE;}
    else { return DialogCitationComponent.LEVEL_DOCUMENT; }

 }


   private writeAuthors(metadata: Metadata): string {
     if (!metadata || !metadata.authors || metadata.authors.length === 0) {
       return '';
     }
     const authors = metadata.authors;
     let result = this.writeAuthor(authors[0]);
     if (authors.length > 4) {
       result += ' et al. ';
       return result;
     }
     for (let i = 1; i < authors.length - 1; i++) {
       result += ', ' + this.writeAuthor(authors[i]);
     }
     if (authors.length > 1) {
       result += ' a ' + this.writeAuthor(authors[authors.length - 1]);
     }
     result += '. ';
     return result;
   }

   private writeAuthor(author: Author): string {
     let fullname = author.name;
     if (fullname.endsWith(',')) {
       fullname = fullname.substring(0, fullname.length - 1);
     }
     if (fullname.indexOf(',') > -1 && fullname.indexOf('(') < 0) {
       const family = fullname.substring(0, fullname.indexOf(',')).toUpperCase();
       const given = fullname.substring(fullname.indexOf(',') + 1);
       return family + ', ' + given;
     } else {
       return fullname;
     }
   }

 public generateCitation(metadata: Metadata, uuid: string, level: number = DialogCitationComponent.LEVEL_DOCUMENT, mods): string {
   if (!metadata) {
     return null;
   }
   const link = !!uuid ? this.shareService.getPersistentLink(uuid) : this.shareService.getPersistentLinkByUrl();
   let c = '';
   if (metadata.doctype !== 'periodical') {
     c += this.writeAuthors(metadata);
   }
   if (metadata.article && level >= DialogCitationComponent.LEVEL_ARTICLE) {
     const articleMetadata = metadata.article.metadata;
     c += this.writeAuthors(articleMetadata);
     if (articleMetadata && articleMetadata.titles.length > 0) {
       c += articleMetadata.titles[0].fullTitle();
       c += '. ';
     }
   }
   if (metadata.titles.length > 0) {
     c += '<i>';
     c += metadata.titles[0].fullTitle();
     c += '</i>. ';
   }
   if (metadata.publishers.length > 0 && (level === DialogCitationComponent.LEVEL_DOCUMENT || level === DialogCitationComponent.LEVEL_PAGE && !metadata.volume)) {
     if(mods) { var place=this.getParamFromXml('mods:placeTerm type="text"', mods); if(!metadata.publishers[0].fullDetail().includes(place)) { c += place+': ';} }
     c += metadata.publishers[0].fullDetail();
     c += '. ';
   }
   if (metadata.volume && level >= DialogCitationComponent.LEVEL_VOLUME) {
     if (metadata.publishers.length > 0) {
       c += metadata.publishers[0].placeAndName();
       c += ', ';
     }
     if (metadata.currentIssue && metadata.currentIssue.date && level >= DialogCitationComponent.LEVEL_ISSUE) {
       c += metadata.currentIssue.date;
     } else if (metadata.volume.year) {
       c += metadata.volume.year;
     }
     c += ', ';
     c += '<b>' + metadata.volume.number + '</b>';
     if (metadata.currentIssue && level >= DialogCitationComponent.LEVEL_ISSUE) {
       const edition = this.findIssueEdition(metadata.currentIssue.metadata);
       c += '(';
       if(metadata.currentIssue.name && metadata.currentIssue.name !== undefined) {
          c += metadata.currentIssue.name;
         if (edition && edition !== undefined) {
           c += ', ' + edition;
        }
       } else  if(mods) { var partNo=this.getParamFromXml('mods:partNumber', mods); if(partNo) { c += partNo; } }
       c += ')';
     }
     if (metadata.article && metadata.article.metadata && metadata.article.metadata.extent && level === DialogCitationComponent.LEVEL_ARTICLE) {
       let extent = metadata.article.metadata.extent;
       if (extent.indexOf('-')) {
         const p = extent.split('-');
         if (p[0] === p[1]) {
           extent = p[0];
         }
       }
       c += ', ' + extent;
     }
     c += '. ';
   }

   if(metadata.currentIssue && level < DialogCitationComponent.LEVEL_ISSUE && mods) { var partNo=this.getParamFromXml('mods:partNumber', mods); if(partNo) { c += 'sv. '+partNo+' '; } }

   if (metadata.activePages && level === DialogCitationComponent.LEVEL_PAGE) {
     c += 's. ' + metadata.activePages + '. ';
   }
   if (metadata.hasIdentifier('issn')) {
     c += 'ISSN ' + metadata.identifiers['issn'] + '. ';
   }
   if (metadata.hasIdentifier('isbn')) {
     c += 'ISBN ' + metadata.identifiers['isbn'] + '. ';
   }
   c += 'Dostupné také z: ' + link;
   return c;
 }

 private findIssueEdition(metadata: Metadata): string {
   if (!metadata) {
     return;
   }
   let edition = null;
   for (const pd of metadata.physicalDescriptions) {
     let note = pd.note;
     if (!note) {
       continue;
     }
     note = note.trim().toLowerCase();
     if (note === 'ranní vydání;') {
       edition = 'ranní vydání';
     } else if (note === 'odpolední vydání;') {
       edition = 'odpolední vydání';
     } else if (note === 'večerní vydání;') {
       edition = 'večerní vydání';
     }
   }
   for (let note of metadata.notes) {
     if (!note) {
       continue;
     }
     note = note.trim().toLowerCase();
     if (note === 'ranní vydání;') {
       edition = 'ranní vydání';
     } else if (note === 'odpolední vydání;') {
       edition = 'odpolední vydání';
     } else if (note === 'večerní vydání;') {
       edition = 'večerní vydání';
     }
   }
   return edition;
 }


  changeTab(item) {
    this.selection = item;
    //this.getPartNumber();
  }


  private getLocalizedAvailability(): string {
    return this.translator.language === 'cs' ? 'Dostupné také z' : 'Available also from';
  }


}
