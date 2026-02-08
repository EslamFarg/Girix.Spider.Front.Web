import { TestBed } from '@angular/core/testing';

import { FinancialSettingsService } from './financial-settings-service';

describe('FinancialSettingsService', () => {
  let service: FinancialSettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FinancialSettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
