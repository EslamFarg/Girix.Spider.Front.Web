import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiptCustody } from './receipt-custody';

describe('ReceiptCustody', () => {
  let component: ReceiptCustody;
  let fixture: ComponentFixture<ReceiptCustody>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceiptCustody],
    }).compileComponents();

    fixture = TestBed.createComponent(ReceiptCustody);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
