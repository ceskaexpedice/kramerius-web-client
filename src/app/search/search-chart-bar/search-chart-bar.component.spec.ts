import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchChartBarComponent } from './search-chart-bar.component';

describe('SearchChartBarComponent', () => {
  let component: SearchChartBarComponent;
  let fixture: ComponentFixture<SearchChartBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchChartBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchChartBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
