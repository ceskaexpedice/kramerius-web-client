import { Metadata, Author } from './../model/metadata.model';
import { Injectable } from '@angular/core';
import { MzModalService } from 'ngx-materialize';
import { ShareService } from './share.service';
import { DialogCitationComponent } from '../dialog/dialog-citation/dialog-citation.component';



@Injectable()
export class CitationService {

  public static LEVEL_DOCUMENT = 0;
  public static LEVEL_VOLUME = 1;
  public static LEVEL_ISSUE = 2;
  public static LEVEL_ARTICLE = 3;
  public static LEVEL_PAGE = 4;


  constructor(private modalService: MzModalService,
    private shareService: ShareService) { }

  public generateCitation(metadata: Metadata, level: number = CitationService.LEVEL_DOCUMENT): string {
    if (!metadata) {
      return null;
    }
    const link = this.shareService.getPagePersistentLink();
    let c = '';
    if (metadata.doctype !== 'periodical') {
      c += this.writeAuthors(metadata);
    }
    if (metadata.article && level >= CitationService.LEVEL_ARTICLE) {
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
    if (metadata.publishers.length > 0 && (level === CitationService.LEVEL_DOCUMENT || level === CitationService.LEVEL_PAGE && !metadata.volume)) {
      c += metadata.publishers[0].fullDetail();
      c += '. ';
    }
    if (metadata.volume && level >= CitationService.LEVEL_VOLUME) {
      if (metadata.publishers.length > 0) {
        c += metadata.publishers[0].placeAndName();
        c += ', ';
      }
      if (metadata.currentIssue && metadata.currentIssue.title && level >= CitationService.LEVEL_ISSUE) {
        c += metadata.currentIssue.title;
      } else if (metadata.volume.year) {
        c += metadata.volume.year;
      }
      c += ', ';
      c += '<b>' + metadata.volume.number + '</b>';
      if (metadata.currentIssue && level >= CitationService.LEVEL_ISSUE) {
        const edition = this.findIssueEdition(metadata.currentIssue.metadata);
        c += '(' + metadata.currentIssue.subtitle;
        if (edition) {
          c += ', ' + edition;
        }
        c += ')';
      }
      if (metadata.article && metadata.article.metadata && metadata.article.metadata.extent && level === CitationService.LEVEL_ARTICLE) {
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
    if (metadata.activePages && level === CitationService.LEVEL_PAGE) {
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
    const options = {
      metadata: metadata
    };
    this.modalService.open(DialogCitationComponent, options);
  }


}
