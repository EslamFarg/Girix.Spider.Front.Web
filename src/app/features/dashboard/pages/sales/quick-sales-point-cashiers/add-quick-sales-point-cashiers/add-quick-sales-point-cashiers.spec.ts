import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddQuickSalesPointCashiers } from './add-quick-sales-point-cashiers';

describe('AddQuickSalesPointCashiers', () => {
  let component: AddQuickSalesPointCashiers;
  let fixture: ComponentFixture<AddQuickSalesPointCashiers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddQuickSalesPointCashiers],
    }).compileComponents();

    fixture = TestBed.createComponent(AddQuickSalesPointCashiers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
