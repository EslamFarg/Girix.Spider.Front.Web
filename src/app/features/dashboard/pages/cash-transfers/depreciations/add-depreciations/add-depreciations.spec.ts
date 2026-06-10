import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDepreciations } from './add-depreciations';

describe('AddDepreciations', () => {
  let component: AddDepreciations;
  let fixture: ComponentFixture<AddDepreciations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDepreciations],
    }).compileComponents();

    fixture = TestBed.createComponent(AddDepreciations);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
