import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOpeningBalance } from './add-opening-balance';

describe('AddOpeningBalance', () => {
  let component: AddOpeningBalance;
  let fixture: ComponentFixture<AddOpeningBalance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddOpeningBalance],
    }).compileComponents();

    fixture = TestBed.createComponent(AddOpeningBalance);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
