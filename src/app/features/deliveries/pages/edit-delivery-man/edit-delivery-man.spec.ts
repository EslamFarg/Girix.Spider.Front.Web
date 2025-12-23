import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDeliveryMan } from './edit-delivery-man';

describe('EditDeliveryMan', () => {
  let component: EditDeliveryMan;
  let fixture: ComponentFixture<EditDeliveryMan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditDeliveryMan]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditDeliveryMan);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
