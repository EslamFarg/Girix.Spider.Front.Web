import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPaymentVoucher } from './add-payment-voucher';

describe('AddPaymentVoucher', () => {
  let component: AddPaymentVoucher;
  let fixture: ComponentFixture<AddPaymentVoucher>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPaymentVoucher],
    }).compileComponents();

    fixture = TestBed.createComponent(AddPaymentVoucher);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
