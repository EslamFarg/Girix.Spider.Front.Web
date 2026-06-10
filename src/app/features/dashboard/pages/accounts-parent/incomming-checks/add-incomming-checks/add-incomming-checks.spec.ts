import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddIncommingChecks } from './add-incomming-checks';

describe('AddIncommingChecks', () => {
  let component: AddIncommingChecks;
  let fixture: ComponentFixture<AddIncommingChecks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddIncommingChecks],
    }).compileComponents();

    fixture = TestBed.createComponent(AddIncommingChecks);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
