import { Injectable } from '@angular/core';
import { NotFoundError } from '../common/errors/not-found-error';
import { AltoService } from './alto-service';
import { UnauthorizedError } from '../common/errors/unauthorized-error';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs-compat';
import { TranslateService } from '@ngx-translate/core';
import { AiService } from './ai.service';
import { KrameriusApiService } from './kramerius-api.service';
import { MatDialog } from '@angular/material/dialog';
import { TtsDialogComponent } from '../dialog/tts-dialog/tts-dialog.component';
import { LocalStorageService } from './local-storage.service';

@Injectable()
export class TtsService {


  static openAIVoices = [
    { code: 'fable', name: 'Fable', gender: 'female', source: 'OpenAI' },
    { code: 'alloy', name: 'Alloy', gender: 'female', source: 'OpenAI' },
    { code: 'echo', name: 'Echo', gender: 'male', source: 'OpenAI' },
    { code: 'onyx', name: 'Onyx', gender: 'male', source: 'OpenAI' },
    { code: 'nova', name: 'Nova', gender: 'female', source: 'OpenAI' },
    { code: 'shimmer', name: 'Shimmer', gender: 'female', source: 'OpenAI' }
  ];

  static googleVoices = [
    { code: 'cs-CZ-Standard-A', name: 'cs-CZ-Standard-A', gender: 'female', source: 'Google', language: 'cs', languageCode: 'cs-CZ' },
    { code: 'cs-CZ-Wavenet-A', name: 'cs-CZ-Wavenet-A', gender: 'female', source: 'Google', language: 'cs', languageCode: 'cs-CZ' },
    { code: 'sk-SK-Standard-A', name: 'sk-SK-Standard-A', gender: 'female', source: 'Google', language: 'sk', languageCode: 'sk-SK' },
    { code: 'sk-SK-Wavenet-A', name: 'sk-SK-Wavenet-A', gender: 'female', source: 'Google', language: 'sk', languageCode: 'sk-SK' },
    { code: 'es-ES-Neural2-A', name: 'es-ES-Neural2-A', gender: 'female', source: 'Google', language: 'es', languageCode: 'es-ES' },
    { code: 'es-ES-Neural2-B', name: 'es-ES-Neural2-B', gender: 'male', source: 'Google', language: 'es', languageCode: 'es-ES' },
    { code: 'fr-FR-Neural2-A', name: 'fr-FR-Neural2-A', gender: 'female', source: 'Google', language: 'fr', languageCode: 'fr-FR' },
    { code: 'fr-FR-Neural2-B', name: 'fr-FR-Neural2-B', gender: 'male', source: 'Google', language: 'fr', languageCode: 'fr-FR' },
    { code: 'pl-PL-Standard-A', name: 'pl-PL-Standard-A', gender: 'female', source: 'Google', language: 'pl', languageCode: 'pl-PL' },
    { code: 'pl-PL-Standard-B', name: 'pl-PL-Standard-B', gender: 'male', source: 'Google', language: 'pl', languageCode: 'pl-PL' },
    { code: 'it-IT-Neural2-A', name: 'it-IT-Neural2-A', gender: 'female', source: 'Google', language: 'it', languageCode: 'it-IT' },
    { code: 'it-IT-Neural2-B', name: 'it-IT-Neural2-B', gender: 'male', source: 'Google', language: 'it', languageCode: 'it-IT' },
    { code: 'ru-RU-Standard-A', name: 'ru-RU-Standard-A', gender: 'female', source: 'Google', language: 'ru', languageCode: 'ru-RU' },
    { code: 'ru-RU-Standard-B', name: 'ru-RU-Standard-B', gender: 'male', source: 'Google', language: 'ru', languageCode: 'ru-RU' },
    { code: 'uk-UA-Standard-A', name: 'uk-UA-Standard-A', gender: 'female', source: 'Google', language: 'uk', languageCode: 'uk-UA' },
    { code: 'uk-UA-Wavenet-A', name: 'uk-UA-Wavenet-A', gender: 'female', source: 'Google', language: 'uk', languageCode: 'uk-UA' },
    { code: 'pt-PT-Standard-A', name: 'pt-PT-Standard-A', gender: 'female', source: 'Google', language: 'pt', languageCode: 'pt-PT' },
    { code: 'pt-PT-Standard-B', name: 'pt-PT-Standard-B', gender: 'male', source: 'Google', language: 'pt', languageCode: 'pt-PT' },
    { code: 'lt-LT-Standard-A', name: 'lt-LT-Standard-A', gender: 'male', source: 'Google', language: 'lt', languageCode: 'lt-LT' },
    { code: 'lv-LV-Standard-A', name: 'lv-LV-Standard-A', gender: 'male', source: 'Google', language: 'lv', languageCode: 'lv-LV' },
    { code: 'de-DE-Neural2-A', name: 'de-DE-Neural2-A', gender: 'female', source: 'Google', language: 'de', languageCode: 'de-DE' },
    { code: 'de-DE-Neural2-B', name: 'de-DE-Neural2-B', gender: 'male', source: 'Google', language: 'de', languageCode: 'de-DE' },
    { code: 'de-DE-Neural2-C', name: 'de-DE-Neural2-C', gender: 'female', source: 'Google', language: 'de', languageCode: 'de-DE' },
    { code: 'de-DE-Neural2-D', name: 'de-DE-Neural2-D', gender: 'male', source: 'Google', language: 'de', languageCode: 'de-DE' },
    { code: 'de-DE-Neural2-F', name: 'de-DE-Neural2-F', gender: 'female', source: 'Google', language: 'de', languageCode: 'de-DE' },
    { code: 'de-DE-Polyglot-1', name: 'de-DE-Polyglot-1', gender: 'male', source: 'Google', language: 'de', languageCode: 'de-DE' },
    { code: 'de-DE-Standard-A', name: 'de-DE-Standard-A', gender: 'female', source: 'Google', language: 'de', languageCode: 'de-DE' },
    { code: 'de-DE-Standard-B', name: 'de-DE-Standard-B', gender: 'male', source: 'Google', language: 'de', languageCode: 'de-DE' },
    { code: 'de-DE-Standard-C', name: 'de-DE-Standard-C', gender: 'female', source: 'Google', language: 'de', languageCode: 'de-DE' },
    { code: 'de-DE-Standard-D', name: 'de-DE-Standard-D', gender: 'male', source: 'Google', language: 'de', languageCode: 'de-DE' },
    { code: 'de-DE-Standard-E', name: 'de-DE-Standard-E', gender: 'male', source: 'Google', language: 'de', languageCode: 'de-DE' },
    { code: 'de-DE-Standard-F', name: 'de-DE-Standard-F', gender: 'female', source: 'Google', language: 'de', languageCode: 'de-DE' },
    { code: 'de-DE-Studio-B', name: 'de-DE-Studio-B', gender: 'male', source: 'Google', language: 'de', languageCode: 'de-DE' },
    { code: 'de-DE-Studio-C', name: 'de-DE-Studio-C', gender: 'female', source: 'Google', language: 'de', languageCode: 'de-DE' },
    { code: 'de-DE-Wavenet-A', name: 'de-DE-Wavenet-A', gender: 'female', source: 'Google', language: 'de', languageCode: 'de-DE' },
    { code: 'de-DE-Wavenet-B', name: 'de-DE-Wavenet-B', gender: 'male', source: 'Google', language: 'de', languageCode: 'de-DE' },
    { code: 'de-DE-Wavenet-C', name: 'de-DE-Wavenet-C', gender: 'female', source: 'Google', language: 'de', languageCode: 'de-DE' },
    { code: 'de-DE-Wavenet-D', name: 'de-DE-Wavenet-D', gender: 'male', source: 'Google', language: 'de', languageCode: 'de-DE' },
    { code: 'de-DE-Wavenet-E', name: 'de-DE-Wavenet-E', gender: 'male', source: 'Google', language: 'de', languageCode: 'de-DE' },
    { code: 'de-DE-Wavenet-F', name: 'de-DE-Wavenet-F', gender: 'female', source: 'Google', language: 'de', languageCode: 'de-DE' },
    { code: 'en-US-Casual-K', name: 'en-US-Casual-K', gender: 'male', source: 'Google', language: 'en', languageCode: 'en-US' },
    { code: 'en-US-Journey-D', name: 'en-US-Journey-D', gender: 'male', source: 'Google', language: 'en', languageCode: 'en-US' },
    { code: 'en-US-Journey-F', name: 'en-US-Journey-F', gender: 'female', source: 'Google', language: 'en', languageCode: 'en-US' },
    { code: 'en-US-Neural2-A', name: 'en-US-Neural2-A', gender: 'male', source: 'Google', language: 'en', languageCode: 'en-US' },
    { code: 'en-US-Neural2-C', name: 'en-US-Neural2-C', gender: 'female', source: 'Google', language: 'en', languageCode: 'en-US' },
    { code: 'en-US-Neural2-D', name: 'en-US-Neural2-D', gender: 'male', source: 'Google', language: 'en', languageCode: 'en-US' },
    { code: 'en-US-Neural2-E', name: 'en-US-Neural2-E', gender: 'female', source: 'Google', language: 'en', languageCode: 'en-US' },
    { code: 'en-US-Neural2-F', name: 'en-US-Neural2-F', gender: 'female', source: 'Google', language: 'en', languageCode: 'en-US' },
    { code: 'en-US-Neural2-G', name: 'en-US-Neural2-G', gender: 'female', source: 'Google', language: 'en', languageCode: 'en-US' },
    { code: 'en-US-Neural2-H', name: 'en-US-Neural2-H', gender: 'female', source: 'Google', language: 'en', languageCode: 'en-US' },
    { code: 'en-US-Neural2-I', name: 'en-US-Neural2-I', gender: 'male', source: 'Google', language: 'en', languageCode: 'en-US' },
    { code: 'en-US-Neural2-J', name: 'en-US-Neural2-J', gender: 'male', source: 'Google', language: 'en', languageCode: 'en-US' },
    { code: 'en-US-News-K', name: 'en-US-News-K', gender: 'female', source: 'Google', language: 'en', languageCode: 'en-US' },
    { code: 'en-US-News-L', name: 'en-US-News-L', gender: 'female', source: 'Google', language: 'en', languageCode: 'en-US' },
    { code: 'en-US-News-N', name: 'en-US-News-N', gender: 'male', source: 'Google', language: 'en', languageCode: 'en-US' },
    { code: 'en-US-Polyglot-1', name: 'en-US-Polyglot-1', gender: 'male', source: 'Google', language: 'en', languageCode: 'en-US' },
    { code: 'en-US-Standard-A', name: 'en-US-Standard-A', gender: 'male', source: 'Google', language: 'en', languageCode: 'en-US' },
    { code: 'en-US-Standard-B', name: 'en-US-Standard-B', gender: 'male', source: 'Google', language: 'en', languageCode: 'en-US' },
    { code: 'en-US-Standard-C', name: 'en-US-Standard-C', gender: 'female', source: 'Google', language: 'en', languageCode: 'en-US' },
    { code: 'en-US-Standard-D', name: 'en-US-Standard-D', gender: 'male', source: 'Google', language: 'en', languageCode: 'en-US' },
    { code: 'en-US-Standard-E', name: 'en-US-Standard-E', gender: 'female', source: 'Google', language: 'en', languageCode: 'en-US' },
    { code: 'en-US-Standard-F', name: 'en-US-Standard-F', gender: 'female', source: 'Google', language: 'en', languageCode: 'en-US' },
    { code: 'en-US-Standard-G', name: 'en-US-Standard-G', gender: 'female', source: 'Google', language: 'en', languageCode: 'en-US' },
    { code: 'en-US-Standard-H', name: 'en-US-Standard-H', gender: 'female', source: 'Google', language: 'en', languageCode: 'en-US' },
    { code: 'en-US-Standard-I', name: 'en-US-Standard-I', gender: 'male', source: 'Google', language: 'en', languageCode: 'en-US' },
    { code: 'en-US-Standard-J', name: 'en-US-Standard-J', gender: 'male', source: 'Google', language: 'en', languageCode: 'en-US' },
    { code: 'en-US-Studio-O', name: 'en-US-Studio-O', gender: 'female', source: 'Google', language: 'en', languageCode: 'en-US' },
    { code: 'en-US-Studio-Q', name: 'en-US-Studio-Q', gender: 'male', source: 'Google', language: 'en', languageCode: 'en-US' },
    { code: 'en-US-Wavenet-A', name: 'en-US-Wavenet-A', gender: 'male', source: 'Google', language: 'en', languageCode: 'en-US' },
    { code: 'en-US-Wavenet-B', name: 'en-US-Wavenet-B', gender: 'male', source: 'Google', language: 'en', languageCode: 'en-US' },
    { code: 'en-US-Wavenet-C', name: 'en-US-Wavenet-C', gender: 'female', source: 'Google', language: 'en', languageCode: 'en-US' },
    { code: 'en-US-Wavenet-D', name: 'en-US-Wavenet-D', gender: 'male', source: 'Google', language: 'en', languageCode: 'en-US' },
    { code: 'en-US-Wavenet-E', name: 'en-US-Wavenet-E', gender: 'female', source: 'Google', language: 'en', languageCode: 'en-US' },
    { code: 'en-US-Wavenet-F', name: 'en-US-Wavenet-F', gender: 'female', source: 'Google', language: 'en', languageCode: 'en-US' },
    { code: 'en-US-Wavenet-G', name: 'en-US-Wavenet-G', gender: 'female', source: 'Google', language: 'en', languageCode: 'en-US' },
    { code: 'en-US-Wavenet-H', name: 'en-US-Wavenet-H', gender: 'female', source: 'Google', language: 'en', languageCode: 'en-US' },
    { code: 'en-US-Wavenet-I', name: 'en-US-Wavenet-I', gender: 'male', source: 'Google', language: 'en', languageCode: 'en-US' },
    { code: 'en-US-Wavenet-J', name: 'en-US-Wavenet-J', gender: 'male', source: 'Google', language: 'en', languageCode: 'en-US' },
    { code: 'en-GB-Neural2-A', name: 'en-GB-Neural2-A', gender: 'female', source: 'Google', language: 'en', languageCode: 'en-GB' },
    { code: 'en-GB-Neural2-B', name: 'en-GB-Neural2-B', gender: 'male', source: 'Google', language: 'en', languageCode: 'en-GB' },
    { code: 'en-GB-Neural2-C', name: 'en-GB-Neural2-C', gender: 'female', source: 'Google', language: 'en', languageCode: 'en-GB' },
    { code: 'en-GB-Neural2-D', name: 'en-GB-Neural2-D', gender: 'male', source: 'Google', language: 'en', languageCode: 'en-GB' },
    { code: 'en-GB-Neural2-F', name: 'en-GB-Neural2-F', gender: 'female', source: 'Google', language: 'en', languageCode: 'en-GB' },
    { code: 'en-GB-News-G', name: 'en-GB-News-G', gender: 'female', source: 'Google', language: 'en', languageCode: 'en-GB' },
    { code: 'en-GB-News-H', name: 'en-GB-News-H', gender: 'female', source: 'Google', language: 'en', languageCode: 'en-GB' },
    { code: 'en-GB-News-I', name: 'en-GB-News-I', gender: 'female', source: 'Google', language: 'en', languageCode: 'en-GB' },
    { code: 'en-GB-News-J', name: 'en-GB-News-J', gender: 'male', source: 'Google', language: 'en', languageCode: 'en-GB' },
    { code: 'en-GB-News-K', name: 'en-GB-News-K', gender: 'male', source: 'Google', language: 'en', languageCode: 'en-GB' },
    { code: 'en-GB-News-L', name: 'en-GB-News-L', gender: 'male', source: 'Google', language: 'en', languageCode: 'en-GB' },
    { code: 'en-GB-News-M', name: 'en-GB-News-M', gender: 'male', source: 'Google', language: 'en', languageCode: 'en-GB' },
    { code: 'en-GB-Standard-A', name: 'en-GB-Standard-A', gender: 'female', source: 'Google', language: 'en', languageCode: 'en-GB' },
    { code: 'en-GB-Standard-B', name: 'en-GB-Standard-B', gender: 'male', source: 'Google', language: 'en', languageCode: 'en-GB' },
    { code: 'en-GB-Standard-C', name: 'en-GB-Standard-C', gender: 'female', source: 'Google', language: 'en', languageCode: 'en-GB' },
    { code: 'en-GB-Standard-D', name: 'en-GB-Standard-D', gender: 'male', source: 'Google', language: 'en', languageCode: 'en-GB' },
    { code: 'en-GB-Standard-F', name: 'en-GB-Standard-F', gender: 'female', source: 'Google', language: 'en', languageCode: 'en-GB' },
    { code: 'en-GB-Studio-B', name: 'en-GB-Studio-B', gender: 'male', source: 'Google', language: 'en', languageCode: 'en-GB' },
    { code: 'en-GB-Studio-C', name: 'en-GB-Studio-C', gender: 'female', source: 'Google', language: 'en', languageCode: 'en-GB' },
    { code: 'en-GB-Wavenet-A', name: 'en-GB-Wavenet-A', gender: 'female', source: 'Google', language: 'en', languageCode: 'en-GB' },
    { code: 'en-GB-Wavenet-B', name: 'en-GB-Wavenet-B', gender: 'male', source: 'Google', language: 'en', languageCode: 'en-GB' },
    { code: 'en-GB-Wavenet-C', name: 'en-GB-Wavenet-C', gender: 'female', source: 'Google', language: 'en', languageCode: 'en-GB' },
    { code: 'en-GB-Wavenet-D', name: 'en-GB-Wavenet-D', gender: 'male', source: 'Google', language: 'en', languageCode: 'en-GB' },
    { code: 'en-GB-Wavenet-F', name: 'en-GB-Wavenet-F', gender: 'female', source: 'Google', language: 'en', languageCode: 'en-GB' }
  ]

  static googleVoicesByLanguage(voice: string): any[] {
    return TtsService.googleVoices.filter(v => v.language === voice);
  }

  private block = new Subject<any>();
  private state: string = 'none';
  private blocks: any[] = null;
  
  readingPageUuid = null;

  activeBlockIndex: number = -1;

  audio: HTMLAudioElement;

  documentLanguage: string = null;

  onFinished: () => void;
  onError: (error: string) => void;

  private userPaused: boolean = false;

  continuing: boolean = false;

  constructor(private ai: AiService,
    private api: KrameriusApiService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private altoService: AltoService) {
  } 

  readPage(uuid: string, onFinished: () => void, onError: (error: string) => void) {
    this.continuing = true;
    this.readingPageUuid = uuid;
    this.state = 'loading';
    this.onFinished = onFinished;
    this.onError = onError;
    this.api.getAlto(uuid).subscribe(
        result => {
            const blocks = this.altoService.getBlocksForReading(result);
            console.log(blocks);
            this.blocks = blocks;
            this.next();
        },
        error => {
            if (error instanceof NotFoundError) {
              // todo not found
            } else if (error instanceof UnauthorizedError) {
              // todo unauthorized
            } else {
              // todo unexpected error
            }
        }
    );
  }

  openSettings() {
    this.stop();
    this.dialog.open(TtsDialogComponent);
  }

  setInProgress() {
    this.state = 'loading';
  }

  readSelection(text: string, onFinished: () => void, onError: (error: string) => void) {
    this.continuing = false;
    this.state = 'loading';
    this.onFinished = onFinished;
    this.onError = onError;
    this.readText(text);
  }

  stop() {
    this.finish(true);
  }

  pause() {
    this.userPaused = true;
    if (this.audio) {
      this.audio.pause();
    }
  }

  paused(): boolean {
    return this.userPaused;
  }

  resume() {
    if (this.audio) {
      this.audio.play();
    }
    this.userPaused = false;
  } 


  watchBlock(): Observable<any> {
    return this.block.asObservable();
  }

  inProgress(): boolean { 
    return this.state === 'speaking' || this.state === 'loading';
  }

  isLoading(): boolean {
    return this.state === 'loading';
  }

  private finish(fromUser: boolean = false) {
    this.userPaused = false;
    this.documentLanguage = null;
    this.state = 'none';
    this.blocks = null;
    this.activeBlockIndex = -1;
    this.block.next(null);
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
    if (this.onFinished && !fromUser) {
      this.onFinished();
    }
    this.onFinished = null;
    this.onError = null;
  }

  skipNext() {
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
    this.next();
  }

  private next() {
    if (!this.blocks) {
      this.finish();
      return;
    }
    console.log('next');
    console.log(this.activeBlockIndex);
    this.activeBlockIndex++;
    if (this.activeBlockIndex >= this.blocks.length) {
      this.finish();
      return;
    }
    const block = this.blocks[this.activeBlockIndex];
    this.block.next(block);
    this.readText(block.text);
  }

  ttsLanguage(): string {
    return localStorage.getItem('tts.language') || this.translateService.currentLang;
  }

  ttsVoice(): any {
    const source = localStorage.getItem('tts.source');
    const voice = localStorage.getItem('tts.voice');
    if (!source || !voice) {
      const languages = TtsService.googleVoicesByLanguage(this.ttsLanguage());
      if (languages.length > 0) {
        return languages[0];
      }
      return TtsService.openAIVoices[0];
    }
    if (source === 'Google') {
      return TtsService.googleVoices.find(v => v.code === voice);
    } else if (source === 'OpenAI') {
      return TtsService.openAIVoices.find(v => v.code === voice);
    }
  }


  private readText(text: string) {   
    const voice = this.ttsVoice();
    if (voice.source === 'Google') {
      this.readTextG(text, voice);
    } else if (voice.source === 'OpenAI') {
      this.readTextO(text, voice);
    }
  }

  private readTextG(text: string, voice: any) {    
    if (this.documentLanguage) {
      if (this.documentLanguage !== this.ttsLanguage()) {
          this.ai.translate(text, this.ttsLanguage(), (translation, error) => {
            if (error) { this.onAiError(error); return; }
            this.ai.textToSpeech(translation, voice, (audioContent, error) => {
              if (error) { this.onAiError(error); return; }
              this.playAudioContent(audioContent);
            });
          });
      } else {
        this.ai.textToSpeech(text, voice, (audioContent, error) => {
          if (error) { this.onAiError(error); return; }
          this.playAudioContent(audioContent);
        });
      }
    } else {
      const dText = text.substring(0,40);
      this.ai.detectLanguage(dText, (language, error) => {
        if (error) { this.onAiError(error); return; }
        this.documentLanguage = language;
        this.readText(text);
      });
    }
  }

  private readTextO(text: string, voice: any) {    
    if (this.documentLanguage) {
      if (this.documentLanguage !== this.ttsLanguage()) {
          this.ai.translate(text, this.ttsLanguage(), (translation, error) => {
            if (error) { this.onAiError(error); return; }
            this.ai.testOpenAiTTS(translation, voice.code, (blob, error) => {
              if (error) { this.onAiError(error); return; }
              this.playAudioBlob(blob);
            });
          });
      } else {
        this.ai.testOpenAiTTS(text, voice.code, (blob, error) => {
          if (error) { this.onAiError(error); return; }
          this.playAudioBlob(blob);
        });
      }
    } else {
      const dText = text.substring(0,40);
      this.ai.detectLanguage(dText, (language, error) => {
        if (error) { this.onAiError(error); return; }
        this.documentLanguage = language;
        this.readText(text);
      });
    }
  }
  


  stopTestTTS() {
    this.finish(true)
  }

  testTTS(voice: any, text: string, loaded: () => void) {
    this.stopTestTTS();
    if (voice.source === 'Google') {
      this.ai.textToSpeech(text, voice, (audioContent, error) => {
        this.playAudioContent(audioContent);
        loaded();
      });
    } else if (voice.source === 'OpenAI') {
      this.ai.testOpenAiTTS(text, voice.code, (blob, error) => {
        this.playAudioBlob(blob);
        loaded();
      });
    }
  }

  private onAiError(error: string) {
    this.finish(true);
    this.onError(error);
  }


  private playAudioBlob(blob) {
    this.state = 'speaking'
    const audioUrl = URL.createObjectURL(blob);
    this.audio = new Audio(audioUrl);
    this.audio.onended = (event) => {
      this.state = 'loading';
      this.next();
    };
    // this.audio.stop();
    if (!this.userPaused) {
      this.audio.play();
    }
  }


  private playAudioContent(audioContent: string) {
    this.state = 'speaking'
    const audioData = this.base64ToUint8Array(audioContent);
    const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(audioBlob);
    this.audio = new Audio(audioUrl);
    this.audio.onended = (event) => {
      this.state = 'loading';
      this.next();
    };
    // this.audio.stop();
    if (!this.userPaused) {
      this.audio.play();
    }
  }

  private base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const length = binaryString.length;
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }



}
