import { TestBed } from '@angular/core/testing';

import { PayrollAdjustmentService } from './payroll-adjustment-service';

describe('PayrollAdjustmentService', () => {
  let service: PayrollAdjustmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PayrollAdjustmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
