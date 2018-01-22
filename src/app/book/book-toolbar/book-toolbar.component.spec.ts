import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BookToolbarComponent } from './book-toolbar.component';

describe('BookToolbarComponent', () => {
  let component: BookToolbarComponent;
  let fixture: ComponentFixture<BookToolbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BookToolbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
