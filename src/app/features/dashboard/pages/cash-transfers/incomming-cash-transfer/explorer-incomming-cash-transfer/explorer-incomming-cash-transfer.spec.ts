import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerIncommingCashTransfer } from './explorer-incomming-cash-transfer';

describe('ExplorerIncommingCashTransfer', () => {
  let component: ExplorerIncommingCashTransfer;
  let fixture: ComponentFixture<ExplorerIncommingCashTransfer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerIncommingCashTransfer],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerIncommingCashTransfer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
