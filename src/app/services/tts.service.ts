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

@Injectable()
export class TtsService {

  static elevenLabsVoices = [
    { code: 'dIzPtf5UROMD6ykqGQTS', name: 'Bíba', gender: 'female', source: 'ElevenLabs' },
    { code: 'bXwRnJxNkyIuXGcXZU4N', name: 'Honza', gender: 'male', source: 'ElevenLabs' },
    { code: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', gender: 'female', source: 'ElevenLabs' },
    { code: '29vD33N1CtxCmqQRPOHJ', name: 'Drew', gender: 'male', source: 'ElevenLabs' },
    { code: '2EiwWnXFnvU5JabPnv8n', name: 'Clyde', gender: 'male', source: 'ElevenLabs' },
    { code: '5Q0t7uMcjvnagumLfvZi', name: 'Paul', gender: 'male', source: 'ElevenLabs' },
    { code: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', gender: 'female', source: 'ElevenLabs' },
    { code: 'CYw3kZ02Hs0563khs1Fj', name: 'Dave', gender: 'male', source: 'ElevenLabs' },
    { code: 'D38z5RcWu1voky8WS1ja', name: 'Fin', gender: 'male', source: 'ElevenLabs' },
    { code: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', gender: 'female', source: 'ElevenLabs' },
    { code: 'ErXwobaYiN019PkySvjV', name: 'Antoni', gender: 'male', source: 'ElevenLabs' },
    { code: 'GBv7mTt0atIp3Br8iCZE', name: 'Thomas', gender: 'male', source: 'ElevenLabs' },
    { code: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', gender: 'male', source: 'ElevenLabs' },
    { code: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', gender: 'male', source: 'ElevenLabs' },
    { code: 'LcfcDJNUP1GQjkzn1xUU', name: 'Emily', gender: 'female', source: 'ElevenLabs' },
    { code: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', gender: 'female', source: 'ElevenLabs' },
    { code: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum', gender: 'male', source: 'ElevenLabs' },
    { code: 'ODq5zmih8GrVes37Dizd', name: 'Patrick', gender: 'male', source: 'ElevenLabs' },
    { code: 'SOYHLrjzK2X1ezoPC6cr', name: 'Harry', gender: 'male', source: 'ElevenLabs' },
    { code: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', gender: 'male', source: 'ElevenLabs' },
    { code: 'ThT5KcBeYPX3keUQqHPh', name: 'Dorothy', gender: 'female', source: 'ElevenLabs' },
    { code: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', gender: 'male', source: 'ElevenLabs' },
    { code: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', gender: 'male', source: 'ElevenLabs' },
    { code: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', gender: 'female', source: 'ElevenLabs' },
    { code: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice', gender: 'female', source: 'ElevenLabs' },
    { code: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', gender: 'female', source: 'ElevenLabs' },
    { code: 'ZQe5CZNOzWyzPSCn5a3c', name: 'James', gender: 'male', source: 'ElevenLabs' },
    { code: 'Zlb1dXrM653N07WRdFW3', name: 'Joseph', gender: 'male', source: 'ElevenLabs' },
    { code: 'bVMeCyTHy58xNoL34h3p', name: 'Jeremy', gender: 'male', source: 'ElevenLabs' },
    { code: 'flq6f7yk4E4fJM5XTYuZ', name: 'Michael', gender: 'male', source: 'ElevenLabs' },
    { code: 'g5CIjZEefAph4nQFvHAz', name: 'Ethan', gender: 'male', source: 'ElevenLabs' },
    { code: 'iP95p4xoKVk53GoZ742B', name: 'Chris', gender: 'male', source: 'ElevenLabs' },
    { code: 'jBpfuIE2acCO8z3wKNLl', name: 'Gigi', gender: 'female', source: 'ElevenLabs' },
    { code: 'jsCqWAovK2LkecY7zXl4', name: 'Freya', gender: 'female', source: 'ElevenLabs' },
    { code: 'nPczCjzI2devNBz1zQrb', name: 'Brian', gender: 'male', source: 'ElevenLabs' },
    { code: 'oWAxZDx7w5VEj9dCyTzz', name: 'Grace', gender: 'female', source: 'ElevenLabs' },
    { code: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', gender: 'male', source: 'ElevenLabs' },
    { code: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', gender: 'female', source: 'ElevenLabs' },
    { code: 'pMsXgVXv3BLzUgSXRplE', name: 'Serena', gender: 'female', source: 'ElevenLabs' },
    { code: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', gender: 'male', source: 'ElevenLabs' },
    { code: 'piTKgcLEGmPE4e6mEKli', name: 'Nicole', gender: 'female', source: 'ElevenLabs' },
    { code: 'pqHfZKP75CvOlQylNhV4', name: 'Bill', gender: 'male', source: 'ElevenLabs' },
    { code: 't0jbNlBVZ17f02VDIeMI', name: 'Jessie', gender: 'male', source: 'ElevenLabs' },
    { code: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam', gender: 'male', source: 'ElevenLabs' },
    { code: 'z9fAnlkpzviPz146aGWa', name: 'Glinda', gender: 'female', source: 'ElevenLabs' },
    { code: 'zcAOhNBS3c14rBihAFp1', name: 'Giovanni', gender: 'male', source: 'ElevenLabs' },
    { code: 'zrHiDhphv9ZnVXBqCLjz', name: 'Mimi', gender: 'female', source: 'ElevenLabs' }
  ];

  static openAIVoices = [
    { code: 'fable', name: 'Fable', gender: 'female', source: 'OpenAI' },
    { code: 'alloy', name: 'Alloy', gender: 'female', source: 'OpenAI' },
    { code: 'echo', name: 'Echo', gender: 'male', source: 'OpenAI' },
    { code: 'onyx', name: 'Onyx', gender: 'male', source: 'OpenAI' },
    { code: 'nova', name: 'Nova', gender: 'female', source: 'OpenAI' },
    { code: 'shimmer', name: 'Shimmer', gender: 'female', source: 'OpenAI' }
  ];

  static googleVoices = [
    { code: 'cs-CZ-Wavenet-A', name: 'Google', gender: 'female', source: 'Google', language: 'cs', languageCode: 'cs-CZ' },
    { code: 'sk-SK-Wavenet-A', name: 'Google', gender: 'female', source: 'Google', language: 'sk', languageCode: 'sk-SK' },
    { code: 'es-ES-Neural2-A', name: 'Google', gender: 'female', source: 'Google', language: 'es', languageCode: 'es-ES' },
    { code: 'es-ES-Neural2-B', name: 'Google', gender: 'male', source: 'Google', language: 'es', languageCode: 'es-ES' },
    { code: 'fr-FR-Neural2-A', name: 'Google', gender: 'female', source: 'Google', language: 'fr', languageCode: 'fr-FR' },
    { code: 'fr-FR-Neural2-B', name: 'Google', gender: 'male', source: 'Google', language: 'fr', languageCode: 'fr-FR' },
    { code: 'pl-PL-Standard-A', name: 'Google', gender: 'female', source: 'Google', language: 'pl', languageCode: 'pl-PL' },
    { code: 'pl-PL-Standard-B', name: 'Google', gender: 'male', source: 'Google', language: 'pl', languageCode: 'pl-PL' },
    { code: 'it-IT-Neural2-A', name: 'Google', gender: 'female', source: 'Google', language: 'it', languageCode: 'it-IT' },
    { code: 'it-IT-Neural2-B', name: 'Google', gender: 'male', source: 'Google', language: 'it', languageCode: 'it-IT' },
    { code: 'ru-RU-Standard-A', name: 'Google', gender: 'female', source: 'Google', language: 'ru', languageCode: 'ru-RU' },
    { code: 'ru-RU-Standard-B', name: 'Google', gender: 'male', source: 'Google', language: 'ru', languageCode: 'ru-RU' },
    { code: 'uk-UA-Standard-A', name: 'Google', gender: 'female', source: 'Google', language: 'uk', languageCode: 'uk-UA' },
    { code: 'uk-UA-Wavenet-A', name: 'Google', gender: 'female', source: 'Google', language: 'uk', languageCode: 'uk-UA' },
    { code: 'pt-PT-Standard-A', name: 'Google', gender: 'female', source: 'Google', language: 'pt', languageCode: 'pt-PT' },
    { code: 'pt-PT-Standard-B', name: 'Google', gender: 'male', source: 'Google', language: 'pt', languageCode: 'pt-PT' },
    { code: 'lt-LT-Standard-A', name: 'Google', gender: 'male', source: 'Google', language: 'lt', languageCode: 'lt-LT' },
    { code: 'lv-LV-Standard-A', name: 'Google', gender: 'male', source: 'Google', language: 'lv', languageCode: 'lv-LV' },
    { code: 'de-DE-Neural2-C', name: 'Google', gender: 'female', source: 'Google', language: 'de', languageCode: 'de-DE' },
    { code: 'de-DE-Neural2-D', name: 'Google', gender: 'male', source: 'Google', language: 'de', languageCode: 'de-DE' },

    { code: 'sv-SE-Standard-C', name: 'Google', gender: 'female', source: 'Google', language: 'sv', languageCode: 'sv-SE' },
    { code: 'sv-SE-Standard-D', name: 'Google', gender: 'male', source: 'Google', language: 'sv', languageCode: 'sv-SE' },

    { code: 'hu-HU-Wavenet-A', name: 'Google', gender: 'female', source: 'Google', language: 'hu', languageCode: 'hu-HU' },

    { code: 'en-US-Neural2-C', name: 'Google (US)', gender: 'female', source: 'Google', language: 'en', languageCode: 'en-US' },
    { code: 'en-US-Neural2-D', name: 'Google (US)', gender: 'male', source: 'Google', language: 'en', languageCode: 'en-US' },
    { code: 'en-GB-Neural2-C', name: 'Google (UK)', gender: 'female', source: 'Google', language: 'en', languageCode: 'en-GB' },
    { code: 'en-GB-Neural2-D', name: 'Google (UK)', gender: 'male', source: 'Google', language: 'en', languageCode: 'en-GB' },
    { code: 'cmn-CN-Standard-C', name: 'Google', gender: 'male', source: 'Google', language: 'zh-CN', languageCode: 'cmn-CN' },
    { code: 'cmn-CN-Standard-D', name: 'Google', gender: 'female', source: 'Google', language: 'zh-CN', languageCode: 'cmn-CN' },
    { code: 'cmn-CN-Standard-C', name: 'Google', gender: 'male', source: 'Google', language: 'zh-TW', languageCode: 'cmn-CN' },
    { code: 'cmn-CN-Standard-D', name: 'Google', gender: 'female', source: 'Google', language: 'zh-TW', languageCode: 'cmn-CN' }

  ]

  static googleVoicesTest = [
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
    { code: 'en-GB-Wavenet-F', name: 'en-GB-Wavenet-F', gender: 'female', source: 'Google', language: 'en', languageCode: 'en-GB' },

    { code: 'cmn-CN-Standard-C', name: 'cmn-CN-Standard-C', gender: 'male', source: 'Google', language: 'zh', languageCode: 'cmn-CN' },
    { code: 'cmn-CN-Standard-D', name: 'cmn-CN-Standard-D', gender: 'female', source: 'Google', language: 'zh', languageCode: 'cmn-CN' },

    { code: 'cmn-CN-Standard-C', name: 'cmn-CN-Standard-C', gender: 'male', source: 'Google', language: 'zh-CN', languageCode: 'cmn-CN' },
    { code: 'cmn-CN-Standard-D', name: 'cmn-CN-Standard-D', gender: 'female', source: 'Google', language: 'zh-CN', languageCode: 'cmn-CN' },
    { code: 'cmn-CN-Standard-C', name: 'cmn-CN-Standard-C', gender: 'male', source: 'Google', language: 'zh-TW', languageCode: 'cmn-CN' },
    { code: 'cmn-CN-Standard-D', name: 'cmn-CN-Standard-D', gender: 'female', source: 'Google', language: 'zh-TW', languageCode: 'cmn-CN' }

  ]

  static googleVoicesByLanguage(voice: string): any[] {
    return TtsService.googleVoices.filter(v => v.language === voice);
  }

  primaryLanguage ='cs';

  audioConentBuffer: any;
  audioBlobBuffer: any;
  activeLanguages = [];


  isLanguageActive(lang: string): boolean {
    return this.activeLanguages.find(l => l.code === lang) !== undefined;
  }

  addActiveLanguage(lang: string) {
    if (!this.isLanguageActive(lang)) {
      this.activeLanguages.push({ code: lang, voice: TtsService.openAIVoices[0] });
    }
    this.saveActiveLanguages();
  }

  setLanguageVoice(lang: string, voice: any) {
    const langObj = this.activeLanguages.find(l => l.code === lang);
    if (langObj) {
      langObj.voice = voice;
      this.saveActiveLanguages();
    }
  }

  removeActiveLanguage(lang: string) {
    if (lang === this.primaryLanguage) {
      return;
    }
    this.activeLanguages = this.activeLanguages.filter(l => l.code !== lang);
    this.saveActiveLanguages();
  }

  setPrimaryLanguage(lang: string) {
    this.primaryLanguage = lang;
    localStorage.setItem('tts.primary_language', lang);
  }

  activeLanguagesFromStorage() {
    const active = localStorage.getItem('tts.active_languages');
    if (active) {
      this.activeLanguages = JSON.parse(active);
    } else {
      this.activeLanguages = [({ code: this.primaryLanguage, voice: TtsService.openAIVoices[0] })];
    }
  }

  saveActiveLanguages() {
    localStorage.setItem('tts.active_languages', JSON.stringify(this.activeLanguages));
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
      this.primaryLanguage = localStorage.getItem('tts.primary_language') || this.translateService.currentLang;
      this.activeLanguagesFromStorage();
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
    this.dialog.open(TtsDialogComponent, { autoFocus: false });
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
    this.audioBlobBuffer = null;
    this.audioConentBuffer = null;
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
    // this.readText(block.text);

    let nextBlock = null;
    if (this.activeBlockIndex + 1 < this.blocks.length) {
      nextBlock = this.blocks[this.activeBlockIndex + 1]
    }

    if (!this.documentLanguage) {
      this.readText(block.text, false, nextBlock ? nextBlock.text : null);
    } else {
      if (this.audioConentBuffer) {
        this.playAudioContent(this.audioConentBuffer);
      } else if (this.audioBlobBuffer) {
        this.playAudioBlob(this.audioBlobBuffer);
      } else {
        this.readText(block.text);
      }
      if (this.activeBlockIndex + 1 < this.blocks.length) {
        this.readText(this.blocks[this.activeBlockIndex + 1].text, true);
      }
    }
  }


  getReadLangFor(language: string): any {
    let lang = this.activeLanguages.find(l => l.code === language);
    if (!lang) {
      lang = this.activeLanguages.find(l => l.code === this.primaryLanguage);
    }
    return lang;
  }

  ttsVoice(language: string): any {
    return this.getReadLangFor(language).voice;

  }

  private readText(text: string, buffer: boolean = false, bufferText: string = null) {   
    if (this.documentLanguage) {
      const voice = this.ttsVoice(this.documentLanguage);
      this.tts(voice.source, text, voice, buffer);
      // if (voice.source === 'Google') {
      //   this.readTextG(text, voice, buffer);
      // } else if (voice.source === 'OpenAI') {
      //   this.readTextO(text, voice, buffer);
      // } else if (voice.source === 'ElevenLabs') {
      //   this.readTextE(text, voice, buffer);
      // }
    } else {
      const dText = text.substring(0,40);
      this.ai.detectLanguage(dText, (language, error) => {
        if (error) { this.onAiError(error); return; }
        this.documentLanguage = language;
        this.readText(text, buffer);
        if (bufferText) {
          this.readText(bufferText, true);
        }
      });
    }
  }

  private tts(provider: string, text: string, voice: any, buffer: boolean = false) {
    const readLanguage = this.getReadLangFor(this.documentLanguage).code;
    const callback = (blob, error) => {
      if (error) { this.onAiError(error); return; }
      if (buffer) {
        if (provider === 'Google') {
          this.audioConentBuffer = blob;
        } else {
          this.audioBlobBuffer = blob;
        } 
      } else {
        if (provider === 'Google') {
          this.playAudioContent(blob);
        } else {
          this.playAudioBlob(blob);
        }
      }
    };
    if (this.documentLanguage !== readLanguage) {
      this.ai.translate(text, readLanguage, (translation, error) => {
        if (error) { this.onAiError(error); return; }
        if (provider === 'Google') {
          this.ai.googleTTS(translation, voice.code, voice.languageCode, callback);
        } else if (provider === 'OpenAI') {
          this.ai.openAiTTS(translation, voice.code, callback);
        } else if (provider === 'ElevenLabs') {
          this.ai.elevenLabsTTS(translation, voice.code, callback);
        }
      });
    } else {
      if (provider === 'Google') {
          this.ai.googleTTS(text, voice.code, voice.languageCode, callback);
        } else if (provider === 'OpenAI') {
          this.ai.openAiTTS(text, voice.code, callback);
        } else if (provider === 'ElevenLabs') {
          this.ai.elevenLabsTTS(text, voice.code, callback);
        }
    }
  }

  stopTestTTS() {
    this.finish(true)
  }

  testTTS(voice: any, text: string, loaded: () => void, ended: () => void) {
    this.stopTestTTS();
    if (voice.source === 'Google') {
      this.ai.googleTTS(text, voice.code, voice.languageCode, (audioContent, error) => {
        this.playAudioContent(audioContent, ended);
        loaded();
      });
    } else if (voice.source === 'OpenAI') {
      this.ai.openAiTTS(text, voice.code, (blob, error) => {
        this.playAudioBlob(blob, ended);
        loaded();
      });
    } else if (voice.source === 'ElevenLabs') {
      this.ai.elevenLabsTTS(text, voice.code, (blob, error) => {
        this.playAudioBlob(blob, ended);
        loaded();
      });
    }
  }

  private onAiError(error: string) {
    this.onError(error);
    this.finish(true);
  }


  private playAudioBlob(blob, onEnd: () => void = null){
    this.state = 'speaking'
    const audioUrl = URL.createObjectURL(blob);
    this.audio = new Audio(audioUrl);
    this.audio.onended = (event) => {
      this.state = 'loading';
      this.next();
      if (onEnd) {
        onEnd();
      }
    };
    // this.audio.stop();
    if (!this.userPaused) {
      this.audio.play();
    }
  }


  private playAudioContent(audioContent: string, onEnd: () => void = null){
    this.state = 'speaking'
    const audioData = this.base64ToUint8Array(audioContent);
    const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(audioBlob);
    this.audio = new Audio(audioUrl);
    this.audio.onended = (event) => {
      this.state = 'loading';
      this.next();
      if (onEnd) {
        onEnd();
      }
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
