import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDisplaySalesPrices } from './add-display-sales-prices';

describe('AddDisplaySalesPrices', () => {
  let component: AddDisplaySalesPrices;
  let fixture: ComponentFixture<AddDisplaySalesPrices>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDisplaySalesPrices],
    }).compileComponents();

    fixture = TestBed.createComponent(AddDisplaySalesPrices);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
