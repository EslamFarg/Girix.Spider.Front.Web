import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfPrinter } from './pdf-printer';

describe('PdfPrinter', () => {
  let component: PdfPrinter;
  let fixture: ComponentFixture<PdfPrinter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfPrinter],
    }).compileComponents();

    fixture = TestBed.createComponent(PdfPrinter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
