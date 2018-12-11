import { Pipe, PipeTransform} from '@angular/core';


@Pipe({
  name: 'appRemovePrefix'
})
export class RemovePrefixPipe implements PipeTransform {

  transform(text: string, prefix: string) {
    if (text.startsWith(prefix)) {
      return text.substring(prefix.length);
    }
    return text;
  }
}
