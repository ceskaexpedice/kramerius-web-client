import { Component, OnInit, EventEmitter } from '@angular/core';
import { Input, Output } from '@angular/core';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss']
})
export class PaginatorComponent implements OnInit {
  @Input() activeIndex: number;
  @Input() overallCount: number;
  @Input() step: number;

  @Output() next = new EventEmitter();
  @Output() previous = new EventEmitter();
  @Output() change = new EventEmitter<number>();

  constructor() {
  }

  ngOnInit() {
  }

  onNext() {
    if (this.hasNext()) {
      this.next.emit();
    }
  }

  onPrevious() {
    if (this.hasPrevious()) {
      this.previous.emit();
    }
  }

  onIndex(index: number) {
    this.change.emit(index);
  }

  isActive(index: number): boolean {
    return this.activeIndex === index;
  }

  numberOfPages() {
    return Math.ceil(this.overallCount / this.step);
  }

  pages() {
    const numberOfPages = this.numberOfPages();
    const page = this.activeIndex;
    const pages = [];
    pages.push(1);
    for (let i = page - 5; i <= page + 5; i++) {
      if (i > 1 && i <= numberOfPages) {
        pages.push(i);
      }
    }
    if (numberOfPages > page + 5) {
      pages.push(numberOfPages);
    }
    return pages;
  }

  hasNext() {
    const numberOfPages = this.numberOfPages();
    const page = this.activeIndex;
    return page < numberOfPages;
  }

  hasPrevious() {
    const page = this.activeIndex;
    return page > 1;
  }

}
