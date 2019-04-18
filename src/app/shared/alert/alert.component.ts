import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html'
})
export class AlertComponent implements OnInit {
  @Input() type;
  @Input() label;
  @Input() message;
  @Input() description;
  @Input() html;

  constructor() { }

  ngOnInit() {
  }

  getIcon() {
    if (this.type === 'warning') {
      return 'alert';
    } else if (this.type === 'danger') {
      return 'alert-circle';
    } else if (this.type === 'info') {
      return 'information';
    } else if (this.type === 'success') {
      return 'check';
    }
  }

}
