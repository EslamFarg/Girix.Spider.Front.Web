import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMultiplyReceiptVoucher } from './add-multiply-receipt-voucher';

describe('AddMultiplyReceiptVoucher', () => {
  let component: AddMultiplyReceiptVoucher;
  let fixture: ComponentFixture<AddMultiplyReceiptVoucher>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMultiplyReceiptVoucher],
    }).compileComponents();

    fixture = TestBed.createComponent(AddMultiplyReceiptVoucher);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
