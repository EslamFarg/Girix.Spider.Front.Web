import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddInternalExchangePermit } from './add-internal-exchange-permit';

describe('AddInternalExchangePermit', () => {
  let component: AddInternalExchangePermit;
  let fixture: ComponentFixture<AddInternalExchangePermit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddInternalExchangePermit],
    }).compileComponents();

    fixture = TestBed.createComponent(AddInternalExchangePermit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
