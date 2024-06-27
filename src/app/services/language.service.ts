import { Injectable } from '@angular/core';

@Injectable()
export class LanguageService {

  private names = {
    "cs": "Čeština",
    "en": "English",
    "de": "Deutsch",
    "sk": "Slovenčina",
    "sl": "Slovenščina",
    "pl": "Polski",
    "es": "Español",
    "fr": "Français",
    "it": "Italiano",
    "ru": "Русский",
    "uk": "Українська",
    "pt": "Português",
    "lt": "Lietuvių",
    "lv": "Latviešu",
    "et": "Eesti keel",
    "sv": "Svenska",
    "hu": "Magyar",
    "zh-CN": "中文",
    "zh-TW": "繁體中文",
    "xx": "-"
  };

  constructor() {
  }

  getLanguageName(lang: string): string {
    return this.names[lang] || lang;
  }

}
