import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerQrcodePrinter } from './explorer-qrcode-printer';

describe('ExplorerQrcodePrinter', () => {
  let component: ExplorerQrcodePrinter;
  let fixture: ComponentFixture<ExplorerQrcodePrinter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerQrcodePrinter],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerQrcodePrinter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
