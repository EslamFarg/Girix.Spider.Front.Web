import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPurchases } from './add-purchases';

describe('AddPurchases', () => {
  let component: AddPurchases;
  let fixture: ComponentFixture<AddPurchases>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPurchases]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPurchases);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
