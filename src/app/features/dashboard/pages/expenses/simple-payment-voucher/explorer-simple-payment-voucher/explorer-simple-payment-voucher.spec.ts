import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerSimplePaymentVoucher } from './explorer-simple-payment-voucher';

describe('ExplorerSimplePaymentVoucher', () => {
  let component: ExplorerSimplePaymentVoucher;
  let fixture: ComponentFixture<ExplorerSimplePaymentVoucher>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerSimplePaymentVoucher],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerSimplePaymentVoucher);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
