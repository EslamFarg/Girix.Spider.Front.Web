import { TestBed } from '@angular/core/testing';

import { CustodyService } from './custody-service';

describe('CustodyService', () => {
  let service: CustodyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustodyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
