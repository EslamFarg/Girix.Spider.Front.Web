import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSuppliers } from './add-suppliers';

describe('AddSuppliers', () => {
  let component: AddSuppliers;
  let fixture: ComponentFixture<AddSuppliers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSuppliers],
    }).compileComponents();

    fixture = TestBed.createComponent(AddSuppliers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
