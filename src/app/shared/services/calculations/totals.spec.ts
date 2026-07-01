import { TestBed } from '@angular/core/testing';

import { Totals } from './totals';

describe('Totals', () => {
  let service: Totals;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Totals);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
