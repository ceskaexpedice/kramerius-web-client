import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class UiService {

  constructor(private snackBar: MatSnackBar, private translate: TranslateService) {
  }

  showSuccess(messageId: string, position: any = 'bottom', duration: number = 2000) {
    const message = <string> this.translate.instant(messageId);
    this.showStringSuccess(message, position, duration);
  }

  showStringSuccess(message: string, position: any = 'bottom', duration: number = 2000) {
    this.snackBar.open(
      message, 
      '', 
      { 
        duration: duration, 
        verticalPosition: position, 
        panelClass: ['app-snackbar-custom']
      }
    );
  }
}
