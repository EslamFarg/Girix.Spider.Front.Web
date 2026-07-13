import { TestBed } from '@angular/core/testing';

import { ExchangeOfSalariesService } from './exchange-of-salaries-service';

describe('ExchangeOfSalariesService', () => {
  let service: ExchangeOfSalariesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExchangeOfSalariesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
