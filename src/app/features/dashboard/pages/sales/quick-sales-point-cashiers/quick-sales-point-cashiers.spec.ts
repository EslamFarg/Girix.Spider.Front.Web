import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickSalesPointCashiers } from './quick-sales-point-cashiers';

describe('QuickSalesPointCashiers', () => {
  let component: QuickSalesPointCashiers;
  let fixture: ComponentFixture<QuickSalesPointCashiers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickSalesPointCashiers],
    }).compileComponents();

    fixture = TestBed.createComponent(QuickSalesPointCashiers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
