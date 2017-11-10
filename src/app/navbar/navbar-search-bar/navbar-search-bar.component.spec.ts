import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarSearchBarComponent } from './navbar-search-bar.component';

describe('NavbarSearchBarComponent', () => {
  let component: NavbarSearchBarComponent;
  let fixture: ComponentFixture<NavbarSearchBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NavbarSearchBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarSearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
