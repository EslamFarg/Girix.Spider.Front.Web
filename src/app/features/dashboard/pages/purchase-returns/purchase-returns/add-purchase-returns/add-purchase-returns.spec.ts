import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPurchaseReturns } from './add-purchase-returns';

describe('AddPurchaseReturns', () => {
  let component: AddPurchaseReturns;
  let fixture: ComponentFixture<AddPurchaseReturns>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPurchaseReturns],
    }).compileComponents();

    fixture = TestBed.createComponent(AddPurchaseReturns);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
