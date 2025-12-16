import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMeal } from './view-meal';

describe('ViewMeal', () => {
  let component: ViewMeal;
  let fixture: ComponentFixture<ViewMeal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewMeal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewMeal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
