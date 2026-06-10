import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddReceiptVoucher } from './add-receipt-voucher';

describe('AddReceiptVoucher', () => {
  let component: AddReceiptVoucher;
  let fixture: ComponentFixture<AddReceiptVoucher>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddReceiptVoucher],
    }).compileComponents();

    fixture = TestBed.createComponent(AddReceiptVoucher);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
