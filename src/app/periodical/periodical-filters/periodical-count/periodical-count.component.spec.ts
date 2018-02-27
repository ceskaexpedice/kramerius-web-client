import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodicalCountComponent } from './periodical-count.component';

describe('PeriodicalCountComponent', () => {
  let component: PeriodicalCountComponent;
  let fixture: ComponentFixture<PeriodicalCountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PeriodicalCountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeriodicalCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
