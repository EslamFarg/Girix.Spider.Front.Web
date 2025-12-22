import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCollectiveReceipt } from './add-collective-receipt';

describe('AddCollectiveReceipt', () => {
  let component: AddCollectiveReceipt;
  let fixture: ComponentFixture<AddCollectiveReceipt>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCollectiveReceipt]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCollectiveReceipt);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
