import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseSearchComponent } from './browse-search.component';

describe('BrowseSearchComponent', () => {
  let component: BrowseSearchComponent;
  let fixture: ComponentFixture<BrowseSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrowseSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowseSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
