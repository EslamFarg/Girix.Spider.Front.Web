import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSupplyOrder } from './add-supply-order';

describe('AddSupplyOrder', () => {
  let component: AddSupplyOrder;
  let fixture: ComponentFixture<AddSupplyOrder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSupplyOrder],
    }).compileComponents();

    fixture = TestBed.createComponent(AddSupplyOrder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
