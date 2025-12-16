import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MealForm } from './meal-form';

describe('MealForm', () => {
  let component: MealForm;
  let fixture: ComponentFixture<MealForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MealForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
