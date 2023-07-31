import { Injectable } from '@angular/core';
import { KrameriusApiService } from './kramerius-api.service';
import { NotFoundError } from '../common/errors/not-found-error';
import { AltoService } from './alto-service';
import { UnauthorizedError } from '../common/errors/unauthorized-error';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs-compat';

@Injectable()
export class TtsService {

  private block = new Subject<any>();

  private googleApiKey = 'AIzaSyBrzncMsAFk76nBIuSdZfUUBaZy1wY54pc';
  private openaiApiKey = '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';
  private temperature = 0;
  private maxTokens = 1000;
  private model = 'gpt-3.5-turbo'; 
    // private model = 'gpt-3.5-turbo-16k'; 

  // private model = 'text-davinci-003';

  private state: string = 'none';
  private blocks: any[] = [];

  activeBlockIndex: number = -1;

  audio: any;

  onFinished: () => void;

  private translate = false;

  constructor(private api: KrameriusApiService,
    private http: HttpClient,
    private altoService: AltoService) {
  } 



  readPage(uuid: string, onFinished: () => void) {
    this.state = 'loading';
    this.onFinished = onFinished;
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

  stop() {
    if (this.audio) {
      this.audio.pause();
    }
    this.finish(true);
  }

  watchBlock(): Observable<any> {
    return this.block.asObservable();
  }

  inProgress(): boolean { 
    return this.state === 'speaking' || this.state === 'loading';
  }

  private finish(fromUser: boolean = false) {
    this.state = 'none';
    this.blocks = null;
    this.activeBlockIndex = -1;
    this.block.next(null);
    if (this.onFinished && !fromUser) {
      this.onFinished();
    }
  }



  private next() {
    if (!this.blocks) {
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
    // setTimeout(() => {
    //   this.sayNext();
    // }, 2000);
    // return;
    console.log('bt', block.text);
    if (this.translate) {
      this.askGPT(block.text, "Přelož do češtiny", (answer) => {
        this.sayIt(answer);
      });
    } else {
      this.sayIt(block.text);
    }
  }

  private sayIt(text: string) {
    const url = `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${this.googleApiKey}`;
    const body = {
      "audioConfig": {
        "audioEncoding": "LINEAR16",
        "effectsProfileId": [
          "small-bluetooth-speaker-class-device"
        ],
        "pitch": 0,
        "speakingRate": 1
      },
      "input": {
        "text": text
      },
      "voice": {
        "languageCode": "cs-CZ",
        "name": "cs-CZ-Wavenet-A"
      }
    };
    console.log('body', body);
    this.http.post(url, body).subscribe((repsonse: any) => {
      this.playAudioContent(repsonse['audioContent']);
    })
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
    this.audio.stop
    this.audio.play();
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




 askGPT(input: string, instructions: string, callback: (answer: string) => void) {
    let promt = !!instructions ? `${instructions}:\n\n${input}` : input;
    const url = `https://api.openai.com/v1/chat/completions`;
    const headers = new HttpHeaders()
      .set('Content-Type', `application/json`)
      .set('Authorization', `Bearer ${this.openaiApiKey}`);
    const body = {
      'model': this.model,
      'messages': [
        {
          "role": "system",
          "content": instructions
        },
        {
          "role": "user",
          "content": promt
        }
      ],
      'temperature': this.temperature,
      'max_tokens': this.maxTokens
    };
    this.http.post(url, body, { headers: headers }).subscribe((response: any) => {
      console.log('respnse', response);
      let answer = response['choices'][0]['message']['content'];
      const searchString = "\n\n";
      const startIndex = input.indexOf(searchString);
      if (startIndex !== -1 && startIndex < 10) {
        answer = answer.substring(startIndex + searchString.length);
      }
      callback(answer);
    });
  }


}
