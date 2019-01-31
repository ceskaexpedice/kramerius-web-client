import { Metadata } from './../model/metadata.model';
import { Injectable } from '@angular/core';
import { MzModalService } from 'ngx-materialize';
import { ShareService } from './share.service';
import { DialogCitationComponent } from '../dialog/dialog-citation/dialog-citation.component';



@Injectable()
export class CitationService {

  constructor(private modalService: MzModalService,
    private shareService: ShareService) { }

  public generateCitation(metadata: Metadata, link: string = null): string {
    if (!metadata) {
      return null;
    }
    if (link == null) {
      link = this.shareService.getPagePersistentLink();
    }
    let c = '';
    if (metadata.authors.length > 0 && metadata.doctype !== 'periodical') {
      let a = metadata.authors[0].name;
      if (a.indexOf(',') > -1 && a.indexOf('(') < 0) {
        a = a.substring(0, a.indexOf(',')).toUpperCase() + a.substring(a.indexOf(','));
      }
      if (a.endsWith(',')) {
        a = a.substring(0, a.length - 1);
      }
      c += a;
      c += '. ';
    }
    if (metadata.titles.length > 0) {
      c += '<i>';
      c += metadata.titles[0].fullTitle();
      c += '</i>. ';
    }
    if (metadata.publishers.length > 0 && !metadata.volume) {
      c += metadata.publishers[0].fullDetail();
      c += '. ';
    }
    if (metadata.volume) {
      if (metadata.publishers.length > 0) {
        c += metadata.publishers[0].placeAndName();
        c += ', ';
      }
      if (metadata.currentIssue && metadata.currentIssue.title) {
        c += metadata.currentIssue.title;
      } else if (metadata.volume.year) {
        c += metadata.volume.year;
      }
      c += ', ';
      c += '<b>' + metadata.volume.number + '</b>';
      if (metadata.currentIssue) {
        c += '(' + metadata.currentIssue.subtitle + ')';
      }
      c += '. ';
    }
    if (metadata.hasIdentifier('issn')) {
      c += 'ISSN ' + metadata.identifiers['issn'] + '. ';
    }
     c += 'Dostupné také z: ' + link;
    return c;
  }

  public showCitation(metadata: Metadata) {
    const citation = this.generateCitation(metadata);
    if (!citation) {
      return;
    }
    const options = {
      citation: citation
    };
    this.modalService.open(DialogCitationComponent, options);
  }


}
