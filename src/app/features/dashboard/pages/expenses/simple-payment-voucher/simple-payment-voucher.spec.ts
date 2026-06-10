import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimplePaymentVoucher } from './simple-payment-voucher';

describe('SimplePaymentVoucher', () => {
  let component: SimplePaymentVoucher;
  let fixture: ComponentFixture<SimplePaymentVoucher>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimplePaymentVoucher],
    }).compileComponents();

    fixture = TestBed.createComponent(SimplePaymentVoucher);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
