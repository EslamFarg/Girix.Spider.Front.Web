import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTheDelegate } from './add-the-delegate';

describe('AddTheDelegate', () => {
  let component: AddTheDelegate;
  let fixture: ComponentFixture<AddTheDelegate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTheDelegate],
    }).compileComponents();

    fixture = TestBed.createComponent(AddTheDelegate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
