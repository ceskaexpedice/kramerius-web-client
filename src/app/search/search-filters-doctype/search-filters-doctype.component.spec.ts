import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchFiltersDoctypeComponent } from './search-filters-doctype.component';

describe('SearchFiltersDoctypeComponent', () => {
  let component: SearchFiltersDoctypeComponent;
  let fixture: ComponentFixture<SearchFiltersDoctypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchFiltersDoctypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchFiltersDoctypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
