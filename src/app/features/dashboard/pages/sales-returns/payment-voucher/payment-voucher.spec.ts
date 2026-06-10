import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentVoucher } from './payment-voucher';

describe('PaymentVoucher', () => {
  let component: PaymentVoucher;
  let fixture: ComponentFixture<PaymentVoucher>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentVoucher],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentVoucher);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
