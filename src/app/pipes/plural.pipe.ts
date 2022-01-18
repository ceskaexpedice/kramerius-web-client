import { Pipe, PipeTransform} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'appPlural'
})
export class PluralPipe implements PipeTransform {

  constructor(private translate: TranslateService){}

  transform(text: string, number: number) {
    if (number == 1) {
      return this.translate.instant(text + '.one');
    } else if (number < 5) {
      return this.translate.instant(text + '.few');
    } else {
      return this.translate.instant(text + '.many');
    }
  }
}
