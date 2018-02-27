import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodicalSearchComponent } from './periodical-search.component';

describe('PeriodicalSearchComponent', () => {
  let component: PeriodicalSearchComponent;
  let fixture: ComponentFixture<PeriodicalSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PeriodicalSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeriodicalSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
