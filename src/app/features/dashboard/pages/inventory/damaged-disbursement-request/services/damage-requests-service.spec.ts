import { TestBed } from '@angular/core/testing';

import { DamageRequestsService } from './damage-requests-service';

describe('DamageRequestsService', () => {
  let service: DamageRequestsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DamageRequestsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
