import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitsOfMeasurement } from './units-of-measurement';

describe('UnitsOfMeasurement', () => {
  let component: UnitsOfMeasurement;
  let fixture: ComponentFixture<UnitsOfMeasurement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitsOfMeasurement],
    }).compileComponents();

    fixture = TestBed.createComponent(UnitsOfMeasurement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
