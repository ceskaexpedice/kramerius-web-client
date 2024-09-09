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
  selector: 'app-llm-dialog',
  templateUrl: './llm-dialog.component.html',
  styleUrls: ['llm-dialog.component.scss'],
})
export class LLMDialogComponent implements OnInit {

  @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger;

  languages = LanguageService.TRANSLANTABLE_LANGUAGES;
  // languages = ['en', 'cs', 'de', 'sk', 'sl', 'es', 'fr', 'pl', 'it', 'et', 'sv', 'hu', 'uk', 'ru', 'pt', 'lt', 'lv', 'zh-CN', 'zh-TW'];
  loading = false;
  citation: string;
  citationTxt: string;
  ocrTxt: any;
  originalText: string;
  language: string;

  title: string;
  originalSourceText: string;

  customInstructions: string;
  customInstructionsInUse: string;

  copyText: string;

  model: any;
  modelInUse: any;
  aiTestActionsEnabled = false;

  constructor(private bottomSheetRef: MatBottomSheetRef<LLMDialogComponent>,
    private citationService: CitationService, 
    private translate: TranslateService, 
    private changeDetectorRef: ChangeDetectorRef,
    public languageService: LanguageService,
    private translateSrvice: TranslateService,
    private snackBar: MatSnackBar,
    public ai: AiService,
    private shareService: ShareService,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any
    ) {
  }

  ngOnInit(): void {
    this.loading = true;
    this.language = localStorage.getItem('summary.language') || this.translateSrvice.currentLang;
    console.log("000000", this.data);
    if (this.data.action === 'summarize') {
      this.title = this.languageService.getSummary(this.language);
      this.model = this.ai.getDefaultModel();
      this.modelInUse = this.ai.getDefaultModel();
      this.aiTestActionsEnabled = this.ai.testActionsEnabled();
    }
    this.ai.translate(null, this.data.content, this.language, (answer, error) => {
      if (error) {
        // TODO: show error
        this.loading = false;
        return;
      }
      this.originalSourceText = answer;
      if (this.data.action === 'summarize') {
        this.regenerate();
      } else if (this.data.action === 'translate') {
        this.setText(answer);
        this.loading = false;
      }
    });

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
    let text = this.originalSourceText;
    if (this.data.action === 'summarize') {
      text = this.originalText;
    }
    this.ai.translate(null, text, lang, (answer, error) => {
        if (error) {
          // TODO: show error
          return;
        }
        this.loading = false;
        this.setText(answer);
        if (this.data.summary) {
          if (!this.customInstructionsInUse) {
            this.title = this.languageService.getSummary(lang);
          }
          localStorage.setItem('summary.language', lang);
        } else {
          localStorage.setItem('translate.language', lang);
        }
    });
  }

  onModelChanged(model: string) {
    this.model = model;
    // this.regenerate();
  }

  regenerate() {
    this.loading = true;
    this.modelInUse = this.model;
    const instruction = this.customInstructions || this.languageService.getSummaryPrompt(this.language);
    this.customInstructionsInUse = this.customInstructions;
    const callback = (answer, error) => {
      if (error) {
        // TODO: show error
        return;
      }
      this.setText('<p>' + marked.parse(answer) + '</p>');
      this.originalText = this.ocrTxt;
      if (this.customInstructionsInUse) {
        this.title = this.customInstructionsInUse.substring(0, 80) + (this.customInstructionsInUse.length > 80 ? '...' : '');
      }
      this.loading = false;
    };
    this.ai.askLLM(this.originalSourceText, instruction, this.model['provider'], this.model['code'], callback);
  }

  setText(text: string) {
    this.ocrTxt = text;
    this.copyText = text.replace(/<\/?[^>]+(>|$)/g, "");
  }

  regenerateIcon(): string {
    return (this.modelInUse['code'] === this.model['code'] && this.customInstructionsInUse === this.customInstructions) ? 'refresh' : 'send';
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

