import { TestBed } from '@angular/core/testing';

import { UnitOfMeasure } from './unit-of-measure';

describe('UnitOfMeasure', () => {
  let service: UnitOfMeasure;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnitOfMeasure);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
