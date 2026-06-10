import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerDisplaySalesPrices } from './explorer-display-sales-prices';

describe('ExplorerDisplaySalesPrices', () => {
  let component: ExplorerDisplaySalesPrices;
  let fixture: ComponentFixture<ExplorerDisplaySalesPrices>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerDisplaySalesPrices],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerDisplaySalesPrices);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
