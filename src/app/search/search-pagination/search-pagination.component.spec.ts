import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchPaginationComponent } from './search-pagination.component';

describe('SearchPaginationComponent', () => {
  let component: SearchPaginationComponent;
  let fixture: ComponentFixture<SearchPaginationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchPaginationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchPaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
