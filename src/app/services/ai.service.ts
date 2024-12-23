import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppSettings } from './app-settings';
import { AuthService } from './auth.service';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { BasicDialogComponent } from '../dialog/basic-dialog/basic-dialog.component';
import { Router } from '@angular/router';

@Injectable()
export class AiService {

  private baseUrl = 'https://api.trinera.cloud/api';
  private embeddingModel = 'text-embedding-3-small';

  private temperature = 0;

  private similaritySearchEnabled = localStorage.getItem('similaritySearchEnabled') === 'true';

  userSubscription: Subscription;

  roles: string[] = [];
  loggedIn = false;

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

  constructor(
    private settings: AppSettings,
    private auth: AuthService,
    private dialog: MatDialog,
    private router: Router,
    private http: HttpClient) {
      this.userSubscription = this.auth.watchUser().subscribe((user) => {
        if ((user && user.isLoggedIn() && this.settings.ai) || this.settings.getAiToken()) {
          this.loggedIn = true;
          this.reloadAIUser(null);
        } else {
          this.loggedIn = false;
          this.roles = [];
        }
      });
      if ((this.auth.isLoggedIn() && this.settings.ai) || this.settings.getAiToken()) {
        this.loggedIn = true;
        this.reloadAIUser(null);
      }
  } 

  aiEnabled(): boolean {
    return (this.settings.ai && this.loggedIn) || !!this.settings.getAiToken();
  }

  checkAiActionsEnabled(): boolean {
    if (this.aiEnabled()) {
        return true;
    }
    this.dialog.open(BasicDialogComponent, { data: {
        title: 'ai.not_logged_in.title',
        messageHtml: 'ai.not_logged_in.message',
        button: 'common.close',
        buttonPositive: 'ai.not_logged_in.action'
    }, autoFocus: false }).afterClosed().subscribe(result => {
        if (result == 'positive') {
            const path = this.settings.getRelativePath();
            localStorage.setItem('login.url', path);
            if (this.settings.termsPage) {
              this.router.navigate(['/terms']);
            } else {
              this.auth.login();
            }
        }
    });
    return false;
}

  aiAvailable(): boolean {
      return this.settings.ai || !!this.settings.getAiToken();
  }

  testActionsEnabled(): boolean {
    return this.roles.includes('TESTER');
  }  

  similaritySearchAvailable(): boolean {
    return this.aiAvailable() && this.testActionsEnabled() && !!this.settings.similaritySearchIndex;
  }

  isSimilaritySearchEnabled(): boolean {
    return this.similaritySearchAvailable() && this.similaritySearchEnabled;
  }

  toggleSimilarySearchEnabled() {
    localStorage.setItem('similaritySearchEnabled', this.similaritySearchEnabled ? 'false' : 'true');
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

  elevenLabsTTS(text: string, voice: string, callback: (audioContent: string, error?: string) => void) {
    var body = JSON.stringify({
      'model_id': 'eleven_multilingual_v2',
      'text':text
    });
    this.post(`/elevenlabs/tts/${voice}`, body, (response: any) => {
      callback(response['audioContent']);
    },(error: string) => {
      callback(null, error);
    });
  }


  openAiTTS(text: string, voice: String, callback: (audioContent: string, error?: string) => void) {
    var body = JSON.stringify({
      'model':'tts-1',
      'voice': voice,
      'input':text
    });
    this.post('/openai/tts', body, (response: any) => {
      callback(response['audioContent']);
    },(error: string) => {
      callback(null, error);
    });
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


  getDefaultModel() {
    return this.models[2];
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

  translate(provider: String | null, input: string, targetLanguage: string, callback: (answer: string, error?: string) => void) {
    provider = provider || 'google';
    if (provider === 'deepl') {
      this.translateWithDeepL(input, targetLanguage, callback);
    } else if (provider === 'google') {
      this.translateWithGoogle(input, targetLanguage, callback);
    }
  }

  askLLM(input: string, instructions: string, provider: string | null, model: string | null, callback: (answer: string, error?: string) => void, maxTokens: number = 1000) {
    provider = provider || 'openai';
    if (provider === 'openai') {
      this.askGPT(input, instructions, model, maxTokens, callback);
    } else if (provider === 'anthropic') {
      this.askClaude(input, instructions, model, maxTokens, callback);
    } else if (provider === 'google') {
      this.askGemini(input, instructions, model, maxTokens, callback);
    }
  }

  getEmbedding(input: string, callback: (answer: number[], error?: string) => void) {
    const path = '/openai/embeddings';
    const body = {
      input: input,
      model: this.embeddingModel
    };
    this.post(path, body, (response: any) => {
      const vector = response['data'][0]['embedding'];
      callback(vector);
    }, (error: string) => {
      callback(null, error);
    });
  }

  queryVector(vector: number[], topK: number, filter: any = {}, callback: (answer: number[], error?: string) => void) {
    const path = `/pinecone/query/${this.settings.similaritySearchIndex}`;
    const body = {
      vector: vector,
      topK: topK,
      filter : filter,
      include_metadata: true
    };
    this.post(path, body, (response: any) => {
      callback(response);
    }, (error: string) => {
      callback(null, error);
    });
  }


  findSimilarTexts(input: string, count: number, filter: any, callback: (answer: any[], error?: string) => void) {
    this.getEmbedding(input, (vector, error) => {
      if (error) {
        callback(null, error);
        return;
      }
      this.queryVector(vector, count, filter, (response, error) => {
        if (error) {
          callback(null, error);
          return;
        }
        callback(response);
      });
    });
  }


  showAiError(error: string) {
    this.dialog.open(BasicDialogComponent, { data: {
        messageHtml: 'ai.warning.' + error,
        button: 'common.close'
    }, autoFocus: false });
  }

  private translateWithDeepL(input: string, targetLanguage: string, callback: (answer: string, error?: string) => void) {
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

  private translateWithGoogle(input: string, targetLanguage: string, callback: (answer: string, error?: string) => void) {
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

  private askGPT(input: string, instructions: string, model: string | null, maxTokens: number, callback: (answer: string, error?: string) => void) {
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
      'max_tokens': maxTokens
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

  private askClaude(input: string, instructions: string, model: string | null, maxTokens: number, callback: (answer: string, error?: string) => void) {
    const path = `/anthropic/messages`;
    let m = model || 'claude-3-sonnet-20240229';
    const body = {
      'model': m,
      'messages': [
        {
          "role": "user",
          "content": `${instructions}\n\n${input}`
        }
      ],
      'temperature': this.temperature,
      'max_tokens': maxTokens
    };
    this.post(path, body, (response: any) => {
      let answer = response['content'][0]['text'];
      callback(answer);
    }, (error: string) => {
      callback(null, error);
    });
  }


  private askGemini(input: string, instructions: string, model: string | null, maxTokens: number, callback: (answer: string, error?: string) => void) {
    const m = model || 'gemini-pro';
    const path = `/google/gemini/${model}`;
    const body = {
      'contents': [
        { 'role': 'user', 'parts': [
          { 'text': `${instructions}\n\n${input}` }
        ]}
      ],
      'generationConfig': { 'temperature' : this.temperature, 'maxOutputTokens': maxTokens }
    }
    this.post(path, body, (response: any) => {
      let answer = response['candidates'][0]['content']['parts'][0]['text'];
      callback(answer);
    }, (error: string) => {
      callback(null, error);
    });
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



}
