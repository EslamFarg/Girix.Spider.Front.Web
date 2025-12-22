import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCollectiveReceipt } from './edit-collective-receipt';

describe('EditCollectiveReceipt', () => {
  let component: EditCollectiveReceipt;
  let fixture: ComponentFixture<EditCollectiveReceipt>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCollectiveReceipt]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditCollectiveReceipt);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
