import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchCountComponent } from './search-count.component';

describe('SearchCountComponent', () => {
  let component: SearchCountComponent;
  let fixture: ComponentFixture<SearchCountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchCountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
