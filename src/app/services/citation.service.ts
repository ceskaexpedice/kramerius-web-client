import { Metadata, Author } from './../model/metadata.model';
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
    if (metadata.doctype !== 'periodical') {
      c += this.writeAuthors(metadata);
    }
    if (metadata.article) {
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
      if (metadata.article && metadata.article.metadata && metadata.article.metadata.extent) {
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
    if (metadata.hasIdentifier('issn')) {
      c += 'ISSN ' + metadata.identifiers['issn'] + '. ';
    }
     c += 'Dostupné také z: ' + link;
    return c;
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
