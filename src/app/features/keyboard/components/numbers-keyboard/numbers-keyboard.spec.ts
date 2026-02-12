import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NumbersKeyboard } from './numbers-keyboard';

describe('NumbersKeyboard', () => {
  let component: NumbersKeyboard;
  let fixture: ComponentFixture<NumbersKeyboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NumbersKeyboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NumbersKeyboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
