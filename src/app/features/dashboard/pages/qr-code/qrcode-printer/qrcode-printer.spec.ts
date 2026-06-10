import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrcodePrinter } from './qrcode-printer';

describe('QrcodePrinter', () => {
  let component: QrcodePrinter;
  let fixture: ComponentFixture<QrcodePrinter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QrcodePrinter],
    }).compileComponents();

    fixture = TestBed.createComponent(QrcodePrinter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
