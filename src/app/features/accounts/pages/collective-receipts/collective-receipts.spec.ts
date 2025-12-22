import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectiveReceipts } from './collective-receipts';

describe('CollectiveReceipts', () => {
  let component: CollectiveReceipts;
  let fixture: ComponentFixture<CollectiveReceipts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectiveReceipts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollectiveReceipts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
