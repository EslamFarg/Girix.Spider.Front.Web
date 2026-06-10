import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSimplePaymentVoucher } from './add-simple-payment-voucher';

describe('AddSimplePaymentVoucher', () => {
  let component: AddSimplePaymentVoucher;
  let fixture: ComponentFixture<AddSimplePaymentVoucher>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSimplePaymentVoucher],
    }).compileComponents();

    fixture = TestBed.createComponent(AddSimplePaymentVoucher);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
