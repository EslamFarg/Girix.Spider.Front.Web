import { TestBed } from '@angular/core/testing';

import { Replacements } from './replacements';

describe('Replacements', () => {
  let service: Replacements;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Replacements);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
