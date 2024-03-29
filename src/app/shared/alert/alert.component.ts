import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit {
  
  @Input() type;
  @Input() label;
  @Input() message;

  constructor() { }

  ngOnInit() {
  }

}
