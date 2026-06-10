import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostCenter } from './cost-center';

describe('CostCenter', () => {
  let component: CostCenter;
  let fixture: ComponentFixture<CostCenter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CostCenter],
    }).compileComponents();

    fixture = TestBed.createComponent(CostCenter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
