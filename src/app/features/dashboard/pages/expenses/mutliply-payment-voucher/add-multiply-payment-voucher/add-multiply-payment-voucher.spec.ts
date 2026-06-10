import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMultiplyPaymentVoucher } from './add-multiply-payment-voucher';

describe('AddMultiplyPaymentVoucher', () => {
  let component: AddMultiplyPaymentVoucher;
  let fixture: ComponentFixture<AddMultiplyPaymentVoucher>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMultiplyPaymentVoucher],
    }).compileComponents();

    fixture = TestBed.createComponent(AddMultiplyPaymentVoucher);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
