import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashTransferBetweenTwoBranches } from './cash-transfer-between-two-branches';

describe('CashTransferBetweenTwoBranches', () => {
  let component: CashTransferBetweenTwoBranches;
  let fixture: ComponentFixture<CashTransferBetweenTwoBranches>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashTransferBetweenTwoBranches],
    }).compileComponents();

    fixture = TestBed.createComponent(CashTransferBetweenTwoBranches);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
