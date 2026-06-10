import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MutliplyPaymentVoucher } from './mutliply-payment-voucher';

describe('MutliplyPaymentVoucher', () => {
  let component: MutliplyPaymentVoucher;
  let fixture: ComponentFixture<MutliplyPaymentVoucher>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MutliplyPaymentVoucher],
    }).compileComponents();

    fixture = TestBed.createComponent(MutliplyPaymentVoucher);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
