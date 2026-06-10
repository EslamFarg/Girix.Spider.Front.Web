import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddQrcodePrinter } from './add-qrcode-printer';

describe('AddQrcodePrinter', () => {
  let component: AddQrcodePrinter;
  let fixture: ComponentFixture<AddQrcodePrinter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddQrcodePrinter],
    }).compileComponents();

    fixture = TestBed.createComponent(AddQrcodePrinter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
