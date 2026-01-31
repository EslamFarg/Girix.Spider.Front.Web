import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputErrorMessageHandler } from './input-error-message-handler';

describe('InputErrorMessageHandler', () => {
  let component: InputErrorMessageHandler;
  let fixture: ComponentFixture<InputErrorMessageHandler>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputErrorMessageHandler]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputErrorMessageHandler);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
