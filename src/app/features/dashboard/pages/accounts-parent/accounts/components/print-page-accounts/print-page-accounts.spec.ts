import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintPageAccounts } from './print-page-accounts';

describe('PrintPageAccounts', () => {
  let component: PrintPageAccounts;
  let fixture: ComponentFixture<PrintPageAccounts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrintPageAccounts],
    }).compileComponents();

    fixture = TestBed.createComponent(PrintPageAccounts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
