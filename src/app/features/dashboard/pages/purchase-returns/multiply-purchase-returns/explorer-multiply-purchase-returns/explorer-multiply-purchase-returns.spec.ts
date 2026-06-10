import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerMultiplyPurchaseReturns } from './explorer-multiply-purchase-returns';

describe('ExplorerMultiplyPurchaseReturns', () => {
  let component: ExplorerMultiplyPurchaseReturns;
  let fixture: ComponentFixture<ExplorerMultiplyPurchaseReturns>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerMultiplyPurchaseReturns],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerMultiplyPurchaseReturns);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
