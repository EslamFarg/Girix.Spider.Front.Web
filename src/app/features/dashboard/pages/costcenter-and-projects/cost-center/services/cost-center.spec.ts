import { TestBed } from '@angular/core/testing';

import { CostCenter } from './cost-center';

describe('CostCenter', () => {
  let service: CostCenter;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CostCenter);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
