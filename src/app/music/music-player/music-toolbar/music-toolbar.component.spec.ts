import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MusicToolbarComponent } from './music-toolbar.component';

describe('MusicToolbarComponent', () => {
  let component: MusicToolbarComponent;
  let fixture: ComponentFixture<MusicToolbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MusicToolbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MusicToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
