import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerCashTransferBetweenTwoBranches } from './explorer-cash-transfer-between-two-branches';

describe('ExplorerCashTransferBetweenTwoBranches', () => {
  let component: ExplorerCashTransferBetweenTwoBranches;
  let fixture: ComponentFixture<ExplorerCashTransferBetweenTwoBranches>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerCashTransferBetweenTwoBranches],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerCashTransferBetweenTwoBranches);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
