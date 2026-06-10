import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountsParent } from './accounts-parent';

describe('AccountsParent', () => {
  let component: AccountsParent;
  let fixture: ComponentFixture<AccountsParent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountsParent],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountsParent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
