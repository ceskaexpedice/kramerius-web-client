import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { ShareService } from '../../services/share.service';
import { Translator } from 'angular-translator';
import { CitationService } from '../../services/citation.service';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-ocr-dialog',
  templateUrl: './ocr-dialog.component.html',
  styleUrls: ['ocr-dialog.component.scss'],
})
export class OcrDialogComponent implements OnInit {

  citation: string;

  constructor(private bottomSheetRef: MatBottomSheetRef<OcrDialogComponent>,
    private citationService: CitationService, 
    private translator: Translator, 
    private changeDetectorRef: ChangeDetectorRef,
    private shareService: ShareService,
    @Inject(MAT_BOTTOM_SHEET_DATA) private data: any
    ) {
  }

  ngOnInit(): void {
    if (!this.data.showCitation) {
      return;
    }
    this.citationService.getCitation(this.data.uuid).subscribe( (citation: string) => {
      const link = this.shareService.getPersistentLink(this.data.uuid);
      const locText = this.translator.instant("share.available_from");
      this.citation = `${citation} ${locText}: ${link}`;
      this.changeDetectorRef.detectChanges();
    });
  }

  onCancel() {
    this.bottomSheetRef.dismiss();
  }

}