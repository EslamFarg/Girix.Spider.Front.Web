import { TestBed } from '@angular/core/testing';

import { ReceiptVoucherService } from './receipt-voucher-service';

describe('ReceiptVoucherService', () => {
  let service: ReceiptVoucherService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReceiptVoucherService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
