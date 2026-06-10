import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCashTransferBetweenTwoBranches } from './add-cash-transfer-between-two-branches';

describe('AddCashTransferBetweenTwoBranches', () => {
  let component: AddCashTransferBetweenTwoBranches;
  let fixture: ComponentFixture<AddCashTransferBetweenTwoBranches>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCashTransferBetweenTwoBranches],
    }).compileComponents();

    fixture = TestBed.createComponent(AddCashTransferBetweenTwoBranches);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
