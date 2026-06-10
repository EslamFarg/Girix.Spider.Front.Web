import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiplyPurchaseReturns } from './multiply-purchase-returns';

describe('MultiplyPurchaseReturns', () => {
  let component: MultiplyPurchaseReturns;
  let fixture: ComponentFixture<MultiplyPurchaseReturns>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiplyPurchaseReturns],
    }).compileComponents();

    fixture = TestBed.createComponent(MultiplyPurchaseReturns);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
