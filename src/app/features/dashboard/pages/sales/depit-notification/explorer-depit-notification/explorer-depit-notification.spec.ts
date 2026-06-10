import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerDepitNotification } from './explorer-depit-notification';

describe('ExplorerDepitNotification', () => {
  let component: ExplorerDepitNotification;
  let fixture: ComponentFixture<ExplorerDepitNotification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerDepitNotification],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerDepitNotification);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
