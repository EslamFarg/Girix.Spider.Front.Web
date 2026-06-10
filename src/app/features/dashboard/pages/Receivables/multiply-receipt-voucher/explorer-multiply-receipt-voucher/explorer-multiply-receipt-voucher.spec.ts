import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerMultiplyReceiptVoucher } from './explorer-multiply-receipt-voucher';

describe('ExplorerMultiplyReceiptVoucher', () => {
  let component: ExplorerMultiplyReceiptVoucher;
  let fixture: ComponentFixture<ExplorerMultiplyReceiptVoucher>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerMultiplyReceiptVoucher],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerMultiplyReceiptVoucher);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
