import { TestBed } from '@angular/core/testing';

import { Allowances } from './allowances';

describe('Allowances', () => {
  let service: Allowances;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Allowances);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
