import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallmentProof } from './installment-proof';

describe('InstallmentProof', () => {
  let component: InstallmentProof;
  let fixture: ComponentFixture<InstallmentProof>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstallmentProof],
    }).compileComponents();

    fixture = TestBed.createComponent(InstallmentProof);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
