import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMultiplyPurchaseReturns } from './add-multiply-purchase-returns';

describe('AddMultiplyPurchaseReturns', () => {
  let component: AddMultiplyPurchaseReturns;
  let fixture: ComponentFixture<AddMultiplyPurchaseReturns>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMultiplyPurchaseReturns],
    }).compileComponents();

    fixture = TestBed.createComponent(AddMultiplyPurchaseReturns);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
