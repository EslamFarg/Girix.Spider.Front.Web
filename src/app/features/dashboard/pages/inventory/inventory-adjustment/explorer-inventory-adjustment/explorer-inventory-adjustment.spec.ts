import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerInventoryAdjustment } from './explorer-inventory-adjustment';

describe('ExplorerInventoryAdjustment', () => {
  let component: ExplorerInventoryAdjustment;
  let fixture: ComponentFixture<ExplorerInventoryAdjustment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerInventoryAdjustment],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerInventoryAdjustment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
