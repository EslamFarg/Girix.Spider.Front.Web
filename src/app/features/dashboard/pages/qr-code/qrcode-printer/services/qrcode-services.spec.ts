import { TestBed } from '@angular/core/testing';

import { QrcodeServices } from './qrcode-services';

describe('QrcodeServices', () => {
  let service: QrcodeServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QrcodeServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
