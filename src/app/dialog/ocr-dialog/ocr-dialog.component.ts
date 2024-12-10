import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { ShareService } from '../../services/share.service';
import { CitationService } from '../../services/citation.service';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';
import { UiService } from '../../services/ui.service';

@Component({
  selector: 'app-ocr-dialog',
  templateUrl: './ocr-dialog.component.html',
  styleUrls: ['ocr-dialog.component.scss'],
})
export class OcrDialogComponent implements OnInit {

  loading = false;
  citation: string;
  citationTxt: string;
  ocrTxt: any;
  originalText: string;
  title: string;
  copyText: string;

  constructor(private bottomSheetRef: MatBottomSheetRef<OcrDialogComponent>,
    private citationService: CitationService, 
    private translate: TranslateService, 
    private changeDetectorRef: ChangeDetectorRef,
    public languageService: LanguageService,
    private ui: UiService,
    private shareService: ShareService,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any
    ) {
      this.setText(data.ocr);
      if (data.ocr2) {
        this.setText(data.ocr + '<br/><br/>' + data.ocr2);
      }
  }

  ngOnInit(): void {
    if (!this.data.showCitation) {
      return;
    }
    this.changeDetectorRef.detectChanges();
    this.citationService.getCitation(this.data.uuid, (citation: string) => {
      const link = this.shareService.getPersistentLink(this.data.uuid);
      const locText = this.translate.instant("share.available_from");
      this.citation = `${citation} ${locText}: ${link}`;
      this.citationTxt = this.citation.replace(/(<([^>]+)>)/gi, "");
      this.changeDetectorRef.detectChanges();
    });
  }

  setText(text: string) {
    this.ocrTxt = text;
    this.copyText = text.replace(/<\/?[^>]+(>|$)/g, "");
  }

  onCancel() {
    this.bottomSheetRef.dismiss();
  }

  onCopied(callback) {
    if (callback && callback['isSuccess']) {
      this.ui.showSuccess('common.copied_to_clipboard');
    }
  }

}

