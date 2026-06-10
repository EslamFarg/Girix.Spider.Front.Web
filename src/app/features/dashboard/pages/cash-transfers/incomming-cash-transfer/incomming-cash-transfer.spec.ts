import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncommingCashTransfer } from './incomming-cash-transfer';

describe('IncommingCashTransfer', () => {
  let component: IncommingCashTransfer;
  let fixture: ComponentFixture<IncommingCashTransfer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncommingCashTransfer],
    }).compileComponents();

    fixture = TestBed.createComponent(IncommingCashTransfer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
