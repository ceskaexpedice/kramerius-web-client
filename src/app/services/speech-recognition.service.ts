import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SpeechRecognitionService {

  private recognition: any | null = null;


  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;

  private readonly apiUrl = 'https://api.openai.com/v1/audio/transcriptions';
  private readonly apiKey = ''; 

  constructor(private http: HttpClient) {
    const SpeechRecognition = window['SpeechRecognition'] || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'cs-CZ'; // Default language
      this.recognition.interimResults = false;
      this.recognition.continuous = false;
    }
  }

  /**
   * Starts audio recording using MediaRecorder
   * @returns Promise that resolves when recording starts
   */
  startRecording(): Promise<void> {
    return navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        this.audioChunks = [];
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.audioChunks.push(event.data);
          }
        };
        this.mediaRecorder.start();
        this.isRecording = true;
      })
      .catch((error) => {
        console.error('Error accessing audio devices:', error);
        throw new Error('Microphone access denied or unavailable.');
      });
  }

  /**
   * Stops audio recording and returns the recorded audio as a Blob
   * @returns Promise with the recorded audio Blob
   */
  stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        reject('No active recording to stop.');
        return;
      }
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        resolve(audioBlob);
        this.isRecording = false;
      };
      this.mediaRecorder.stop();
    });
  }

  /**
   * Sends the audio Blob to OpenAI Whisper API and retrieves the transcription
   * @param audioBlob The recorded audio Blob
   * @returns Promise with the transcribed text
   */
  sendAudioToWhisper(audioBlob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'cs');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.apiKey}`
    });
    return this.http.post<any>(this.apiUrl, formData, { headers })
      .toPromise()
      .then((response) => response.text)
      .catch((error) => {
        console.error('Error communicating with Whisper API:', error);
        throw new Error('Failed to transcribe audio.');
      });
  }


  speechRecognitionSupported(): boolean {
    return !!this.recognition;
  }

    /**
   * Uses browser's SpeechRecognition API for transcription
   * @returns Promise with transcribed text
   */
    useBrowserRecognition(): Promise<string> {
        return new Promise((resolve, reject) => {
          if (!this.recognition) {
            reject('SpeechRecognition API is not supported in this browser.');
            return;
          }
    
          this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            resolve(transcript);
          };
    
          this.recognition.onerror = (event) => {
            reject(`SpeechRecognition error: ${event.error}`);
          };
    
          this.recognition.onend = () => {
            console.log('SpeechRecognition ended.');
          };
    
          this.recognition.start();
        });
      }
}
