import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerMultiplySalesReturns } from './explorer-multiply-sales-returns';

describe('ExplorerMultiplySalesReturns', () => {
  let component: ExplorerMultiplySalesReturns;
  let fixture: ComponentFixture<ExplorerMultiplySalesReturns>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerMultiplySalesReturns],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerMultiplySalesReturns);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
