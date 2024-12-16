import { Component, OnInit, Inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ShareService } from '../../services/share.service';
import { CitationService } from '../../services/citation.service';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { TranslateService } from '@ngx-translate/core';
import { MatLegacyMenuTrigger as MatMenuTrigger } from '@angular/material/legacy-menu';
import { AiService } from '../../services/ai.service';
import { LanguageService } from '../../services/language.service';
import { marked } from 'marked';
import { UiService } from '../../services/ui.service';

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
    private ui: UiService,
    public ai: AiService,
    private shareService: ShareService,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any
    ) {
  }

  ngOnInit(): void {
    this.language = localStorage.getItem('summary.language') || this.translateSrvice.currentLang;
    if (this.data.action === 'summarize') {
      this.title = this.languageService.getSummary(this.language);
      this.model = this.ai.getDefaultModel();
      this.modelInUse = this.ai.getDefaultModel();
      this.aiTestActionsEnabled = this.ai.testActionsEnabled();
    }
    if (this.data.action === 'chat') {
      this.model = this.ai.getDefaultModel();
      this.modelInUse = this.ai.getDefaultModel();
      this.aiTestActionsEnabled = this.ai.testActionsEnabled();
      this.originalSourceText = this.data.content;
      return;
    }
    this.loading = true;
    this.ai.translate(null, this.data.content, this.language, (answer, error) => {
      if (error) {
        this.loading = false;
        this.ai.showAiError(error);
        this.bottomSheetRef.dismiss();
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
    this.citationService.getCitation(this.data.uuid, (citation: string) => {
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
      this.loading = false;
      if (error) {
        this.ai.showAiError(error);
        this.bottomSheetRef.dismiss();
        return;
      }
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
    if (this.data.action === 'chat' && !this.customInstructions) {
      return;
    }
    this.loading = true;
    this.modelInUse = this.model;
    const instruction = this.customInstructions || this.languageService.getSummaryPrompt(this.language);
    this.customInstructionsInUse = this.customInstructions;
    const callback = (answer, error) => {
      if (error) {
        this.ai.showAiError(error);
        this.bottomSheetRef.dismiss();
        return;
      }
      this.setText('<p>' + marked.parse(answer) + '</p>');
      this.originalText = this.ocrTxt;
      if (this.customInstructionsInUse) {
        this.title = this.customInstructionsInUse.substring(0, 125) + (this.customInstructionsInUse.length > 125 ? '...' : '');
      }
      this.loading = false;
    };
    let maxTokens = 1000;
    if (this.data.action === 'chat') {
      maxTokens = 5000;
    }
    this.ai.askLLM(this.originalSourceText, instruction, this.model['provider'], this.model['code'], callback, maxTokens);
  }
  // Přepiš text strany starých novin, nejdřív uveď tučně názvy článku a pod nimi text, kde opravíš OCR chyby, ale jinak nebudeš text upravovat
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
      this.ui.showSuccess('common.copied_to_clipboard');
    }
  }

  closeMenu() {
    this.menuTrigger.closeMenu();
  }

}

