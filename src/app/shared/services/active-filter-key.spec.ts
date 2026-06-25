import { TestBed } from '@angular/core/testing';

import { ActiveFilterKey } from './active-filter-key';

describe('ActiveFilterKey', () => {
  let service: ActiveFilterKey;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActiveFilterKey);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
