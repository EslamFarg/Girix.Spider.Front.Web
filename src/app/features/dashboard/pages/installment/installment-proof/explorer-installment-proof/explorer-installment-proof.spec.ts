import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerInstallmentProof } from './explorer-installment-proof';

describe('ExplorerInstallmentProof', () => {
  let component: ExplorerInstallmentProof;
  let fixture: ComponentFixture<ExplorerInstallmentProof>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerInstallmentProof],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerInstallmentProof);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
