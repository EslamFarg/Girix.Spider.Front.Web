import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerPaymentVoucher } from './explorer-payment-voucher';

describe('ExplorerPaymentVoucher', () => {
  let component: ExplorerPaymentVoucher;
  let fixture: ComponentFixture<ExplorerPaymentVoucher>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerPaymentVoucher],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerPaymentVoucher);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
