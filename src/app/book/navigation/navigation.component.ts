import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {
  @Input() children;
  @Output() itemSelected = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  public onItemClicked(item) {
    this.itemSelected.emit(item);
  }

}
