import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiplyReceiptVoucher } from './multiply-receipt-voucher';

describe('MultiplyReceiptVoucher', () => {
  let component: MultiplyReceiptVoucher;
  let fixture: ComponentFixture<MultiplyReceiptVoucher>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiplyReceiptVoucher],
    }).compileComponents();

    fixture = TestBed.createComponent(MultiplyReceiptVoucher);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
