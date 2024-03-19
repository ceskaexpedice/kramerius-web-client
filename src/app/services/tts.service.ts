import { Injectable } from '@angular/core';
import { NotFoundError } from '../common/errors/not-found-error';
import { AltoService } from './alto-service';
import { UnauthorizedError } from '../common/errors/unauthorized-error';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs-compat';
import { TranslateService } from '@ngx-translate/core';
import { AiService } from './ai.service';
import { KrameriusApiService } from './kramerius-api.service';

@Injectable()
export class TtsService {

  private block = new Subject<any>();
  private state: string = 'none';
  private blocks: any[] = null;
  
  readingPageUuid = null;

  activeBlockIndex: number = -1;

  audio: HTMLAudioElement;

  documentLanguage: string = null;
  userLanguage: string = null;

  onFinished: () => void;
  onError: (error: string) => void;

  private userPaused: boolean = false;

  continuing: boolean = false;

  constructor(private ai: AiService,
    private api: KrameriusApiService,
    private translateService: TranslateService,
    private altoService: AltoService) {
  } 

  readPage(uuid: string, onFinished: () => void, onError: (error: string) => void) {
    this.continuing = true;
    this.readingPageUuid = uuid;
    this.userLanguage = this.translateService.currentLang;
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

  setInProgress() {
    this.state = 'loading';
  }

  readSelection(text: string, onFinished: () => void, onError: (error: string) => void) {
    this.continuing = false;
    this.state = 'loading';
    this.userLanguage = this.translateService.currentLang;
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
    console.log('bt', block.text);
    this.readText(block.text);
  }

  private readText(text: string) {    
    if (this.documentLanguage) {
      if (this.documentLanguage !== this.userLanguage) {
          this.ai.translate(text, this.userLanguage, (translation, error) => {
            if (error) { this.onAiError(error); return; }
            this.ai.textToSpeech(translation, this.userLanguage, (audioContent, error) => {
              if (error) { this.onAiError(error); return; }
              this.playAudioContent(audioContent);
            });
          });
      } else {
        this.ai.textToSpeech(text, this.userLanguage, (audioContent, error) => {
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

  // private readText(text: string) {    
  //   if (this.documentLanguage) {
  //     if (this.documentLanguage !== this.userLanguage) {
  //         this.ai.translate(text, this.userLanguage, (translation, error) => {
  //           if (error) { this.onAiError(error); return; }
  //           this.ai.testOpenAiTTS(translation, (blob, error) => {
  //             if (error) { this.onAiError(error); return; }
  //             this.playAudioBlob(blob);
  //           });
  //         });
  //     } else {
  //       this.ai.testOpenAiTTS(text, (blob, error) => {
  //         if (error) { this.onAiError(error); return; }
  //         this.playAudioBlob(blob);
  //       });
  //     }
  //   } else {
  //     const dText = text.substring(0,40);
  //     this.ai.detectLanguage(dText, (language, error) => {
  //       if (error) { this.onAiError(error); return; }
  //       this.documentLanguage = language;
  //       this.readText(text);
  //     });
  //   }
  // }

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
