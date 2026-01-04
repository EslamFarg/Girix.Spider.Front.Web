import { TestBed } from '@angular/core/testing';

import { HutService } from './hut-service';

describe('HutService', () => {
  let service: HutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
