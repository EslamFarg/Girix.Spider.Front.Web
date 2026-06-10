import { TestBed } from '@angular/core/testing';

import { BasehttpService } from './basehttp-service';

describe('BasehttpService', () => {
  let service: BasehttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BasehttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
