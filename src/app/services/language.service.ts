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

  private summary = {
    "cs": "Shrnutí",
    "en": "Summary",
    "de": "Zusammenfassung",
    "sk": "Zhrnutie",
    "sl": "Povzetek",
    "pl": "Streszczenie",
    "es": "Resumen",
    "fr": "Résumé",
    "it": "Riassunto",
    "ru": "Резюме",
    "uk": "Резюме",
    "pt": "Resumo",
    "lt": "Santrauka",
    "lv": "Kopsavilkums",
    "et": "Kokkuvõte",
    "sv": "Sammanfattning",
    "hu": "Összefoglaló",
    "zh-CN": "摘要",
    "zh-TW": "摘要"
  }

  private summaryPromt = {
    "cs": "Sumarizuj v odrážkách zadaný text",
    "en": "Summarize the entered text in bullet points",
    "de": "Fassen Sie den eingegebenen Text in Stichpunkten zusammen",
    "sk": "Zhrňte zadaný text do bodov",
    "sl": "Povzeti vneseno besedilo v oznake",
    "pl": "Podsumuj wprowadzony tekst w punktach",
    "es": "Resuma el texto introducido en viñetas",
    "fr": "Résumez le texte saisi en points",
    "it": "Sintetizza il testo inserito in punti",
    "ru": "Суммируйте введенный текст в пунктах",
    "uk": "Сумуйте введений текст в пунктах",
    "pt": "Resuma o texto inserido em marcadores",
    "lt": "Suvesti įvestą tekstą taškuose",
    "lv": "Summējiet ievadīto tekstu punktos",
    "et": "Summeerige sisestatud tekst punktides",  
    "sv": "Sammanfatta den inmatade texten i punkter",
    "hu": "Összefoglalja a beírt szöveget pontokban",
    "zh-CN": "用项目符号总结输入的文本",
    "zh-TW": "用項目符號總結輸入的文本"
  }

  constructor() {
  }

  getLanguageName(lang: string): string {
    return this.names[lang] || lang;
  }

  getSummary(lang: string): string {
    return this.summary[lang] || lang;
  }

  getSummaryPrompt(lang: string): string {
    return this.summaryPromt[lang] || lang;
  }

}
