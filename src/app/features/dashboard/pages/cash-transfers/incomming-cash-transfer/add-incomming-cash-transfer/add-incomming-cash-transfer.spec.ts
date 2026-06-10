import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddIncommingCashTransfer } from './add-incomming-cash-transfer';

describe('AddIncommingCashTransfer', () => {
  let component: AddIncommingCashTransfer;
  let fixture: ComponentFixture<AddIncommingCashTransfer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddIncommingCashTransfer],
    }).compileComponents();

    fixture = TestBed.createComponent(AddIncommingCashTransfer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
