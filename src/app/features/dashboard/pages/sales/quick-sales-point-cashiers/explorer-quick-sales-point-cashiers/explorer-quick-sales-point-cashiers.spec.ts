import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerQuickSalesPointCashiers } from './explorer-quick-sales-point-cashiers';

describe('ExplorerQuickSalesPointCashiers', () => {
  let component: ExplorerQuickSalesPointCashiers;
  let fixture: ComponentFixture<ExplorerQuickSalesPointCashiers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerQuickSalesPointCashiers],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerQuickSalesPointCashiers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
