import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMultiplySalesReturns } from './add-multiply-sales-returns';

describe('AddMultiplySalesReturns', () => {
  let component: AddMultiplySalesReturns;
  let fixture: ComponentFixture<AddMultiplySalesReturns>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMultiplySalesReturns],
    }).compileComponents();

    fixture = TestBed.createComponent(AddMultiplySalesReturns);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
