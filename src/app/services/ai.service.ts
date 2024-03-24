import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppSettings } from './app-settings';
import { AuthService } from './auth.service';

@Injectable()
export class AiService {

  private baseUrl = 'https://api.trinera.cloud/api';


  private temperature = 0;
  private maxTokens = 1000;
  // private model = 'gpt-3.5-turbo'; 
  // private model = 'gpt-3.5-turbo-16k'; 
  private model = 'gpt-3.5-turbo-0125';
  // private model = 'gpt-3.5-turbo-1106';
  // private model = 'text-davinci-003';
  
  constructor(
    private settings: AppSettings,
    private auth: AuthService,
    private http: HttpClient) {
  } 
  

  private post(path: string, body: any, callback: (response: any) => void, errorCallback?: (error: string) => void) {
    let token;
    if (this.settings.ai && this.auth.isLoggedIn()) {
      token = this.settings.getToken();
    } else {
      token = this.settings.getAiToken();
    }
    const url = `${this.baseUrl}${path}`;
    let headers = new HttpHeaders()
      .set('X-Tai-Source', location.href)
      .set('X-Tai-Project', `Kramerius`)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', `application/json`);

    this.http.post(url, body, { headers: headers }).subscribe((response: any) => {
      if (callback) {
        callback(response);
      }
    }, error => {
      console.log('error', error);
      if (error.status === 403 || error.status === 401) {
        errorCallback('unauthorized');
        return;
      }
      let e = "error";
      if (error.error && error.error.errorMessage) {
        e = error.error.errorMessage;
      }
      console.log('e', e);
      if (e == 'quota exceeded') {
        errorCallback('quota_exceeded');
      } else {
        errorCallback('unknown_error');
      }
    });
  }


  testOpenAiTTS(text: string, voice: String, callback: (blob: any, error?: string) => void) {
    var formData = JSON.stringify({
      'model':'tts-1',
      'voice': voice,
      'input':text
    });
    let headers = new HttpHeaders()
      .set('Content-Type', `application/json`)
      .set('Authorization', `Bearer *`);
    this.http.post('https://api.openai.com/v1/audio/speech', formData, { headers: headers , responseType: 'arraybuffer' }).subscribe((response: any) => {
      var blob = new Blob([response]);
      callback(blob);
    }, (error) => {});
  }

  textToSpeech(text: string, language: string, callback: (audioContent: string, error?: string) => void) {
    let voice;
    if (language === 'cs') {
      voice = {
        "languageCode": "cs-CZ",
        "name": "cs-CZ-Wavenet-A"
      }
    } else if (language === 'sk') {
      voice = {
        "languageCode": "sk-SK",
        "name": "sk-SK-Wavenet-A"
      }
    } else if (language === 'de') {
      voice = {
        "languageCode": "de-DE",
        "name": "de-DE-Wavenet-F"
      }
    } else {  
      voice = {
        "languageCode": "en-US",
        "name": "en-US-Neural2-J"
      }
    }
    const path = `/google/tts`;
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
        "text": text.toLocaleLowerCase()
      },
      "voice": voice
    };
    this.post(path, body, (response: any) => {
      callback(response['audioContent']);
    }, (error: string) => {
      callback(null, error);
    });
  }


 askGPT(input: string, instructions: string, callback: (answer: string, error?: string) => void) {
    const path = `/openai/chat/completions`;
    const body = {
      'model': this.model,
      'messages': [
        {
          "role": "system",
          "content": instructions
        },
        {
          "role": "user",
          "content": input
        }
      ],
      'temperature': this.temperature,
      'max_tokens': this.maxTokens
    };
    this.post(path, body, (response: any) => {
      console.log('respnse', response);
      let answer = response['choices'][0]['message']['content'];
      const searchString = "\n\n";
      const startIndex = input.indexOf(searchString);
      if (startIndex !== -1 && startIndex < 10) {
        answer = answer.substring(startIndex + searchString.length);
      }
      callback(answer);
    }, (error: string) => {
      callback(null, error);
    });
  }

  translate(input: string, targetLanguage: string, callback: (answer: string, error?: string) => void) {
    const path = `/deepl/translate`;
    const body = {
      'text': [input],
      'target_lang': targetLanguage
    };
    this.post(path, body, (response: any) => {
      console.log('respnse', response);
      const answer = response['translations'][0]['text'];
      callback(answer);
    }, (error: string) => {
      callback(null, error);
    });
  }

  detectLanguage(input: string, callback: (answer: string, error?: string) => void) {
    const path = `/google/translate/detect`;
    const body = {
      'q': input,
    };
    this.post(path, body, (response: any) => {
      console.log('respnse', response);
      const answer = response['data']['detections'][0][0]['language'];
      callback(answer);
    }, (error: string) => {
      callback(null, error);
    });
  }

}
