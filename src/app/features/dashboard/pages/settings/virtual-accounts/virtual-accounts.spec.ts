import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualAccounts } from './virtual-accounts';

describe('VirtualAccounts', () => {
  let component: VirtualAccounts;
  let fixture: ComponentFixture<VirtualAccounts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VirtualAccounts],
    }).compileComponents();

    fixture = TestBed.createComponent(VirtualAccounts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
