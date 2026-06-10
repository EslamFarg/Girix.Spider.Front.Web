import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplaySalesPrices } from './display-sales-prices';

describe('DisplaySalesPrices', () => {
  let component: DisplaySalesPrices;
  let fixture: ComponentFixture<DisplaySalesPrices>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisplaySalesPrices],
    }).compileComponents();

    fixture = TestBed.createComponent(DisplaySalesPrices);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
