import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodicalFiltersComponent } from './periodical-filters.component';

describe('PeriodicalFiltersComponent', () => {
  let component: PeriodicalFiltersComponent;
  let fixture: ComponentFixture<PeriodicalFiltersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PeriodicalFiltersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeriodicalFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
