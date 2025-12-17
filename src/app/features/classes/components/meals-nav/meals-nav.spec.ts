import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MealsNav } from './meals-nav';

describe('MealsNav', () => {
  let component: MealsNav;
  let fixture: ComponentFixture<MealsNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealsNav]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MealsNav);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
