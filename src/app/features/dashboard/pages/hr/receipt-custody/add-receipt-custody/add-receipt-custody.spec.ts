import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddReceiptCustody } from './add-receipt-custody';

describe('AddReceiptCustody', () => {
  let component: AddReceiptCustody;
  let fixture: ComponentFixture<AddReceiptCustody>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddReceiptCustody],
    }).compileComponents();

    fixture = TestBed.createComponent(AddReceiptCustody);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
