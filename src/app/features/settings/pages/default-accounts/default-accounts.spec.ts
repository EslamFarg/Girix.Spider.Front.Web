import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultAccounts } from './default-accounts';

describe('DefaultAccounts', () => {
  let component: DefaultAccounts;
  let fixture: ComponentFixture<DefaultAccounts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefaultAccounts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DefaultAccounts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
