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
  originalSourceText: string;
  customInstructions: string;
  customInstructionsInUse: string;

  copyText: string;

  models = [ 
    { provider: 'openai', name: 'GPT 3.5 turbo', code: 'gpt-3.5-turbo' },
    { provider: 'openai', name: 'GPT 4o', code: 'gpt-4o' },
    { provider: 'openai', name: 'GPT 4o mini', code: 'gpt-4o-mini' },
    { provider: 'openai', name: 'GPT 4 turbo', code: 'gpt-4-turbo' },
    { provider: 'openai', name: 'GPT 4', code: 'gpt-4' },
    { provider: 'anthropic', name: 'Claude 3 Opus', code: 'claude-3-opus-20240229'},
    { provider: 'anthropic', name: 'Claude 3 Sonnet', code: 'claude-3-sonnet-20240229'},
    { provider: 'anthropic', name: 'Claude 3 Haiku', code: 'claude-3-haiku-20240307'},
    { provider: 'anthropic', name: 'Claude 3.5 Sonnet', code: 'claude-3-5-sonnet-20240620'},
    { provider: 'google', name: 'Gemini 1.0 Pro', code: 'gemini-1.0-pro'},
    { provider: 'google', name: 'Gemini 1.5 Pro', code: 'gemini-1.5-pro'},
    { provider: 'google', name: 'Gemini 1.5 Flash', code: 'gemini-1.5-flash'}
  ];

  model: any;
  modelInUse: any;
  aiTestActionsEnabled: boolean;


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
      this.setText(data.ocr);
      if (data.summary) {
        this.title = this.languageService.getSummary(data.language);
        this.setText('<p>' + marked.parse(data.ocr) + '</p>');
        this.originalSourceText = data.originalSourceText;
        this.model = this.models[2];
        this.modelInUse = this.models[2];
        this.aiTestActionsEnabled = this.ai.testActionsEnabled();
      } else {
        if (data.ocr2) {
          this.setText(data.ocr + '<br/><br/>' + data.ocr2);
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
    if (this.model.provider === 'openai') {
      this.ai.askGPT(this.originalSourceText, instruction, this.model['code'], callback);
    } else if (this.model.provider === 'anthropic') {
      this.ai.askClaude(this.originalSourceText, instruction, this.model['code'], callback);
    } else if (this.model.provider === 'google') {
      this.ai.askGemini(this.originalSourceText, instruction, this.model['code'], callback);
    }
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

