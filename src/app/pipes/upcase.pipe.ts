import { Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'appUpcase'
})
export class UpcasePipe implements PipeTransform {

  transform(text: string, prefix: string) {
    if (text && text.length > 0) {
      return text[0].toUpperCase() + text.substring(1);
    }
    return text;
  }
}
