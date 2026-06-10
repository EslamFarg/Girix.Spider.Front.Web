import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneratePdf } from './generate-pdf';

describe('GeneratePdf', () => {
  let component: GeneratePdf;
  let fixture: ComponentFixture<GeneratePdf>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneratePdf],
    }).compileComponents();

    fixture = TestBed.createComponent(GeneratePdf);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
