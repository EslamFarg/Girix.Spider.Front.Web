import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditMeal } from './edit-meal';

describe('EditMeal', () => {
  let component: EditMeal;
  let fixture: ComponentFixture<EditMeal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditMeal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditMeal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
