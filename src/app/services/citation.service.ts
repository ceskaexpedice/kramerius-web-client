import { Metadata } from './../model/metadata.model';
export class CitationService {

  public generateCitation(metadata: Metadata, link: string): string {
    let c = '';
    if (metadata.authors.length > 0) {
      let a = metadata.authors[0].name;
      if (a.indexOf(',') > -1) {
        a = a.substring(0, a.indexOf(',')).toUpperCase() + a.substring(a.indexOf(','));
      }
      if (a.endsWith(',')) {
        a = a.substring(0, a.length - 1);
      }
      c += a;
      c += '. ';
    }
    if (metadata.titles.length > 0) {
      c += metadata.titles[0].fullTitle();
      c += '. ';
    }
    if (metadata.publishers.length > 0) {
      c += metadata.publishers[0].fullDetail();
      c += '. ';
    }
    c += 'Dostupné také z: ' + link;
    return c;
  }

}
