import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerReceiptVoucher } from './explorer-receipt-voucher';

describe('ExplorerReceiptVoucher', () => {
  let component: ExplorerReceiptVoucher;
  let fixture: ComponentFixture<ExplorerReceiptVoucher>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerReceiptVoucher],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerReceiptVoucher);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
