import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerMultiplyPaymentVoucher } from './explorer-multiply-payment-voucher';

describe('ExplorerMultiplyPaymentVoucher', () => {
  let component: ExplorerMultiplyPaymentVoucher;
  let fixture: ComponentFixture<ExplorerMultiplyPaymentVoucher>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerMultiplyPaymentVoucher],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerMultiplyPaymentVoucher);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
