import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAddition } from './add-addition';

describe('AddAddition', () => {
  let component: AddAddition;
  let fixture: ComponentFixture<AddAddition>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddAddition],
    }).compileComponents();

    fixture = TestBed.createComponent(AddAddition);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
