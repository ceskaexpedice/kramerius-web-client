import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { ShareService } from '../../services/share.service';
import { CitationService } from '../../services/citation.service';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-ocr-dialog',
  templateUrl: './ocr-dialog.component.html',
  styleUrls: ['ocr-dialog.component.scss'],
})
export class OcrDialogComponent implements OnInit {

  citation: string;
  citationTxt: string;
  ocrTxt: string;


  constructor(private bottomSheetRef: MatBottomSheetRef<OcrDialogComponent>,
    private citationService: CitationService, 
    private translate: TranslateService, 
    private changeDetectorRef: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private shareService: ShareService,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any
    ) {
      this.ocrTxt = data.ocr;
      if (data.ocr2) {
        this.ocrTxt += '\n' + data.ocr2;
      }
  }

  ngOnInit(): void {
    if (!this.data.showCitation) {
      return;
    }
    this.changeDetectorRef.detectChanges();
    this.citationService.getCitation(this.data.uuid).subscribe( (citation: string) => {
      const link = this.shareService.getPersistentLink(this.data.uuid);
      const locText = this.translate.instant("share.available_from");
      this.citation = `${citation} ${locText}: ${link}`;
      this.citationTxt = this.citation.replace(/(<([^>]+)>)/gi, "");
      this.changeDetectorRef.detectChanges();
    });
  }

  onCancel() {
    this.bottomSheetRef.dismiss();
  }

  toHtml(txt: string): string {
    if (!txt) {
      return '';
    }
    return txt.replace(/\n/g, '<br/>');
  }

  onCopied(callback) {
    if (callback && callback['isSuccess']) {
      this.snackBar.open(<string> this.translate.instant('common.copied_to_clipboard'), '', { duration: 2000, verticalPosition: 'bottom' });
    }
  }

}
