import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppSettings } from './app-settings';
import { AuthService } from './auth.service';
import { Subscription } from 'rxjs';

@Injectable()
export class AiService {

  private baseUrl = 'https://api.trinera.cloud/api';

  private temperature = 0;
  private maxTokens = 1000;

  userSubscription: Subscription;


  roles: string[] = [];
  loggedIn = false;

  constructor(
    private settings: AppSettings,
    private auth: AuthService,
    private http: HttpClient) {
      this.userSubscription = this.auth.watchUser().subscribe((user) => {
        if ((user && user.isLoggedIn()) || this.settings.getAiToken()) {
          this.loggedIn = true;
          this.reloadAIUser(null);
        } else {
          this.loggedIn = false;
          this.roles = [];
        }
      });
      if (this.auth.isLoggedIn() || this.settings.getAiToken()) {
        this.loggedIn = true;
        this.reloadAIUser(null);
      }
  } 

  aiEnabled(): boolean {
    return (this.settings.ai && this.loggedIn) || !!this.settings.getAiToken();
  }

  aiAvailable(): boolean {
      return this.settings.ai || !!this.settings.getAiToken();
  }

  testActionsEnabled(): boolean {
    return this.roles.includes('TESTER');
  }  

  private post(path: string, body: any, callback: (response: any) => void, errorCallback?: (error: string) => void, responseType: string = null) {
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

    let options = { headers: headers };
    if (responseType === 'arraybuffer') {
      options['responseType'] = 'arraybuffer';
    }
    this.http.post(url, body, options).subscribe((response: any) => {
      if (callback) {
        callback(response);
      }
    }, error => {
      console.log('error', error);
      let e = "error";
      if (error.error && error.error.errorCode) {
        e = error.error.errorCode;
      }
      console.log('e', e);
      if (e == 'quota_exceeded') {
        errorCallback('quota_exceeded');
      } else if (e == 'auth_token_expired') {
        errorCallback('token_expired');
      } else if (error.status === 403 || error.status === 401) {
        errorCallback('unauthorized');
      } else {
        errorCallback('unknown_error');
      }
    });
  }

  reloadAIUser(callback: (response: any) => void) {
    let token;
    if (this.settings.ai && this.auth.isLoggedIn()) {
      token = this.settings.getToken();
    } else {
      token = this.settings.getAiToken();
    }
    const url = `${this.baseUrl}/user`;
    let headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', `application/json`);

    let options = { headers: headers };
    this.http.get(url, options).subscribe((response: any) => {
      console.log('GET USER', response);
      this.roles = response.access_rights || [];
    }, error => {
      this.roles = [];
      console.log('GET USER: error', error);
      if (error.status === 403 || error.status === 401) {
        // errorCallback('unauthorized');
        // return;
      }
    });
  }

  elevenLabsTTS(text: string, voice: string, callback: (blob: any, error?: string) => void) {
    var body = JSON.stringify({
      'model_id': 'eleven_multilingual_v2',
      'text':text
    });

    let headers = new HttpHeaders()
    .set('Content-Type', 'application/json')
    .set('xi-api-key', '--');

    let options = { headers: headers };
    options['responseType'] = 'arraybuffer';
  
    this.http.post(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, body, options).subscribe((response: any) => {
      var blob = new Blob([response]);
      callback(blob);
    },(error: string) => {
      callback(null, error);
    });
  }


  openAiTTS(text: string, voice: String, callback: (blob: any, error?: string) => void) {
    var body = JSON.stringify({
      'model':'tts-1',
      'voice': voice,
      'input':text
    });
    this.post('/openai/tts', body, (response: any) => {
      var blob = new Blob([response]);
      callback(blob);
    },(error: string) => {
      callback(null, error);
    }, 'arraybuffer');
  }

  googleTTS(text: string, voice: string, language: string, callback: (audioContent: string, error?: string) => void) {
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
      "voice": {
        "languageCode": language,
        "name": voice
      }
    };
    this.post(path, body, (response: any) => {
      callback(response['audioContent']);
    }, (error: string) => {
      callback(null, error);
    });
  }


 askGPT(input: string, instructions: string, model: string | null, callback: (answer: string, error?: string) => void) {
    const path = `/openai/chat/completions`;
    let m = model || 'gpt-4o-mini'
    const body = {
      'model': m,
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




  askClaude(input: string, instructions: string, model: string | null, callback: (answer: string, error?: string) => void) {
    const path = `/anthropic/messages`;
    let m = model || 'claude-3-sonnet-20240229';
    const body = {
      'model': m,
      'messages': [
        {
          "role": "user",
          "content": `${input}\n\n${instructions}`
        }
      ],
      'temperature': this.temperature,
      'max_tokens': this.maxTokens
    };
    this.post(path, body, (response: any) => {
      let answer = response['content'][0]['text'];
      callback(answer);
    }, (error: string) => {
      callback(null, error);
    });
  }


  askGemini(input: string, instructions: string, model: string | null, callback: (answer: string, error?: string) => void) {
    const m = model || 'gemini-pro';
    const path = `/google/gemini/${model}`;
    const body = {
      'contents': [
        { 'role': 'user', 'parts': [
          { 'text': `${input}\n\n${instructions}` }
        ]}
      ],
      'generationConfig': { 'temperature' : this.temperature, 'maxOutputTokens': this.maxTokens }
    }
    this.post(path, body, (response: any) => {
      let answer = response['candidates'][0]['content']['parts'][0]['text'];
      callback(answer);
    }, (error: string) => {
      callback(null, error);
    });
  }



  translate(input: string, targetLanguage: string, callback: (answer: string, error?: string) => void) {
    // const path = `/deepl/translate`;
    // const body = {
    //   'text': [input],
    //   'target_lang': targetLanguage
    // };
    // this.post(path, body, (response: any) => {
    //   console.log('respnse', response);
    //   const answer = response['translations'][0]['text'];
    //   callback(answer);
    // }, (error: string) => {
    //   callback(null, error);
    // });
    const path = `/google/translate`;
    const body = {
      'q': [input],
      'target': targetLanguage
    };
    this.post(path, body, (response: any) => {
      console.log('respnse', response);
      const answer = response['data']['translations'][0]['translatedText'];
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
