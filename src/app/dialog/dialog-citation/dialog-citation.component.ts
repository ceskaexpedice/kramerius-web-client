import { CitationService } from './../../services/citation.service';
import { Component, OnInit, Input } from '@angular/core';
import { MzBaseModal } from 'ngx-materialize';
import { Metadata } from '../../model/metadata.model';

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

  doctypes = [
      ['article', CitationService.LEVEL_ARTICLE],
      ['periodicalitem', CitationService.LEVEL_ISSUE],
      ['periodicalvolume', CitationService.LEVEL_VOLUME],
      ['periodical', CitationService.LEVEL_DOCUMENT],
      ['monographbundle', CitationService.LEVEL_DOCUMENT],
      ['monograph', CitationService.LEVEL_DOCUMENT],
      ['map', CitationService.LEVEL_DOCUMENT],
      ['sheetmusic', CitationService.LEVEL_DOCUMENT],
      ['graphic', CitationService.LEVEL_DOCUMENT],
      ['archive', CitationService.LEVEL_DOCUMENT],
      ['soundrecording', CitationService.LEVEL_DOCUMENT],
      ['manuscript', CitationService.LEVEL_DOCUMENT]
  ];


  constructor(private citationService: CitationService) {
    super();
  }

  ngOnInit(): void {
    for (const doctype of this.doctypes) {
      if (this.metadata.modsMap[doctype[0]]) {
        this.data.push({
          level:  Number(doctype[1]),
          citation: this.citationService.generateCitation(this.metadata, Number(doctype[1]))
        });
      }
    }
    if (this.metadata.activePages) {
      this.data.push({
        level: CitationService.LEVEL_PAGE,
        citation: this.citationService.generateCitation(this.metadata, CitationService.LEVEL_PAGE)
      });
    }
    if (this.data.length > 0) {
      this.selection = this.data[0];
    }
  }

  changeTab(item) {
    this.selection = item;
  }

}
