import { TestBed } from '@angular/core/testing';

import { CustodyReceiptService } from './custody-receipt-service';

describe('CustodyReceiptService', () => {
  let service: CustodyReceiptService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustodyReceiptService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
