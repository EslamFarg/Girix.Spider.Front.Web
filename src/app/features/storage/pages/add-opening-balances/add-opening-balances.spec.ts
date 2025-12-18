import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOpeningBalances } from './add-opening-balances';

describe('AddOpeningBalances', () => {
  let component: AddOpeningBalances;
  let fixture: ComponentFixture<AddOpeningBalances>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddOpeningBalances]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddOpeningBalances);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
