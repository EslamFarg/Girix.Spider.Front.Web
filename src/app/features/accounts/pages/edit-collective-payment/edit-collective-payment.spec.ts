import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCollectivePayment } from './edit-collective-payment';

describe('EditCollectivePayment', () => {
  let component: EditCollectivePayment;
  let fixture: ComponentFixture<EditCollectivePayment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCollectivePayment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditCollectivePayment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
