import { Component, OnInit, Inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ShareService } from '../../services/share.service';
import { CitationService } from '../../services/citation.service';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuTrigger } from '@angular/material/menu';
import { AiService } from '../../services/ai.service';
import { LanguageService } from '../../services/language.service';
import { marked } from 'marked';

@Component({
  selector: 'app-ocr-dialog',
  templateUrl: './ocr-dialog.component.html',
  styleUrls: ['ocr-dialog.component.scss'],
})
export class OcrDialogComponent implements OnInit {

  @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger;


  // languages = ['en', 'cs', 'de', 'sk', 'sl', 'es', 'fr', 'pl', 'it', 'et', 'sv', 'hu', 'uk', 'ru', 'pt', 'lt', 'lv', 'zh-CN', 'zh-TW'];
  languages = ['en', 'cs', 'de', 'sk', 'sl', 'es', 'fr', 'pl', 'it', 'et', 'sv', 'hu', 'uk', 'ru', 'pt', 'lt', 'lv', 'zh-CN'];
  loading = false;
  citation: string;
  citationTxt: string;
  ocrTxt: any;
  originalText: string;
  language: string;

  title: string;

  constructor(private bottomSheetRef: MatBottomSheetRef<OcrDialogComponent>,
    private citationService: CitationService, 
    private translate: TranslateService, 
    private changeDetectorRef: ChangeDetectorRef,
    public languageService: LanguageService,
    private snackBar: MatSnackBar,
    private ai: AiService,
    private shareService: ShareService,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any
    ) {
      this.ocrTxt = data.ocr;
      // this.ocrTxt = toHtml(data.ocr);
      // txt.replace(/\n/g, '<br/>'); 
      if (data.summary) {
        this.title = this.languageService.getSummary(data.language);
        this.ocrTxt = '<p>' + marked.parse(data.ocr) + '</p>';
      } else {
        if (data.ocr2) {
          this.ocrTxt += '<br/><br/>' + data.ocr2;
        }
      }
      this.language = data.language;
      if (this.language) {
        this.originalText = this.ocrTxt;
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

  onLanguageChanged(lang: string) {
    this.language = lang;
    this.loading = true;
    this.ai.translate(this.originalText, lang, (answer, error) => {
        if (error) {
          // TODO: show error
          return;
        }
        this.loading = false;
        this.ocrTxt = answer;
        if (this.data.summary) {
          this.title = this.languageService.getSummary(lang);
          localStorage.setItem('summary.language', lang);
        } else {
          localStorage.setItem('translate.language', lang);
        }
    });
  }

  onCancel() {
    this.bottomSheetRef.dismiss();
  }

  onCopied(callback) {
    if (callback && callback['isSuccess']) {
      this.snackBar.open(<string> this.translate.instant('common.copied_to_clipboard'), '', { duration: 2000, verticalPosition: 'bottom' });
    }
  }

  closeMenu() {
    this.menuTrigger.closeMenu();
  }

}

