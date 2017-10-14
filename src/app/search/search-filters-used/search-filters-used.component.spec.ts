import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchFiltersUsedComponent } from './search-filters-used.component';

describe('SearchFiltersUsedComponent', () => {
  let component: SearchFiltersUsedComponent;
  let fixture: ComponentFixture<SearchFiltersUsedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchFiltersUsedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchFiltersUsedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
