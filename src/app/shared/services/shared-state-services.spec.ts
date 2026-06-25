import { TestBed } from '@angular/core/testing';

import { SharedStateServices } from './shared-state-services';

describe('SharedStateServices', () => {
  let service: SharedStateServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedStateServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
