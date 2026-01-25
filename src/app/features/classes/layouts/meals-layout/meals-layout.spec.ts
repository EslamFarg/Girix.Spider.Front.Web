import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MealsLayout } from './meals-layout';

describe('MealsLayout', () => {
  let component: MealsLayout;
  let fixture: ComponentFixture<MealsLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealsLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MealsLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
