import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryQuickSalesPointCashiers } from './query-quick-sales-point-cashiers';

describe('QueryQuickSalesPointCashiers', () => {
  let component: QueryQuickSalesPointCashiers;
  let fixture: ComponentFixture<QueryQuickSalesPointCashiers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QueryQuickSalesPointCashiers],
    }).compileComponents();

    fixture = TestBed.createComponent(QueryQuickSalesPointCashiers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
