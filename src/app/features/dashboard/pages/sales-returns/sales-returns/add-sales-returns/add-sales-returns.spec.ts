import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSalesReturns } from './add-sales-returns';

describe('AddSalesReturns', () => {
  let component: AddSalesReturns;
  let fixture: ComponentFixture<AddSalesReturns>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSalesReturns],
    }).compileComponents();

    fixture = TestBed.createComponent(AddSalesReturns);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
