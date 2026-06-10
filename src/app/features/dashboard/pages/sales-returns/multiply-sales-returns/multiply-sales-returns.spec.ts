import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiplySalesReturns } from './multiply-sales-returns';

describe('MultiplySalesReturns', () => {
  let component: MultiplySalesReturns;
  let fixture: ComponentFixture<MultiplySalesReturns>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiplySalesReturns],
    }).compileComponents();

    fixture = TestBed.createComponent(MultiplySalesReturns);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
