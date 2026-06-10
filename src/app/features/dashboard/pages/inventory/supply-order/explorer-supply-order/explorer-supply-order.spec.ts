import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerSupplyOrder } from './explorer-supply-order';

describe('ExplorerSupplyOrder', () => {
  let component: ExplorerSupplyOrder;
  let fixture: ComponentFixture<ExplorerSupplyOrder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerSupplyOrder],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerSupplyOrder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
