import { TestBed } from '@angular/core/testing';

import { ReplacementsService } from './replacements-service';

describe('ReplacementsService', () => {
  let service: ReplacementsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReplacementsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
