import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerSalesReturns } from './explorer-sales-returns';

describe('ExplorerSalesReturns', () => {
  let component: ExplorerSalesReturns;
  let fixture: ComponentFixture<ExplorerSalesReturns>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerSalesReturns],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerSalesReturns);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
