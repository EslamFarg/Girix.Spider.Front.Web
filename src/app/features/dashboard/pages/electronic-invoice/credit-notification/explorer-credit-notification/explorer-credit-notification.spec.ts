import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerCreditNotification } from './explorer-credit-notification';

describe('ExplorerCreditNotification', () => {
  let component: ExplorerCreditNotification;
  let fixture: ComponentFixture<ExplorerCreditNotification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerCreditNotification],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerCreditNotification);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
