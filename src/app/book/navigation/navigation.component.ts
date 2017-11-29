import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {
  @Input() children;
  @Output() itemSelected = new EventEmitter();
  container;

  constructor() { }

  ngOnInit() {
    this.container = document.getElementById('app-navigation-container');
  }

  public onItemClicked(item) {
    this.itemSelected.emit(item);
  }

}
